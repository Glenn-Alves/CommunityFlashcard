"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }

      // Supabase returns a "fake" success response for emails that already
      // exist, rather than an error, to avoid revealing who's registered.
      // An empty identities array is the signal that this is a duplicate.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Try logging in instead.");
        return;
      }

      setCheckEmail(true);
    }
  }

if (checkEmail) {
    return (
      <div className="pt-16 max-w-md">
        <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
          almost there
        </p>
        <h1 className="font-display font-bold text-ink text-2xl mb-4">
          Check your inbox
        </h1>
        <p className="text-muted text-sm mb-6">
          We sent a confirmation link to <strong className="text-ink">{email}</strong>.
          Click it to activate your account, then come back and log in.
        </p>
        <button
          onClick={() => {
            setCheckEmail(false);
            setMode("login");
          }}
          className="text-sm text-rule hover:text-ink transition-colors focus-ring"
        >
          ← Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 max-w-md">
      <p className="font-display text-xs text-margin uppercase tracking-widest mb-3">
        {mode === "login" ? "welcome back" : "join name-placeholder"}
      </p>
      <h1 className="font-display font-bold text-ink text-2xl md:text-3xl mb-8">
        {mode === "login" ? "Log in" : "Create an account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "signup" && (
          <div>
            <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Earl"
              className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
            />
          </div>
        )}

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        <div>
          <label className="block font-display text-xs text-ink uppercase tracking-wide mb-2">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-card border-2 border-ink rounded-sm px-4 py-3 text-sm text-ink placeholder:text-muted focus-ring"
          />
        </div>

        {error && (
          <p className="text-sm text-margin border border-margin/30 bg-margin/5 rounded-sm px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper px-6 py-3 rounded-sm text-sm font-medium hover:bg-margin transition-colors focus-ring disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        {mode === "login" ? "New to Name-Placeholder?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="text-rule hover:text-ink transition-colors focus-ring"
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </div>
  );
}