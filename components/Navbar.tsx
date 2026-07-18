import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import OnlineCount from "./OnlineCount";

export default async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-bold text-lg tracking-tight text-ink focus-ring"
        >
          Name-<span className="text-margin">Placeholder</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="/" className="hover:text-ink transition-colors focus-ring">
            Browse
          </Link>
          <Link href="/create" className="hover:text-ink transition-colors focus-ring">
            New deck
          </Link>
         {user && (
            <Link href="/my-decks" className="hover:text-ink transition-colors focus-ring">
              My Decks
            </Link>
          )}
          {user && (
            <Link href="/saved" className="hover:text-ink transition-colors focus-ring">
              Saved
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <OnlineCount />
          {user ? (
            <>
              <span className="text-sm text-muted hidden sm:inline">
                {user.user_metadata?.username ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-muted hover:text-ink transition-colors focus-ring"
            >
              Log in
            </Link>
          )}
          <Link
            href="/create"
            className="text-sm bg-ink text-paper px-4 py-2 rounded-sm hover:bg-margin transition-colors focus-ring"
          >
            Create deck
          </Link>
        </div>
      </div>
    </header>
  );
}
