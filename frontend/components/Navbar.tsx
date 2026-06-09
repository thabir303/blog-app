"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canCreatePost, canManageUsers } from "@/utils/permissions";
import ThemeToggle from "@/components/ThemeToggle";
import RoleChip from "@/components/RoleChip";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Shield, FileText, Users, SquarePen, LogOut, LogIn, UserPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Create a dedicated portal container appended to body
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-portal", "navbar-menu");
    document.body.appendChild(el);
    setPortalEl(el);
    return () => { document.body.removeChild(el); };
  }, []);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = () => { setMenuOpen(false); logout(); router.push("/"); };
  const isActive = (href: string) => pathname === href;
  const avatarColor = user ? AVATAR_PALETTE[user.username.charCodeAt(0) % AVATAR_PALETTE.length] : "";

  const handleAvatarClick = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setMenuOpen((v) => !v);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-full flex items-center gap-2">

          <Link href="/" className="flex items-center gap-2 mr-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Blog Application</span>
          </Link>

          <Separator orientation="vertical" className="h-5" />

          <nav className="flex items-center gap-1 flex-1">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: isActive("/") ? "secondary" : "ghost", size: "sm" }), "h-8 gap-1.5 text-sm")}
            >
              <FileText className="h-3.5 w-3.5" />
              Posts
            </Link>

            {user && canCreatePost(user.role) && (
              <Link
                href="/posts/new"
                className={cn(buttonVariants({ variant: isActive("/posts/new") ? "secondary" : "ghost", size: "sm" }), "h-8 gap-1.5 text-sm")}
              >
                <SquarePen className="h-3.5 w-3.5" />
                Write
              </Link>
            )}

            {user && canManageUsers(user.role) && (
              <Link
                href="/admin"
                className={cn(buttonVariants({ variant: isActive("/admin") ? "secondary" : "ghost", size: "sm" }), "h-8 gap-1.5 text-sm")}
              >
                <Users className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {user ? (
              <button
                ref={triggerRef}
                onClick={handleAvatarClick}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className={`text-white text-xs font-semibold ${avatarColor}`}>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5")}>
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "h-8 gap-1.5")}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {portalEl && user && menuOpen && createPortal(
        <>
          {/* Transparent backdrop — captures outside clicks */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu */}
          <div
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
            className="w-52 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-3 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className={`text-white text-[11px] font-semibold ${avatarColor}`}>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-none truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <RoleChip role={user.role} />
            </div>
            <div className="p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        </>,
        portalEl
      )}
    </>
  );
}
