/** Crédito do desenvolvedor — aparece em todas as páginas do sistema. */
export function DevFooter({ className }: { className?: string }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#3A3A3A",
        textAlign: "center",
        letterSpacing: "0.08em",
        userSelect: "none",
      }}
    >
      desenvolvido por{" "}
      <span style={{ color: "#555555", fontWeight: 700 }}>Lucineia Tenorio</span>
    </p>
  );
}
