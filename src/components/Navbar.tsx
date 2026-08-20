"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({
  user,
}: {
  user: { id: string; name: string; email: string; role: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const isActive = (href: string) => {
    if (href === "/products") return pathname === "/products" && !activeCategory;
    const cat = new URLSearchParams(href.split("?")[1] ?? "").get("category");
    if (cat) return pathname === "/products" && activeCategory === cat;
    return pathname === href;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/products", label: "Browse" },
    { href: "/products?category=software", label: "Software" },
    { href: "/products?category=design", label: "Design" },
    { href: "/products?category=courses", label: "Courses" },
    { href: "/products?category=templates", label: "Templates" },
  ];

  return (
    <header className="nav-blur sticky top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${
                isActive(link.href)
                  ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-500/20"
                  : "text-slate-800 font-bold hover:bg-slate-200/80 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartButton />

          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/account"}
                className="hidden rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:border-violet-500 hover:bg-slate-200 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-red-400"
              >
                <LogOut size={15} />
              </button>
              <Link
                href="/account"
                className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-transform hover:-translate-y-0.5 sm:hidden"
              >
                {user.name.split(" ")[0]}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-violet-700 sm:inline-flex dark:text-slate-200 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4.5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-slate-100/60 text-text-primary md:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="nav-blur border-t border-slate-200/80 px-4 pb-4 pt-2 md:hidden dark:border-white/5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-violet-600/10 text-violet-700 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-text-muted hover:bg-slate-900/5 hover:text-text-primary dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
