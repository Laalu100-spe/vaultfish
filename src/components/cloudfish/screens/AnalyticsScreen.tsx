import { useMemo } from "react";
import { Card, SectionTitle } from "../ui";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useFiles, categorizeFile, formatBytes, type FileCategory } from "@/hooks/useFiles";

const CAT_COLOR: Record<FileCategory, string> = {
  photos: "#4d90fe",
  videos: "#a78bfa",
  documents: "#2dd4bf",
  apk: "#facc15",
  downloads: "#f472b6",
  other: "#6b7280",
};

const CAT_LABEL: Record<FileCategory, string> = {
  photos: "Photos", videos: "Videos", documents: "Documents",
  apk: "APK", downloads: "Downloads", other: "Other",
};

export function AnalyticsScreen() {
  const { files, loading } = useFiles();

  const pie = useMemo(() => {
    const map = new Map<FileCategory, number>();
    for (const f of files) {
      const c = categorizeFile(f);
      map.set(c, (map.get(c) ?? 0) + Number(f.file_size));
    }
    return Array.from(map.entries()).map(([k, v]) => ({ name: CAT_LABEL[k], value: v, color: CAT_COLOR[k] }));
  }, [files]);

  const total = pie.reduce((s, p) => s + p.value, 0);

  const trend = useMemo(() => {
    const days: { d: string; v: number }[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now - i * 86400000);
      const key = day.toISOString().slice(0, 10);
      const count = files.filter((f) => f.created_at.slice(0, 10) <= key).length;
      days.push({ d: `${day.getMonth() + 1}/${day.getDate()}`, v: count });
    }
    return days;
  }, [files]);

  if (loading) return <div className="text-muted text-sm">Loading…</div>;

  if (files.length === 0) {
    return (
      <div className="space-y-6">
        <SectionTitle>Analytics</SectionTitle>
        <Card className="p-10 text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>No data yet</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Upload files to see your storage analytics</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Analytics</SectionTitle>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted mb-3">Storage by type</div>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="relative h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={2} stroke="none">
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-semibold">{formatBytes(total)}</div>
              <div className="text-xs text-muted">Used</div>
            </div>
          </div>
          <div className="space-y-3">
            {pie.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                <div className="flex-1 text-sm">{p.name}</div>
                <div className="text-sm text-muted">
                  {formatBytes(p.value)} ({Math.round((p.value / total) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-xs uppercase tracking-wider text-muted">File count · last 30 days</div>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid stroke="#2a2d35" vertical={false} />
              <XAxis dataKey="d" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ background: "#161a22", border: "1px solid #2a2d35", borderRadius: 8 }} />
              <Line type="monotone" dataKey="v" stroke="#4d90fe" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
