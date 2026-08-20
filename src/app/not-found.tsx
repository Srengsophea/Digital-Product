import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-1 items-center justify-center overflow-hidden px-4 py-16">
      {/* Aurora glow */}
      <div className="aurora-blob left-1/4 top-0 h-72 w-72 bg-violet-600/25" />
      <div className="aurora-blob bottom-0 right-1/4 h-72 w-72 bg-cyan-500/15" />

      <div className="relative mx-auto w-full max-w-xl text-center">
        <p className="font-display text-[7rem] font-bold leading-none text-gradient sm:text-[9rem]">
          404
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-text-primary dark:text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back to the good stuff.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary inline-flex">
            <Home size={16} />
            Back to home
          </Link>
          <Link href="/products" className="btn-secondary inline-flex">
            <Compass size={16} />
            Browse products
          </Link>
          <Link href="/products?q=" className="btn-ghost inline-flex">
            <Search size={16} />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
