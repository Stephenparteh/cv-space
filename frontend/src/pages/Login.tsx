import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/resume-editor/FormField";
import { ApiError } from "@/services/api";
import { login, register } from "@/services/auth";

type Mode = "login" | "register";

const safeNext = (value: string | null): string =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (mode === "register") {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate(next, { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-semibold leading-none tracking-tight">
            {mode === "login" ? "Sign in" : "Create an account"}
          </h1>
          <CardDescription>
            {mode === "login"
              ? "Sign in to edit and save your resumes."
              : "Create an account to start saving resumes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <FormField label="Name">
                {(id) => (
                  <Input
                    id={id}
                    value={name}
                    autoComplete="name"
                    required
                    disabled={submitting}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
              </FormField>
            )}

            <FormField label="Email">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  value={email}
                  autoComplete="email"
                  required
                  disabled={submitting}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </FormField>

            <FormField label="Password" hint={mode === "register" ? "At least 8 characters." : undefined}>
              {(id) => (
                <PasswordInput
                  id={id}
                  value={password}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  disabled={submitting}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </FormField>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" /> Please wait…
                </>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
