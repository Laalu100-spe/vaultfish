import { createServerFn } from "@tanstack/react-start";

type PhotoMeta = {
  name: string;
  type: string;
  account: string;
  date: string;
  size: string;
};

type AIResponse = {
  summary: string;
  account_detail: string;
  smart_action: string;
  insight: string;
  emoji: string;
};

export const analyzePhoto = createServerFn({ method: "POST" })
  .inputValidator((input: PhotoMeta) => {
    if (!input || typeof input.name !== "string") throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data }): Promise<AIResponse> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const system =
      "You are analyzing a file in a cloud storage app called VaultFish. " +
      "Given this file's metadata, generate a brief intelligent insight card about this file. " +
      "Include: a one-line summary of what this file likely is, when it was last modified, " +
      "which cloud account it lives in, a smart action suggestion " +
      "(e.g. 'This file has not been opened in 8 months - consider archiving'), " +
      "and one interesting insight. " +
      "Respond ONLY with raw JSON (no markdown fences) with fields: summary, account_detail, smart_action, insight, emoji.";

    const user = `Filename: ${data.name}
Type: ${data.type}
Account: ${data.account}
Date: ${data.date}
Size: ${data.size}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Partial<AIResponse> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    return {
      summary: parsed.summary ?? "A file in your cloud library.",
      account_detail: parsed.account_detail ?? `${data.account} · ${data.date}`,
      smart_action: parsed.smart_action ?? "Keep this file safe in your archive.",
      insight: parsed.insight ?? "This file is part of your media collection.",
      emoji: parsed.emoji ?? "🖼️",
    };
  });
