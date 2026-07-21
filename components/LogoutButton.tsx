"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-orange-500 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-orange-600 transition-colors focus-ring"
    >
      Log out
    </button>
  );
}