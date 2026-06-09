"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ME } from "@/lib/mock-data";

export default function Nav() {
  const path = usePathname();
  const isHome = path === "/";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: isHome ? "transparent" : "rgba(7,7,13,0.85)",
        backdropFilter: isHome ? "none" : "blur(20px) saturate(180%)",
        WebkitBackdropFilter: isHome ? "none" : "blur(20px) saturate(180%)",
        borderBottom: isHome ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display font-extrabold text-xl tracking-tight gradient-text"
        style={{ lineHeight: 1 }}
      >
        MadLipz
      </Link>

      {/* Links */}
      <div className="flex items-center gap-0.5">
        {[
          { href: "/", label: "Feed", short: "Feed" },
          { href: "/marketplace", label: "Marketplace", short: "Market" },
          { href: "/profile", label: "Profile", short: "Profile" },
        ].map(({ href, label, short }) => {
          const active = path === href || path.startsWith(href + "/") && href !== "/";
          const isActive = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium font-sans transition-all duration-200"
              style={{
                color: isActive ? "white" : isHome ? "rgba(255,255,255,0.55)" : "var(--muted)",
                background: isActive
                  ? isHome ? "rgba(255,255,255,0.12)" : "rgba(147,51,234,0.15)"
                  : "transparent",
                border: isActive ? `1px solid ${isHome ? "rgba(255,255,255,0.15)" : "rgba(147,51,234,0.25)"}` : "1px solid transparent",
              }}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}

        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ME.avatar}
          alt={ME.name}
          className="w-8 h-8 rounded-full ml-2"
          style={{ border: "2px solid #9333ea66", boxShadow: "0 0 12px #9333ea44" }}
        />
      </div>
    </nav>
  );
}
