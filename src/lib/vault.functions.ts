import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3.8-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function gatewayError(status: number, body: string) {
  if (status === 429) return new Error("AI is busy right now. Please try again in a moment.");
  if (status === 402) return new Error("AI credits are exhausted. Add credits to keep using Ask Your Vault.");
  if (status === 403) return new Error("AI access is blocked for this workspace.");
  return new Error(`AI request failed (${status}): ${body.slice(0, 160)}`);
}

async function callGateway(body: unknown) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw gatewayError(res.status, await res.text());
  const json = await res.json();
  return (json?.choices?.[0]?.message?.content as string) ?? "";
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        /* ignore */
      }
    }
    return fallback;
  }
}

/** OCR / content extraction for one file, across whichever cloud it came from. */
export const indexFileText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fileId: string }) => {
    if (!input?.fileId) throw new Error("fileId required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: file } = await context.supabase
      .from("files")
      .select("id,filename,file_type,storage_path,source_provider")
      .eq("id", data.fileId)
      .maybeSingle();
    if (!file) throw new Error("File not found");

    const type = (file.file_type ?? "").toLowerCase();
    const isImage = type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.filename);

    if (!file.storage_path || !isImage) {
      await context.supabase.from("file_text_index").upsert(
        {
          user_id: context.userId,
          file_id: file.id,
          content: "",
          status: "unsupported",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "file_id" },
      );
      return { status: "unsupported" as const, characters: 0 };
    }

    const { data: signed } = await context.supabase.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, 600);
    if (!signed?.signedUrl) throw new Error("Could not read the file");

    const content = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You extract readable text from images and scanned documents. Reply with the extracted text only. If there is no readable text, describe the image in one short sentence.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract all readable text from this file named "${file.filename}".` },
            { type: "image_url", image_url: { url: signed.signedUrl } },
          ],
        },
      ],
    });

    const text = (content ?? "").trim().slice(0, 20000);
    await context.supabase.from("file_text_index").upsert(
      {
        user_id: context.userId,
        file_id: file.id,
        content: text,
        status: "indexed",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "file_id" },
    );
    return { status: "indexed" as const, characters: text.length };
  });

export type AskAnswer = {
  answer: string;
  sources: { id: string; filename: string; source_provider: string }[];
};

/** Natural-language question answered over file names + extracted content from every connected cloud. */
export const askVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { question: string }) => {
    const q = (input?.question ?? "").trim();
    if (!q) throw new Error("Ask a question first");
    return { question: q.slice(0, 500) };
  })
  .handler(async ({ data, context }): Promise<AskAnswer> => {
    const { data: files } = await context.supabase
      .from("files")
      .select("id,filename,file_type,size_bytes,source_provider,uploaded_at")
      .eq("user_id", context.userId)
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false })
      .limit(300);

    const rows = files ?? [];
    if (rows.length === 0) {
      return { answer: "Your vault is empty, so there is nothing to search yet. Upload a file to get started.", sources: [] };
    }

    const { data: texts } = await context.supabase
      .from("file_text_index")
      .select("file_id,content")
      .eq("user_id", context.userId)
      .limit(300);
    const textMap = new Map((texts ?? []).map((t) => [t.file_id, t.content ?? ""]));

    const catalogue = rows
      .map((f) => {
        const excerpt = (textMap.get(f.id) ?? "").replace(/\s+/g, " ").slice(0, 600);
        return `id=${f.id} | name=${f.filename} | cloud=${f.source_provider} | type=${f.file_type ?? "unknown"} | uploaded=${String(f.uploaded_at).slice(0, 10)}${excerpt ? ` | content="${excerpt}"` : ""}`;
      })
      .join("\n");

    const raw = await callGateway({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Ask Your Vault, an assistant that searches a user's files across every connected cloud (Google Drive, Dropbox, OneDrive, WhatsApp imports and direct uploads). " +
            "Answer the question using only the catalogue provided. Be concise and specific, mention which cloud a file is stored in, and never invent files. " +
            'Respond with raw JSON: {"answer": string, "source_file_ids": string[]}. If nothing matches, say so plainly and return an empty list.',
        },
        { role: "user", content: `Question: ${data.question}\n\nCatalogue:\n${catalogue}` },
      ],
    });

    const parsed = parseJson<{ answer?: string; source_file_ids?: string[] }>(raw, {});
    const ids = new Set(parsed.source_file_ids ?? []);
    return {
      answer: parsed.answer ?? "I could not find an answer in your vault.",
      sources: rows
        .filter((f) => ids.has(f.id))
        .slice(0, 6)
        .map((f) => ({ id: f.id, filename: f.filename, source_provider: f.source_provider })),
    };
  });
