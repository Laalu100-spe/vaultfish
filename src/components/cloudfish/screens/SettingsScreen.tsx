import { useState } from "react";
import { Card, SectionTitle, Toggle } from "../ui";
import { ACCOUNTS } from "../data";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { Modal, ModalButton } from "../Modal";
import { DisconnectModal, type DisconnectTarget } from "../DisconnectModal";
import { ChevronRight, Info } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-label mb-2 px-1">{children}</h2>;
}

function Row({
  title,
  desc,
  right,
  onClick,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 text-left"
      style={{ padding: "14px 16px" }}
    >
      <div className="min-w-0">
        <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.92)" }}>
          {title}
        </div>
        {desc && (
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {desc}
          </div>
        )}
      </div>
      <div className="shrink-0">{right}</div>
    </Comp>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "6px 10px",
        color: "#fff",
        fontFamily: '"Inter", sans-serif',
        fontSize: 12,
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

type ConfirmKind = "encryption" | "twofa" | "disconnect" | null;

export function SettingsScreen() {
  // Security
  const [enc, setEnc] = useState(false);
  const [twofa, setTwofa] = useState(false);
  const [autoLock, setAutoLock] = useState("5 min");

  // Storage
  const [autoOpt, setAutoOpt] = useState(true);
  const [smartSplit, setSmartSplit] = useState(false);
  const [defaultUpload, setDefaultUpload] = useState(ACCOUNTS[0].email);
  const [cache, setCache] = useState(234);

  // Notifications
  const [notifStorage, setNotifStorage] = useState(true);
  const [notifDup, setNotifDup] = useState(true);
  const [notifReport, setNotifReport] = useState(false);

  // Appearance
  const [compact, setCompact] = useState(false);
  const [showDarkTip, setShowDarkTip] = useState(false);

  // Modals
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [clearedNotice, setClearedNotice] = useState(false);

  return (
    <div className="space-y-7">
      <SectionTitle>Settings</SectionTitle>

      {/* Accounts */}
      <div>
        <SectionLabel>Accounts</SectionLabel>
        <Card className="divide-y divide-border">
          {accounts.map((a) => (
            <Row
              key={a.id}
              title={a.platform}
              desc={a.email}
              right={
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <PlatformIcon name={a.platform} size={16} />
                  </div>
                  <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
                    {a.used}/{a.total} GB
                  </span>
                  <button
                    onClick={() => {
                      setDisconnectId(a.id);
                      setConfirm("disconnect");
                    }}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#f87171",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(248,113,113,0.25)",
                      background: "rgba(248,113,113,0.06)",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              }
            />
          ))}
          <button
            className="w-full text-left"
            style={{
              padding: "14px 16px",
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              color: "#4d90fe",
              fontWeight: 500,
            }}
          >
            + Add Another Cloud
          </button>
        </Card>
      </div>

      {/* Security */}
      <div>
        <SectionLabel>Security & Encryption</SectionLabel>
        <Card className="divide-y divide-border">
          <Row
            title="End-to-end encryption"
            desc="Encrypt files before upload"
            right={
              <Toggle
                on={enc}
                onChange={(v) => {
                  if (v) setConfirm("encryption");
                  else setEnc(false);
                }}
              />
            }
          />
          <Row
            title="Two-factor authentication"
            desc="Require a second factor on sign-in"
            right={
              <Toggle
                on={twofa}
                onChange={(v) => {
                  if (v) setConfirm("twofa");
                  else setTwofa(false);
                }}
              />
            }
          />
          <Row
            title="Auto-lock timer"
            desc="Lock the app after inactivity"
            right={<Select value={autoLock} onChange={setAutoLock} options={["Never", "1 min", "5 min", "15 min"]} />}
          />
        </Card>
      </div>

      {/* Storage */}
      <div>
        <SectionLabel>Storage</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="Auto Optimize" desc="Distribute uploads automatically" right={<Toggle on={autoOpt} onChange={setAutoOpt} />} />
          <Row title="Smart Split" desc="Split large files across clouds" right={<Toggle on={smartSplit} onChange={setSmartSplit} />} />
          <Row
            title="Default upload destination"
            desc="Where new uploads go by default"
            right={<Select value={defaultUpload} onChange={setDefaultUpload} options={accounts.map((a) => a.email)} />}
          />
          <Row
            title="Cache size"
            desc={`${cache} MB used locally`}
            right={
              <button
                onClick={() => {
                  setCache(0);
                  setClearedNotice(true);
                }}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#4d90fe",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(77,144,254,0.3)",
                  background: "rgba(77,144,254,0.08)",
                }}
              >
                Clear Cache
              </button>
            }
          />
        </Card>
      </div>

      {/* Notifications */}
      <div>
        <SectionLabel>Notifications</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="Storage alerts" desc="When an account fills up" right={<Toggle on={notifStorage} onChange={setNotifStorage} />} />
          <Row title="Duplicate detection" desc="Notify when duplicates are found" right={<Toggle on={notifDup} onChange={setNotifDup} />} />
          <Row title="Weekly storage report" desc="Email summary every Monday" right={<Toggle on={notifReport} onChange={setNotifReport} />} />
        </Card>
      </div>

      {/* Appearance */}
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <Card className="divide-y divide-border">
          <Row
            title="Dark mode"
            desc="VaultFish is designed for dark mode"
            right={
              <div
                className="relative flex items-center gap-2"
                onMouseEnter={() => setShowDarkTip(true)}
                onMouseLeave={() => setShowDarkTip(false)}
              >
                <Info size={14} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.35)" }} />
                <Toggle on={true} onChange={() => setShowDarkTip(true)} disabled />
                {showDarkTip && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      right: 0,
                      whiteSpace: "nowrap",
                      background: "rgba(18,21,28,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 11,
                      color: "rgba(255,255,255,0.8)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    VaultFish is designed for dark mode
                  </div>
                )}
              </div>
            }
          />
          <Row title="Compact view" desc="Tighter spacing in lists" right={<Toggle on={compact} onChange={setCompact} />} />
        </Card>
      </div>

      {/* About */}
      <div>
        <SectionLabel>About</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="VaultFish" desc="Version 1.0.0 · Built by Talabros Technologies" right={null} />
          <Row title="Privacy Policy" right={<ChevronRight size={16} strokeWidth={1.5} className="text-muted" />} onClick={() => {}} />
          <Row title="Terms of Service" right={<ChevronRight size={16} strokeWidth={1.5} className="text-muted" />} onClick={() => {}} />
          <Row title="Rate the app" right={<ChevronRight size={16} strokeWidth={1.5} style={{ color: "#4d90fe" }} />} onClick={() => {}} />
        </Card>
      </div>

      {/* Modals */}
      <Modal
        open={confirm === "encryption"}
        onClose={() => setConfirm(null)}
        title="Enable Encryption"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancel</ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                setEnc(true);
                setConfirm(null);
              }}
            >
              Enable
            </ModalButton>
          </>
        }
      >
        Files will be encrypted before leaving your device. You will need your password to decrypt.
      </Modal>

      <Modal
        open={confirm === "twofa"}
        onClose={() => setConfirm(null)}
        title="Enable Two-Factor Authentication"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancel</ModalButton>
            <ModalButton
              variant="primary"
              onClick={() => {
                setTwofa(true);
                setConfirm(null);
              }}
            >
              Enable
            </ModalButton>
          </>
        }
      >
        Add an extra layer of security. You will need a code from your authenticator app to sign in.
      </Modal>

      <Modal
        open={confirm === "disconnect"}
        onClose={() => setConfirm(null)}
        title="Disconnect account"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancel</ModalButton>
            <ModalButton
              variant="danger"
              onClick={() => {
                setAccounts((prev) => prev.filter((a) => a.id !== disconnectId));
                setConfirm(null);
                setDisconnectId(null);
              }}
            >
              Disconnect
            </ModalButton>
          </>
        }
      >
        VaultFish will stop syncing this account. You can reconnect later from this screen.
      </Modal>

      <Modal
        open={clearedNotice}
        onClose={() => setClearedNotice(false)}
        title="Cache cleared"
        footer={<ModalButton variant="primary" onClick={() => setClearedNotice(false)}>OK</ModalButton>}
      >
        Local cache was successfully cleared.
      </Modal>

      {/* Use PLATFORM_COLORS to keep import alive in case future use */}
      <span style={{ display: "none" }} aria-hidden>{Object.keys(PLATFORM_COLORS).length}</span>
    </div>
  );
}
