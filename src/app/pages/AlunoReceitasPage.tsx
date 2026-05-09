import { useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import {
  CATEGORIA_RECEITA_DB,
  LABEL_REFEICAO,
  LABEL_CATEGORIA,
  REFEICOES_RECEITA_DB,
  type RefeicaoReceitaDb,
} from "../../lib/contentLabels";

type Rec = Database["public"]["Tables"]["receitas"]["Row"];

export function AlunoReceitasPage() {
  const [cat, setCat] = useState<(typeof CATEGORIA_RECEITA_DB)[number]>("perda_peso");
  const [ref, setRef] = useState<RefeicaoReceitaDb>("cafe_manha");
  const [rows, setRows] = useState<Rec[]>([]);
  const [sel, setSel] = useState<Rec | null>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) return;
      const sb = getSupabase();
      const { data, error } = await sb
        .from("receitas")
        .select("*")
        .eq("categoria", cat)
        .eq("refeicao", ref)
        .order("nome");
      if (!error) setRows((data ?? []) as Rec[]);
    }
    void load();
  }, [cat, ref]);

  const filt = useMemo(() => rows.slice(0, 12), [rows]);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24">
      <h1 className="text-2xl font-black mb-2">Biblioteca de receitas</h1>
      <p className="text-sm mb-8" style={{ color: "#6B6B6B" }}>
        Conteúdo cadastrado pelo administrativo aparece aqui ao vivo.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        {CATEGORIA_RECEITA_DB.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase"
            style={{
              background: cat === c ? "#00F9E4" : "#1C1C1C",
              color: cat === c ? "#0A0A0A" : "#AAA",
              border: cat === c ? "none" : "1px solid #2A2A2A",
            }}
          >
            {LABEL_CATEGORIA[c]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {REFEICOES_RECEITA_DB.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRef(r)}
            className="px-3 py-2 rounded-full text-[11px] font-semibold"
            style={{
              background: ref === r ? "rgba(0,249,228,0.15)" : "#111",
              border: "1px solid #2A2A2A",
              color: ref === r ? "#00F9E4" : "#888",
            }}
          >
            {LABEL_REFEICAO[r]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filt.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSel(r)}
            className="text-left overflow-hidden border border-[#2A2A2A] hover:border-[#00F9E4] transition-colors"
            style={{ background: "#121212", borderRadius: 8, overflow: "hidden" }}
          >
            <img
              src={r.imagem_url}
              alt=""
              className="w-full h-36 object-cover"
              style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8, display: "block" }}
            />
            <div className="p-4">
              <p className="font-bold text-sm mb-2">{r.nome}</p>
              <p className="text-[11px]" style={{ color: "#666" }}>
                {r.calorias} kcal · P{r.proteinas_g}g · C{r.carboidratos_g}g · G{r.gorduras_g}g
              </p>
            </div>
          </button>
        ))}
      </div>

      {sel && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(0,0,0,.7)" }}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden border border-[#2A2A2A] max-h-[90vh] overflow-y-auto"
            style={{ background: "#161616", color: "#EEE" }}
          >
            <img src={sel.imagem_url} alt="" className="w-full h-48 object-cover" />
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-black">{sel.nome}</h2>
              <p className="text-sm whitespace-pre-line" style={{ color: "#AAA" }}>
                <strong style={{ color: "#00F9E4" }}>Ingredientes</strong>
                {"\n"}
                {sel.ingredientes}
              </p>
              <p className="text-sm whitespace-pre-line">{sel.modo_preparo}</p>
              <button
                type="button"
                className="w-full py-3 rounded-full font-bold text-[#0A0A0A]"
                style={{ background: "#00F9E4" }}
                onClick={() => setSel(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
