"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/animals", label: "Animals" },
  { href: "/medicines", label: "Medicines" },
  { href: "/feeds", label: "Feeds" },
  { href: "/sales", label: "Sales" },
  { href: "/expenses", label: "Expenses" },
  { href: "/tasks", label: "Tasks" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8 px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primary-700">
          FarmTrack
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <SignedIn key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-primary-600 transition-colors ${
                  pathname?.startsWith(link.href) ? "text-primary-600" : ""
                }`}
              >
                {link.label}
              </Link>
            </SignedIn>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Join now
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700"
              >
                My farm
              </Link>
              <UserButton afterSignOutUrl="/" showName />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
