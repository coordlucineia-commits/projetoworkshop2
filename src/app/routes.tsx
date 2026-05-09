import { createBrowserRouter, Navigate } from "react-router";
import { PrivateFallbackRoute } from "./components/PrivateFallbackRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RedefinirSenhaPage } from "./pages/RedefinirSenhaPage";
import { AgendarVisitaPage } from "./pages/AgendarVisitaPage";
import { ConfirmarVisitaPage } from "./pages/ConfirmarVisitaPage";

// Aluno layout + pages
import { AlunoLayout } from "./layouts/AlunoLayout";
import { AlunoDashboardPage } from "./pages/AlunoDashboardPage";
import { AlunoReceitasPage } from "./pages/AlunoReceitasPage";
import { AlunoExerciciosPage } from "./pages/AlunoExerciciosPage";
import { AlunoMeuTreinoPage } from "./pages/AlunoMeuTreinoPage";
import { AlunoTreinoHistoricoPage } from "./pages/AlunoTreinoHistoricoPage";
import { AlunoSessoesPage } from "./pages/AlunoSessoesPage";
import { AlunoAulasPage } from "./pages/AlunoAulasPage";
import { AlunoPerfilPage } from "./pages/AlunoPerfilPage";
import { AlunoMinhasAvaliacoesPage } from "./pages/AlunoMinhasAvaliacoesPage";
import { AlunoMenuMorePage } from "./pages/AlunoMenuMorePage";
import { AlunoCicloMenstrualPage } from "./pages/AlunoCicloMenstrualPage";

// Professor layout + pages
import { ProfessorLayout } from "./layouts/ProfessorLayout";
import { ProfessorDashboardPage } from "./pages/ProfessorDashboardPage";
import { ProfessorAvaliacoesPage } from "./pages/ProfessorAvaliacoesPage";
import { ProfessorAvaliacaoRegistrarPage } from "./pages/ProfessorAvaliacaoRegistrarPage";
import { ProfessorTreinosListaPage } from "./pages/ProfessorTreinosListaPage";
import { ProfessorTreinoNovoPage } from "./pages/ProfessorTreinoNovoPage";
import { ProfessorTreinoHistoricoAlunoPage } from "./pages/ProfessorTreinoHistoricoAlunoPage";
import { ProfessorSessoesPage } from "./pages/ProfessorSessoesPage";
import { ProfessorPerfilPage } from "./pages/ProfessorPerfilPage";

// Admin pages (flat — each has useRequireAdmin internally)
import { Dashboard } from "./components/Dashboard";
import { AlunosPage } from "./pages/AlunosPage";
import { NovoAlunoPage } from "./pages/NovoAlunoPage";
import { CheckInsPage } from "./pages/CheckInsPage";
import { AgendamentosPage } from "./pages/AgendamentosPage";
import { ConfiguracoesPage } from "./pages/ConfiguracoesPage";
import { AdminMenuMorePage } from "./pages/AdminMenuMorePage";
import { AdminProfessoresPage } from "./pages/AdminProfessoresPage";
import { AdminNovaProfessorPage } from "./pages/AdminNovaProfessorPage";
import { ProfessorPublicPage } from "./pages/ProfessorPublicPage";
import { AdminReceitasPage } from "./pages/AdminReceitasPage";
import { AdminReceitaFormPage } from "./pages/AdminReceitaFormPage";
import { AdminExerciciosPage } from "./pages/AdminExerciciosPage";
import { AdminExercicioFormPage } from "./pages/AdminExercicioFormPage";
import { AdminAulasPage } from "./pages/AdminAulasPage";
import { AdminAvaliacoesPage } from "./pages/AdminAvaliacoesPage";
import { AdminColaboradoresPage } from "./pages/AdminColaboradoresPage";
import { AdminColaboradorFormPage } from "./pages/AdminColaboradorFormPage";
import { AdminColaboradorDetailPage } from "./pages/AdminColaboradorDetailPage";

export const router = createBrowserRouter([
  // ── Rotas públicas ──────────────────────────────────────────────────────
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/nova-senha", Component: RedefinirSenhaPage },
  { path: "/agendar-visita", Component: AgendarVisitaPage },
  { path: "/confirmar-visita", Component: ConfirmarVisitaPage },

  // ── Aluno (/aluno/*) ────────────────────────────────────────────────────
  {
    path: "/aluno",
    Component: AlunoLayout,
    children: [
      { index: true, Component: AlunoDashboardPage },
      { path: "dashboard", Component: AlunoDashboardPage },
      { path: "receitas", Component: AlunoReceitasPage },
      { path: "exercicios", Component: AlunoExerciciosPage },
      { path: "meu-treino", Component: AlunoMeuTreinoPage },
      { path: "meu-treino/historico", Component: AlunoTreinoHistoricoPage },
      { path: "sessoes", Component: AlunoSessoesPage },
      { path: "aulas", Component: AlunoAulasPage },
      { path: "minhas-avaliacoes", Component: AlunoMinhasAvaliacoesPage },
      { path: "menu", Component: AlunoMenuMorePage },
      { path: "ciclo-menstrual", Component: AlunoCicloMenstrualPage },
      { path: "perfil", Component: AlunoPerfilPage },
    ],
  },

  // ── Professor (/professor/*) ─────────────────────────────────────────────
  {
    path: "/professor",
    Component: ProfessorLayout,
    children: [
      { index: true, Component: ProfessorDashboardPage },
      { path: "dashboard", Component: ProfessorDashboardPage },
      { path: "avaliacoes", Component: ProfessorAvaliacoesPage },
      { path: "avaliacoes/registrar/:agendaId", Component: ProfessorAvaliacaoRegistrarPage },
      { path: "treinos", Component: ProfessorTreinosListaPage },
      { path: "treinos/novo/:id", Component: ProfessorTreinoNovoPage },
      {
        path: "treinos/historico/:id",
        Component: ProfessorTreinoHistoricoAlunoPage,
      },
      { path: "receitas", Component: AlunoReceitasPage },
      { path: "sessoes", Component: ProfessorSessoesPage },
      { path: "perfil", Component: ProfessorPerfilPage },
    ],
  },

  // ── Admin (flat — sem layout wrapper) ───────────────────────────────────
  { path: "/403", element: <Navigate to="/login" replace /> },
  { path: "/dashboard", Component: Dashboard },
  { path: "/colaboradores/novo", Component: AdminColaboradorFormPage },
  { path: "/colaboradores/:id/editar", Component: AdminColaboradorFormPage },
  { path: "/colaboradores/:id", Component: AdminColaboradorDetailPage },
  { path: "/colaboradores", Component: AdminColaboradoresPage },
  { path: "/alunos", Component: AlunosPage },
  { path: "/cadastro/editar/:id", Component: NovoAlunoPage },
  { path: "/cadastro", Component: NovoAlunoPage },
  { path: "/checkins", Component: CheckInsPage },
  { path: "/agendamentos", Component: AgendamentosPage },
  { path: "/config", Component: ConfiguracoesPage },
  { path: "/admin/menu", Component: AdminMenuMorePage },
  { path: "/professores", Component: AdminProfessoresPage },
  { path: "/professores/novo", Component: AdminNovaProfessorPage },
  { path: "/professores/editar/:id", Component: AdminNovaProfessorPage },
  { path: "/professores/:id", Component: ProfessorPublicPage },
  { path: "/receitas", Component: AdminReceitasPage },
  { path: "/receitas/nova", Component: AdminReceitaFormPage },
  { path: "/receitas/editar/:id", Component: AdminReceitaFormPage },
  { path: "/exercicios", Component: AdminExerciciosPage },
  { path: "/exercicios/novo", Component: AdminExercicioFormPage },
  { path: "/exercicios/editar/:id", Component: AdminExercicioFormPage },
  { path: "/aulas", Component: AdminAulasPage },
  { path: "/avaliacoes", Component: AdminAvaliacoesPage },

  // ── Fallback (não é rota pública genérica — exige decisão por sessão) ─────
  { path: "*", Component: PrivateFallbackRoute },
]);
