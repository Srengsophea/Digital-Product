"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className={className} aria-label="Sign out">
      <LogOut size={15} /> Sign out
    </button>
  );
}
