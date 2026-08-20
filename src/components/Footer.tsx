import Link from "next/link";
import { Github, Twitter, Youtube, ShieldCheck, Lock } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/80 dark:border-white/5 dark:bg-[#080412]" style={{ background: "var(--footer-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-text-muted">
              Curated premium digital products from independent creators.
              Delivered instantly with secure license keys.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>256-bit encrypted checkout</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
              <Lock size={14} className="text-cyan-600 dark:text-cyan-400" />
              <span>Instant digital delivery</span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Marketplace
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-muted">
              <li><Link href="/products" className="transition-colors hover:text-text-primary">All products</Link></li>
              <li><Link href="/products?category=software" className="transition-colors hover:text-text-primary">Software</Link></li>
              <li><Link href="/products?category=design" className="transition-colors hover:text-text-primary">Design assets</Link></li>
              <li><Link href="/products?category=courses" className="transition-colors hover:text-text-primary">Courses</Link></li>
              <li><Link href="/products?category=templates" className="transition-colors hover:text-text-primary">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Account
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-muted">
              <li><Link href="/login" className="transition-colors hover:text-text-primary">Sign in</Link></li>
              <li><Link href="/register" className="transition-colors hover:text-text-primary">Create account</Link></li>
              <li><Link href="/account" className="transition-colors hover:text-text-primary">My licenses</Link></li>
              <li><Link href="/cart" className="transition-colors hover:text-text-primary">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">
              Community
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-muted">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-text-primary">
                  <Github size={14} /> GitHub
                </a>
              </li>
              <li>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-text-primary">
                  <Twitter size={14} /> Twitter / X
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-text-primary">
                  <Youtube size={14} /> YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs text-text-muted sm:flex-row dark:border-white/5">
          <p>© {new Date().getFullYear()} DIGI VIP. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span className="text-gradient font-semibold">Premium digital, instant delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
