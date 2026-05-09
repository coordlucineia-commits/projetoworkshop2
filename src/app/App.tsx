import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { StaffSessionProvider } from "./context/StaffSessionContext";
import { router } from "./routes";

export default function App() {
  return (
    <StaffSessionProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" theme="dark" />
    </StaffSessionProvider>
  );
}
