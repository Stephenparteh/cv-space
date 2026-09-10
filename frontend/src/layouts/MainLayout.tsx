import { Link, Outlet, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasToken } from "@/services/authStorage";
import { logout } from "@/services/auth";

const MainLayout = () => {
  const navigate = useNavigate();
  const authed = hasToken();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4">
          <Link
            to={authed ? "/dashboard" : "/"}
            className="flex shrink-0 items-center gap-2 font-display text-lg font-bold"
            aria-label="Resume Builder home"
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Resume Builder</span>
          </Link>

          <nav className="flex min-w-0 items-center gap-0.5 text-sm sm:gap-1">
            <Link
              to="/directory"
              className="rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:text-foreground"
            >
              Directory
            </Link>
            {authed ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" className="px-2.5" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md px-2.5 py-2 font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-7xl border-t px-4 py-6 text-center text-sm text-muted-foreground">
        Resume Builder V2
      </footer>
    </div>
  );
};

export default MainLayout;
