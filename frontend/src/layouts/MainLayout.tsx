import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";
import { hasToken } from "@/services/authStorage";
import { logout } from "@/services/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex min-h-11 items-center rounded-md border-b-2 px-2.5 text-sm font-medium transition-colors duration-micro",
    isActive
      ? "border-accent text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );

const MainLayout = () => {
  const navigate = useNavigate();
  const authed = hasToken();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-content-app items-center justify-between gap-3 px-4">
          <Link
            to={authed ? "/dashboard" : "/"}
            className="flex shrink-0 items-center gap-2"
            aria-label="CV Space home"
          >
            <BrandMark size={26} />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              CV Space
            </span>
          </Link>

          <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1" aria-label="Primary">
            <NavLink to="/directory" className={navLinkClass}>
              Directory
            </NavLink>
            {authed ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                {/* Icon-only below sm — "Directory" + "Dashboard" + a full
                    "Sign out" label don't fit a 390px header alongside the
                    brand mark; the icon + aria-label keeps it discoverable. */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 px-2.5 sm:px-3"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut /> <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Sign in
                </NavLink>
                {/* The hero CTA on the homepage already covers this action
                    prominently; on a 390px header there isn't room for a
                    third nav item without crowding Directory/Sign in. */}
                <Link to="/build" className="hidden sm:block">
                  <Button size="sm" className="ml-1">
                    Create my CV
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-content-app px-4 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <Link to="/" className="flex items-center gap-2" aria-label="CV Space home">
              <BrandMark size={22} />
              <span className="font-display text-sm font-semibold text-foreground">CV Space</span>
            </Link>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm sm:flex sm:gap-16">
              <div>
                <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Product
                </p>
                <ul className="space-y-1.5">
                  <li>
                    <Link to="/build" className="text-muted-foreground hover:text-foreground">
                      Create CV
                    </Link>
                  </li>
                  <li>
                    <a href="/#templates" className="text-muted-foreground hover:text-foreground">
                      Templates
                    </a>
                  </li>
                  <li>
                    <Link to="/directory" className="text-muted-foreground hover:text-foreground">
                      Directory
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Account
                </p>
                <ul className="space-y-1.5">
                  {authed ? (
                    <li>
                      <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                        Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link to="/login" className="text-muted-foreground hover:text-foreground">
                        Log in
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CV Space. Free to create, yours to keep.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
