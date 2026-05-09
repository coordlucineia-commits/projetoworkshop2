import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import type { StaffPermKey } from "../../lib/staffPermKeys";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";

export function AdminPageFrame(props: {
  perm: StaffPermKey;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { ready, checking } = useRequireAdmin();
  const guard = useStaffPermissionGuard(props.perm);

  if (checking || guard.checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "system-ui", fontSize: 12 }}>
        Verificando acesso...
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen overflow-x-hidden pb-[72px] md:pb-0"
      style={{ background: "#0A0A0A", color: "#F5F5F5", width: "100%", maxWidth: "100%" }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 px-4 md:px-10 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">{props.title}</h1>
            {props.subtitle ? (
              <p className="text-sm mt-2" style={{ color: "#707070" }}>
                {props.subtitle}
              </p>
            ) : null}
          </div>
          {props.actions}
        </header>
        <div className="flex-1 min-h-0">{props.children}</div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
