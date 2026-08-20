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

          {/* Desktop Auth Buttons */}
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/account"}
                className="hidden rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:border-violet-500 hover:bg-slate-200 md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-red-400"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-violet-700 md:inline-flex dark:text-slate-200 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4.5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-transform hover:-translate-y-0.5 md:inline-flex"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-900 shadow-sm transition-all md:hidden dark:border-white/15 dark:bg-slate-900/80 dark:text-white"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer menu */}
      {open && (
        <div className="nav-blur border-b border-slate-200/80 bg-white/95 px-5 pb-6 pt-3 shadow-2xl backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex flex-col gap-1.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition-all ${
                  isActive(link.href)
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-white/10">
            {user ? (
              <div className="flex flex-col gap-2.5">
                <Link
                  href={user.role === "admin" ? "/admin" : "/account"}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-slate-900 py-3 text-sm font-bold text-white shadow-md dark:bg-white dark:text-slate-950"
                >
                  {user.role === "admin" ? "Admin Dashboard" : "My Account"} ({user.name.split(" ")[0]})
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-white/15 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full border border-slate-300 bg-white py-3 text-sm font-bold text-slate-900 shadow-xs dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-violet-600/30"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
