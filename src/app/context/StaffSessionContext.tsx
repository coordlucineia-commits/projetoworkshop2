import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { StaffPermKey, StaffPermissions } from "../../lib/staffPermKeys";
import { STAFF_PERM_KEYS } from "../../lib/staffPermKeys";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

export type StaffRoleInApp = "super_admin" | "colaborador" | "none";

export type StaffSessionState = {
  loading: boolean;
  role: StaffRoleInApp;
  permissoes: StaffPermissions;
  colabId: string | null;
  perfilNome: string | null;
  refresh: () => Promise<void>;
};

const defaultCtx: StaffSessionState = {
  loading: true,
  role: "none",
  permissoes: {},
  colabId: null,
  perfilNome: null,
  refresh: async () => {},
};

const StaffSessionContext = createContext<StaffSessionState>(defaultCtx);

export function parseStaffContext(
  payload: Record<string, unknown> | null,
): Omit<StaffSessionState, "loading" | "refresh"> {
  if (!payload) {
    return { role: "none", permissoes: {}, colabId: null, perfilNome: null };
  }
  const roleRaw = typeof payload.role === "string" ? payload.role.trim() : "none";
  const role =
    roleRaw === "super_admin"
      ? "super_admin"
      : roleRaw === "colaborador"
        ? "colaborador"
        : ("none" as StaffRoleInApp);

  let permissoes: StaffPermissions = {};
  if (payload.perm && typeof payload.perm === "object" && payload.perm !== null) {
    const p = payload.perm as Record<string, unknown>;
    for (const k of STAFF_PERM_KEYS) {
      if (p[k] === true) permissoes[k] = true;
    }
    if (role === "super_admin") {
      for (const k of STAFF_PERM_KEYS) permissoes[k] = true;
    }
  } else if (role === "super_admin") {
    for (const k of STAFF_PERM_KEYS) permissoes[k] = true;
  }

  const colabId =
    typeof payload.colab_id === "string" && payload.colab_id.length ? payload.colab_id : null;
  const perfilNome =
    typeof payload.perfil_nome === "string" && payload.perfil_nome.trim().length > 0
      ? payload.perfil_nome
      : null;

  return { role, permissoes, colabId, perfilNome };
}

export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<StaffRoleInApp>("none");
  const [permissoes, setPermissoes] = useState<StaffPermissions>({});
  const [colabId, setColabId] = useState<string | null>(null);
  const [perfilNome, setPerfilNome] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setRole("none");
      setPermissoes({});
      setColabId(null);
      setPerfilNome(null);
      return;
    }
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setRole("none");
      setPermissoes({});
      setColabId(null);
      setPerfilNome(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("meu_staff_context");
    setLoading(false);
    if (error) {
      console.warn("[meu_staff_context]", error.message);
      setRole("none");
      setPermissoes({});
      setColabId(null);
      setPerfilNome(null);
      return;
    }
    const row = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const parsed = parseStaffContext(row);
    setRole(parsed.role);
    setPermissoes(parsed.permissoes);
    setColabId(parsed.colabId);
    setPerfilNome(parsed.perfilNome);

    if (parsed.role === "colaborador") {
      void supabase.rpc("colaboradores_registrar_acesso");
    }
  }, []);

  useEffect(() => {
    void load();
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => subscription.unsubscribe();
  }, [load]);

  const value = useMemo<StaffSessionState>(
    () => ({
      loading,
      role,
      permissoes,
      colabId,
      perfilNome,
      refresh: load,
    }),
    [loading, role, permissoes, colabId, perfilNome, load],
  );

  return <StaffSessionContext.Provider value={value}>{children}</StaffSessionContext.Provider>;
}

export function useStaffSession() {
  return useContext(StaffSessionContext);
}

export function staffHasPerm(role: StaffRoleInApp, perms: StaffPermissions, key: StaffPermKey): boolean {
  if (role === "super_admin") return true;
  if (role !== "colaborador") return false;
  return !!perms[key];
}
