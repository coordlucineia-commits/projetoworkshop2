import { Save } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SavePrimaryPreset = "hero" | "form" | "formWide" | "toolbar" | "inline" | "professorNav";

const PRESET_CLASS: Record<SavePrimaryPreset, string> = {
  hero:
    "w-full lg:w-fit px-28 py-5 rounded-full uppercase font-black text-sm inline-flex items-center justify-center gap-2",
  form: "rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2",
  formWide: "rounded-full px-8 py-3 text-xs font-black uppercase inline-flex items-center justify-center gap-2",
  toolbar:
    "shrink-0 px-5 rounded-full uppercase text-sm font-black inline-flex items-center justify-center gap-2 h-[42px] min-h-[42px]",
  inline:
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0",
  /** Mesmo peso/visual do item ativo em `ProfessorLayout` (ex.: Treinos). */
  professorNav:
    "w-full lg:w-fit inline-flex items-center gap-3 px-[27px] py-3 rounded-full text-sm transition-colors font-bold justify-center",
};

export type SavePrimaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  /** `hero`: CTA grande; `professorNav`: mesmo estilo da sidebar professor; `form` / `formWide`: admin; `toolbar`; `inline`. */
  preset?: SavePrimaryPreset;
  iconSize?: number;
};

export function SavePrimaryButton({
  loading,
  loadingLabel = "Salvando…",
  preset = "form",
  iconSize,
  disabled,
  className = "",
  children,
  type = "button",
  style,
  ...rest
}: SavePrimaryButtonProps) {
  const iSize =
    iconSize ??
    (preset === "hero"
      ? 18
      : preset === "professorNav"
        ? 17
        : preset === "toolbar"
          ? 14
          : preset === "inline"
            ? 11
            : 14);
  const presetCls = PRESET_CLASS[preset];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${presetCls} disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
      style={{
        background: "#00F9E4",
        color: "#0A0A0A",
        ...style,
      }}
      {...rest}
    >
      {!loading ? <Save size={iSize} strokeWidth={2.25} aria-hidden /> : null}
      {loading ? loadingLabel : children}
    </button>
  );
}
