import { LogOut } from "lucide-react";
import { initialsFromName } from "../../lib/displayHelpers";
import { cn } from "./ui/utils";

/** Avatar + nome + função (logo abaixo da marca, acima do menu). */
export function SidebarUserRow({
  displayName,
  roleLabelMono,
  className = "",
}: {
  displayName: string;
  roleLabelMono: string;
  className?: string;
}) {
  const initials = initialsFromName(displayName).slice(0, 2).toUpperCase() || "—";

  return (
    <div className={cn("px-5 py-4 border-b border-[#1E1E1E]", className)}>
      <div className="flex items-center gap-3 px-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#00F9E4" }}
        >
          <span className="font-bold text-[10px]" style={{ color: "#0A0A0A" }}>
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{displayName}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest truncate" style={{ color: "#606060" }}>
            {roleLabelMono}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Botão Sair na base da sidebar, acima do DevFooter. */
export function SidebarLogoutButton({
  onSignOut,
  className = "",
}: {
  onSignOut: () => void;
  className?: string;
}) {
  return (
    <div className={cn("px-3 pt-4 pb-2 border-t border-[#1E1E1E]", className)}>
      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-200"
        style={{ color: "#606060" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
      >
        <LogOut size={14} />
        Sair
      </button>
    </div>
  );
}

/** Compat: alguns imports antigos / HMR esperam este nome. */
export function SidebarProfileFooter({
  displayName,
  roleLabelMono,
  onSignOut,
  className = "",
}: {
  displayName: string;
  roleLabelMono: string;
  onSignOut: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <SidebarUserRow displayName={displayName} roleLabelMono={roleLabelMono} />
      <SidebarLogoutButton onSignOut={onSignOut} />
    </div>
  );
}
