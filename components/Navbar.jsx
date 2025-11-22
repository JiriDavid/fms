"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/animals", label: "Livestock" },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <nav className="mx-auto flex w-full max-w-7xl lg:max-w-none items-center gap-4 px-4 sm:px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primary-700">
          FarmTrack
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-6 text-sm font-medium text-slate-600">
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

        {/* Spacer for mobile layout */}
        <div className="flex-1 lg:hidden"></div>

        {/* Mobile Menu Button - positioned on the right for mobile */}
        <SignedIn>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors order-3"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </SignedIn>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
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
                className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700"
              >
                My farm
              </Link>
              <UserButton afterSignOutUrl="/" showName />
            </div>
          </SignedIn>
        </div>

        {/* Mobile Auth Buttons */}
        <div className="lg:hidden">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-full border border-primary-200 px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <SignedIn>
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith(link.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </SignedIn>
      )}
    </header>
  );
}
