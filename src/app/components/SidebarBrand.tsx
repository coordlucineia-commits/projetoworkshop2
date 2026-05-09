import { cn } from "./ui/utils";

/** Marca LT + LuTe — mesma identidade visual nas áreas autenticadas (admin, colaborador, professor, aluno). */
export function SidebarBrand({
  onNavigateHome,
  className,
}: {
  onNavigateHome: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("px-5 py-6 cursor-pointer border-b border-[#1E1E1E]", className)}
      onClick={onNavigateHome}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigateHome();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#00F9E4" }}
        >
          <span className="font-black text-sm" style={{ color: "#0A0A0A" }}>
            LT
          </span>
        </div>
        <div>
          <p className="font-black tracking-tight text-base leading-tight text-white">
            Lu<span style={{ color: "#00F9E4" }}>Te</span>
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#606060" }}>
            Painel LuTe
          </p>
        </div>
      </div>
    </div>
  );
}
