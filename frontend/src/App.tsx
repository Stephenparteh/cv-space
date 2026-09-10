import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Directory from "@/pages/Directory";
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
