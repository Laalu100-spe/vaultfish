import { Cloud, HardDrive, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropboxIcon, GoogleDriveIcon, OneDriveIcon } from "./PlatformIcons";
import type { ConnectedAccount } from "@/hooks/useConnectedAccounts";
import type { FileRow } from "@/hooks/useFiles";

const ACCOUNT_TINTS = ["#4d90fe", "#2dd4bf", "#f59e0b", "#f472b6", "#a78bfa"];

function hashAccount(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return ACCOUNT_TINTS[Math.abs(hash) % ACCOUNT_TINTS.length];
}

export function accountForFile(file: FileRow, accounts: ConnectedAccount[]) {
  return accounts.find((account) => account.id === file.source_account_id) ?? null;
}

export function sourceLabel(file: FileRow, account: ConnectedAccount | null) {
  if (account) return `${account.email} · ${account.platform === "google_drive" ? "Google Drive" : account.platform === "dropbox" ? "Dropbox" : "OneDrive"}`;
  if (file.source_provider === "whatsapp_import" || file.source_provider === "whatsapp") return "WhatsApp import";
  if (file.source_provider === "upload") return "VaultFish upload";
  return "Cloud file";
}

function SourceIcon({ provider, color }: { provider: string; color: string }) {
  if (provider === "google_drive") return <GoogleDriveIcon size={15} />;
  if (provider === "dropbox") return <DropboxIcon size={15} />;
  if (provider === "onedrive") return <OneDriveIcon size={15} />;
  if (provider === "whatsapp_import" || provider === "whatsapp") return <MessageCircle size={14} color={color} />;
  if (provider === "upload") return <HardDrive size={14} color={color} />;
  return <Cloud size={14} color={color} />;
}

export function ProviderBadge({ file, accounts, compact = false }: { file: FileRow; accounts: ConnectedAccount[]; compact?: boolean }) {
  const account = accountForFile(file, accounts);
  const sameProviderCount = account
    ? accounts.filter((candidate) => candidate.platform === account.platform).length
    : 0;
  const tint = hashAccount(account?.id ?? file.source_provider);
  const initial = account?.email.trim().charAt(0).toUpperCase() ?? "";
  const label = sourceLabel(file, account);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Source: ${label}`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="vf-provider-badge"
          style={{ width: compact ? 25 : 29, height: compact ? 25 : 29, borderColor: tint }}
        >
          <SourceIcon provider={file.source_provider} color={tint} />
          {sameProviderCount > 1 && (
            <span className="vf-provider-initial" style={{ background: tint }}>{initial}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={7}
        className="vf-provider-popover"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="vf-provider-dot" style={{ background: tint }} />
        <span className="min-w-0 truncate">{label}</span>
      </PopoverContent>
    </Popover>
  );
}