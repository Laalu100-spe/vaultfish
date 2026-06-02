import { useMemo, useState } from "react";
import { Cloud, Play } from "lucide-react";

type Photo = {
  id: number;
  url: string;
  thumb: string;
  video: boolean;
  dur: string;
  tall: boolean;
  account: string;
  date: string;
  name: string;
};

const RAW = [
  { u: "photo-1506905925346-21bda4d32df4", n: "Mountain_Sunrise.jpg" },
  { u: "photo-1519681393784-d120267933ba", n: "Alpine_Lake.jpg" },
  { u: "photo-1500382017468-9049fed747ef", n: "Field_Light.jpg" },
  { u: "photo-1469474968028-56623f02e42e", n: "Open_Road.jpg" },
  { u: "photo-1470071459604-3b5ec3a7fe05", n: "Forest_Mist.jpg" },
  { u: "photo-1493246507139-91e8fad9978e", n: "Reflection.jpg" },
  { u: "photo-1418065460487-3e41a6c84dc5", n: "Sunset_Valley.jpg" },
  { u: "photo-1501785888041-af3ef285b470", n: "River_Bend.jpg" },
  { u: "photo-1502082553048-f009c37129b9", n: "Autumn_Trees.jpg" },
  { u: "photo-1447752875215-b2761acb3c5d", n: "Forest_Floor.jpg" },
  { u: "photo-1426604966848-d7adac402bff", n: "Cliffs.jpg" },
  { u: "photo-1485470733090-0aae1788d5af", n: "Bridge.jpg" },
  { u: "photo-1441974231531-c6227db76b6e", n: "Pine_Lake.jpg" },
  { u: "photo-1472214103451-9374bd1c798e", n: "Snow_Peak.jpg" },
  { u: "photo-1433086966358-54859d0ed716", n: "Waterfall.jpg" },
  { u: "photo-1439066615861-d1af74d74000", n: "Stars_Night.jpg" },
  { u: "photo-1454496522488-7a8e488e8606", n: "Desert_Dunes.jpg" },
  { u: "photo-1505765050516-f72dcac9c60e", n: "City_Skyline.jpg" },
  { u: "photo-1486312338219-ce68d2c6f44d", n: "Office_Window.jpg" },
  { u: "photo-1483347756197-71ef80e95f73", n: "Beach_Walk.jpg" },
  { u: "photo-1444723121867-7a241cacace9", n: "Coffee_Morning.jpg" },
  { u: "photo-1416879595882-3373a0480b5b", n: "Aerial_Coast.jpg" },
  { u: "photo-1500534314209-a25ddb2bd429", n: "Rolling_Hills.jpg" },
  { u: "photo-1518837695005-2083093ee35b", n: "Ocean_Wave.jpg" },
];
const ACCOUNTS = ["Google Drive", "Google Drive", "Dropbox", "OneDrive", "Google Drive"];
const DATES = ["May 4, 2026", "Apr 27, 2026", "Apr 12, 2026", "Mar 30, 2026", "Mar 14, 2026", "Feb 22, 2026"];

const ITEMS: Photo[] = RAW.map((r, i) => {
  const video = i % 7 === 3;
  return {
    id: i,
    url: `https://images.unsplash.com/${r.u}?w=1400&q=80&auto=format&fit=crop`,
    thumb: `https://images.unsplash.com/${r.u}?w=400&h=400&q=70&auto=format&fit=crop`,
    video,
    dur: ["0:12", "0:38", "0:28", "1:05"][i % 4],
    tall: (i + 1) % 5 === 0,
    account: ACCOUNTS[i % ACCOUNTS.length],
    date: DATES[i % DATES.length],
    name: r.n,
  };
});

type Filter = "all" | "photos" | "videos";
type Scale = "years" | "months" | "days";

function SourceIcon({ name }: { name: string }) {
  const color = name === "Dropbox" ? "#60a5fa" : name === "OneDrive" ? "#38bdf8" : "#4d90fe";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: 6,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
      }}
      title={name}
    >
      <Cloud size={11} color={color} />
    </div>
  );
}

export function GalleryScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const [scale, setScale] = useState<Scale>("months");
  const [open, setOpen] = useState<Photo | null>(null);

  const items = useMemo(() => {
    if (filter === "photos") return ITEMS.filter((i) => !i.video);
    if (filter === "videos") return ITEMS.filter((i) => i.video);
    return ITEMS;
  }, [filter]);

  return (
    <div style={{ padding: "16px 16px 96px", color: "#fff", fontFamily: '"Inter", sans-serif' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Gallery</h1>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {(["all", "photos", "videos"] as Filter[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textTransform: "capitalize",
                background: active ? "#4d90fe" : "rgba(255,255,255,0.06)",
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                border: "1px solid " + (active ? "#4d90fe" : "rgba(255,255,255,0.08)"),
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Timeline scrubber */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          padding: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          width: "fit-content",
        }}
      >
        {(["years", "months", "days"] as Scale[]).map((s) => {
          const active = scale === s;
          return (
            <button
              key={s}
              onClick={() => setScale(s)}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                textTransform: "capitalize",
                background: active ? "rgba(77,144,254,0.18)" : "transparent",
                color: active ? "#93c5fd" : "rgba(255,255,255,0.55)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* 3-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
        }}
      >
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setOpen(it)}
            style={{
              position: "relative",
              padding: 0,
              border: "none",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
              aspectRatio: it.tall ? "3 / 4" : "1 / 1",
              background: "rgba(255,255,255,0.04)",
              gridRow: it.tall ? "span 1" : "auto",
            }}
          >
            <img
              src={it.thumb}
              alt={it.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", top: 6, left: 6 }}>
              <SourceIcon name={it.account} />
            </div>
            {it.video && (
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 6px",
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.6)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                <Play size={10} fill="#fff" />
                {it.dur}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(6,8,15,0.96)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            cursor: "zoom-out",
          }}
        >
          <img
            src={open.url}
            alt={open.name}
            style={{ maxWidth: "100%", maxHeight: "80%", objectFit: "contain", borderRadius: 12 }}
          />
          <div style={{ marginTop: 16, textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{open.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
              {open.account} · {open.date}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
