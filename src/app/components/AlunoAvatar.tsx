import { initialsFromName } from "../../lib/displayHelpers";

export function AlunoAvatar({
  nome,
  src,
  size = 48,
}: {
  nome: string;
  src: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={nome}
        className="rounded-full object-cover"
        style={{
          width: size,
          height: size,
          border: "2px solid rgba(0, 249, 228, 0.2)",
        }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-sm shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1A1A1A, #2A2A2A)",
        border: "2px solid rgba(0, 249, 228, 0.2)",
        color: "#00F9E4",
      }}
    >
      {initialsFromName(nome)}
    </div>
  );
}
