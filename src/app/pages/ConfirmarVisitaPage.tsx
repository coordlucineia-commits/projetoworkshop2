import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

export function ConfirmarVisitaPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [nome, setNome] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!id) {
      setStatus("err");
      setMessage("Link inválido. Confira o convite enviado no WhatsApp.");
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus("err");
      setMessage("Serviço indisponível: Supabase não configurado.");
      return;
    }

    let cancelled = false;
    async function run() {
      setStatus("loading");
      const supabase = getSupabase();
      const { data: raw, error } = await supabase.rpc(
        "confirmar_visita_por_id",
        { p_id: id },
      );
      if (cancelled) return;
      if (error) {
        setStatus("err");
        setMessage(error.message);
        return;
      }
      const res = raw as unknown as {
        ok?: boolean;
        nome?: string;
        error?: string;
      };
      if (!res?.ok) {
        setStatus("err");
        setMessage(
          typeof res?.error === "string"
            ? res.error
            : "Não foi possível confirmar esta visita.",
        );
        return;
      }
      setNome(typeof res.nome === "string" ? res.nome : null);
      setStatus("ok");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const primeiroNome = nome?.trim().split(/\s+/)[0] ?? "";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{
        background: "#0A0A0A",
        color: "#FFFFFF",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center p-10"
        style={{
          borderRadius: "16px",
          background: "#111111",
          border: "1px solid #2A2A2A",
        }}
      >
        {status === "loading" ? (
          <p className="text-[#AAAAAA]">Confirmando sua presença…</p>
        ) : status === "ok" ? (
          <>
            <div
              className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{
                border: "2px solid #00F9E4",
                color: "#00F9E4",
              }}
            >
              ✓
            </div>
            <h1 className="font-black text-xl uppercase tracking-tight mb-4">
              Presença confirmada!
            </h1>
            <p className="text-[#AAAAAA] text-sm leading-relaxed">
              Te esperamos amanhã
              {primeiroNome ? `, ${primeiroNome}` : ""}.
            </p>
          </>
        ) : (
          <>
            <p className="text-[#EF4444] text-sm mb-4">{message}</p>
            <p className="text-[#6B6B6B] text-xs">
              Em caso de dúvida, fale com a recepção da LuTe Academy.
            </p>
          </>
        )}
        <p
          className="mt-8 text-center font-mono"
          style={{ fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.07em" }}
        >
          desenvolvido por{" "}
          <span style={{ color: "#4A4A4A", fontWeight: 700 }}>Lucineia Tenorio</span>
        </p>
      </motion.div>
    </div>
  );
}
