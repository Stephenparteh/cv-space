import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminDashboard from "@/pages/AdminDashboard";
import ClaimGuestResume from "@/pages/ClaimGuestResume";
import Dashboard from "@/pages/Dashboard";
import Directory from "@/pages/Directory";
import GuestResumeBuilder from "@/pages/GuestResumeBuilder";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ProfileSettings from "@/pages/ProfileSettings";
import PublicProfile from "@/pages/PublicProfile";
import PublicResume from "@/pages/PublicResume";
import ResumeEditor from "@/pages/ResumeEditor";

// Data router (createBrowserRouter) so components can use useBlocker() to guard
// in-app navigation away from unsaved work.
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/settings/profile", element: <ProfileSettings /> },
      { path: "/resumes/:id/edit", element: <ResumeEditor /> },
      // Guest builder — no account required. State lives in this browser only.
      { path: "/build", element: <GuestResumeBuilder /> },
      // Reached via ?next= after a guest registers/logs in from the "Save
      // your resume" prompt; transfers the local guest résumé into the
      // account, then redirects on.
      { path: "/resumes/claim-guest", element: <ClaimGuestResume /> },
      // Admin-only; authorization is enforced server-side by the API, not here.
      { path: "/admin", element: <AdminDashboard /> },
      // Public, no auth required:
      { path: "/directory", element: <Directory /> },
      { path: "/r/:slug", element: <PublicResume /> },
      { path: "/profile/:slug", element: <PublicProfile /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
