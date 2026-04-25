import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { NovoAlunoPage } from "./pages/NovoAlunoPage";
import { AlunosPage } from "./pages/AlunosPage";
import { CheckInsPage } from "./pages/CheckInsPage";
import { ModoRecepcaoPage } from "./pages/ModoRecepcaoPage";
import { ConfiguracoesPage } from "./pages/ConfiguracoesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/alunos",
    Component: AlunosPage,
  },
  {
    path: "/checkins",
    Component: CheckInsPage,
  },
  {
    path: "/recepcao",
    Component: ModoRecepcaoPage,
  },
  {
    path: "/config",
    Component: ConfiguracoesPage,
  },
  {
    path: "/cadastro",
    Component: NovoAlunoPage,
  },
  {
    path: "*",
    Component: LandingPage,
  },
]);