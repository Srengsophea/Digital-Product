"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  Compass,
  Code2,
  Palette,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "./CartContext";
import { useIsMounted } from "@/lib/useIsMounted";

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
  const { count } = useCart();
  const mounted = useIsMounted();
  const displayCartCount = mounted ? count : 0;

  const isActive = (href: string) => {
    if (href === "/products") return pathname === "/products" && !activeCategory;
    const cat = new URLSearchParams(href.split("?")[1] ?? "").get("category");
    if (cat) return pathname === "/products" && activeCategory === cat;
    return pathname === href;
  };

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close sidebar when navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const navItems = [
    {
      href: "/products",
      label: "Browse All",
      description: "Explore all products & deals",
      icon: Compass,
    },
    {
      href: "/products?category=software",
      label: "Software",
      description: "Apps, SaaS & dev utilities",
      icon: Code2,
    },
    {
      href: "/products?category=design",
      label: "Design Assets",
      description: "UI kits, 3D icons & vectors",
      icon: Palette,
    },
    {
      href: "/products?category=courses",
      label: "Courses",
      description: "Masterclasses & guides",
      icon: GraduationCap,
    },
    {
      href: "/products?category=templates",
      label: "Templates",
      description: "Notion & web starter kits",
      icon: Layers,
    },
  ];

  return (
    <header className="nav-blur sticky top-0 z-40">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-all whitespace-nowrap ${
                isActive(item.href)
                  ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-500/20"
                  : "text-slate-800 font-bold hover:bg-slate-200/80 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <CartButton />

          {/* Desktop Auth Buttons */}
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/account"}
                className="hidden rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:border-violet-500 hover:bg-slate-200 lg:inline-flex whitespace-nowrap dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 lg:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-red-400"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-violet-700 lg:inline-flex whitespace-nowrap dark:text-slate-200 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4.5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-transform hover:-translate-y-0.5 lg:inline-flex whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile/Tablet Hamburger Toggle Button */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-900 shadow-sm transition-all hover:bg-slate-100 active:scale-95 lg:hidden dark:border-white/15 dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
            aria-label="Open mobile navigation menu"
            aria-expanded={open}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Over Sidebar Drawer & Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Sliding Sidebar Panel (slides in from Right) */}
        <aside
          className={`absolute top-0 right-0 bottom-0 flex h-full w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[380px] flex-col justify-between overflow-y-auto bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out border-l border-slate-200/80 dark:border-white/10 dark:bg-slate-950/95 dark:text-white ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Top Header of Sidebar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/80 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
              aria-label="Close mobile navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-5 space-y-1.5">
            <div className="px-2 pb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Menu & Categories
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-3.5 py-3 transition-all ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/25"
                      : "text-slate-800 hover:bg-slate-100/90 dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-violet-600 group-hover:bg-violet-50 dark:bg-white/10 dark:text-violet-400 dark:group-hover:bg-white/15"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${active ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {item.label}
                      </div>
                      <div
                        className={`text-[11px] ${
                          active ? "text-violet-100" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${
                      active
                        ? "text-white translate-x-0.5"
                        : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    }`}
                  />
                </Link>
              );
            })}

            {/* Quick Cart Shortcut in Navigation */}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-2xl border border-dashed border-slate-300/80 px-3.5 py-3 transition-all hover:bg-slate-100/80 dark:border-white/15 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Shopping Cart
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {displayCartCount > 0
                      ? `${displayCartCount} item${displayCartCount === 1 ? "" : "s"} added`
                      : "Your cart is empty"}
                  </div>
                </div>
              </div>
              {displayCartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-1.5 text-[10px] font-bold text-white shadow-md shadow-violet-500/30">
                  {displayCartCount}
                </span>
              )}
            </Link>
          </div>

          {/* User Account / Auth Section & Footer */}
          <div className="border-t border-slate-200/80 pt-4 dark:border-white/10">
            {user ? (
              <div className="flex flex-col gap-3">
                {/* User Card */}
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 dark:bg-white/5 dark:border-white/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-sm font-bold text-white shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Dashboard / Account Action */}
                <Link
                  href={user.role === "admin" ? "/admin" : "/account"}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-slate-950"
                >
                  {user.role === "admin" ? (
                    <>
                      <ShieldCheck size={16} /> Admin Dashboard
                    </>
                  ) : (
                    <>
                      <User size={16} /> My Account & Orders
                    </>
                  )}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/80 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-violet-600/25 transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles size={16} /> Get Started Free
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-300/80 bg-slate-50 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            )}

            {/* Mobile Safety & Assurance Footer note */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">⚡ Instant Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-1">🔒 256-bit Secure</span>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
