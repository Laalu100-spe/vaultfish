import { useState } from "react";
import { SectionTitle, Pill, Card } from "../ui";
import { FILES, TYPE_COLORS } from "../data";
import { MoreVertical } from "lucide-react";

const FILTERS = ["All Clouds", "saran@gmail", "college", "work", "dropbox"];

export function FilesScreen() {
  const [f, setF] = useState("All Clouds");
  const visible = f === "All Clouds" ? FILES : FILES.filter(x => x.account === f);

  return (
    <div className="space-y-5">
      <SectionTitle sub="Viewing across 5 accounts">All Files</SectionTitle>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(x => <Pill key={x} active={f === x} onClick={() => setF(x)}>{x}</Pill>)}
      </div>
      <div className="space-y-2">
        {visible.map((file, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: TYPE_COLORS[file.type] }}>
              {file.type.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white" style={{ background: file.accountColor }}>{file.account}</span>
                <span>{file.size}</span>
                <span>•</span>
                <span>{file.time}</span>
              </div>
            </div>
            <button className="p-2 text-muted hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
          </Card>
        ))}
        {visible.length === 0 && <div className="text-center text-muted py-12 text-sm">No files for this filter.</div>}
      </div>
    </div>
  );
}
