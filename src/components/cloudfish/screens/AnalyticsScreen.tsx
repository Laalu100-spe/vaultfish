import { Card, SectionTitle } from "../ui";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowRight } from "lucide-react";

const PIE = [
  { name: "Google Drive", value: 42, color: "#4285f4" },
  { name: "Dropbox", value: 22, color: "#ec4899" },
  { name: "OneDrive", value: 18, color: "#14b8a6" },
];

const TREND = Array.from({ length: 30 }, (_, i) => ({ d: `May ${i+1}`, v: Math.round(50 + i*1.1 + Math.sin(i/3)*4) }));

export function AnalyticsScreen() {
  return (
    <div className="space-y-6">
      <SectionTitle>Analytics</SectionTitle>
      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted mb-3">Storage Overview</div>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="relative h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={PIE} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={2} stroke="none">
                  {PIE.map(p => <Cell key={p.name} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-semibold">82 GB</div><div className="text-xs text-muted">Used</div>
            </div>
          </div>
          <div className="space-y-3">
            {PIE.map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                <div className="flex-1 text-sm">{p.name}</div>
                <div className="text-sm text-muted">{p.value} GB ({Math.round(p.value/82*100)}%)</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-xs uppercase tracking-wider text-muted">Storage Trend</div>
          <div className="text-xs text-muted">Last 30 days</div>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={TREND}>
              <CartesianGrid stroke="#2a2d35" vertical={false} />
              <XAxis dataKey="d" stroke="#6b7280" fontSize={10} ticks={["May 1","May 10","May 20","May 30"]} />
              <YAxis stroke="#6b7280" fontSize={10} unit="GB" />
              <Tooltip contentStyle={{ background: "#161a22", border: "1px solid #2a2d35", borderRadius: 8 }} />
              <Line type="monotone" dataKey="v" stroke="#4d90fe" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted mb-2">Recommendations</div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #4d90fe 0%, #6366f1 100%)", height: 40, width: 40, borderRadius: 10 }}><ArrowRight size={18} strokeWidth={1.5} /></div>
            <div>
              <div className="text-sm font-medium">Move 4 GB to Dropbox</div>
              <div className="text-xs text-muted">Balance your storage</div>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-[color:var(--accent-blue)] text-white text-sm font-medium">Move Now</button>
        </div>
      </Card>
    </div>
  );
}
