import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Key for animate when switching panels (opcional). */
  motionKey?: string;
};

/**
 * Shell visual alinhado à LoginPage — fundo, card central e grid.
 */
export function LuTeGuestFormShell({ children, motionKey = "guest" }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10"
          style={{ background: "#00F9E4" }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative rounded-[16px] p-8 md:p-10"
          style={{
            background: "#0D0D0D",
            border: "1px solid #1E1E1E",
            boxShadow: "0 0 60px rgba(0,249,228,0.06)",
          }}
        >
          <div
            className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,249,228,0.4), transparent)" }}
          />
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function LuTeGuestLogoCompact() {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#00F9E4" }}>
        <span className="font-black text-base" style={{ color: "#0A0A0A" }}>LT</span>
      </div>
      <span className="text-2xl font-black tracking-tight text-white">
        Lu<span style={{ color: "#00F9E4" }}>Te</span>
      </span>
    </div>
  );
}

export function LuTeGuestFooterCredits() {
  return (
    <div className="mt-7 space-y-4">
      <p className="text-[10px] text-center uppercase tracking-wider font-mono" style={{ color: "#3A3A3A" }}>
        LuTe Academy
      </p>
      <p className="text-center font-mono" style={{ fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.07em" }}>
        desenvolvido por{" "}
        <span style={{ color: "#4A4A4A", fontWeight: 700 }}>Lucineia Tenorio</span>
      </p>
    </div>
  );
}
