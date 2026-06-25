"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface HeaderProps {
  onUploadClick?: () => void;
}

export default function Header({ onUploadClick }: HeaderProps = {}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isCreatePage = pathname === "/create";
  const isChatPage = pathname.startsWith("/chats/");

  return (
    <header className="relative mx-auto flex w-full shrink-0 items-center justify-between py-4 px-4 md:py-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DataRefine
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#use-cases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/history"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              pathname === '/history' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            History
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {session ? (
          <div className="flex items-center gap-4 border-l border-border/50 pl-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Hello, {session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-l border-border/50 pl-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Show "Start Creating" button on landing page, or "New Dashboard" on chat pages */}
        {isLandingPage && (
          <button
            onClick={onUploadClick}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg ml-2"
          >
            Upload Dataset
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isChatPage && (
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-foreground hover:bg-card transition-colors ml-2"
          >
            New Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
