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
        background: isHome ? "transparent" : "var(--bg)",
        borderBottom: isHome ? "none" : "1px solid var(--border)",
        backdropFilter: isHome ? "none" : "none",
      }}
    >
      <Link
        href="/"
        className="text-xl font-black tracking-tighter"
        style={{ color: isHome ? "white" : "var(--accent)" }}
      >
        MadLipz
      </Link>

      <div className="flex items-center gap-1">
        {[
          { href: "/", label: "Feed" },
          { href: "/marketplace", label: "Marketplace" },
          { href: "/profile", label: "Profile" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: path === href ? "white" : isHome ? "rgba(255,255,255,0.6)" : "var(--muted)",
              background: path === href ? (isHome ? "rgba(255,255,255,0.15)" : "var(--surface-2)") : "transparent",
            }}
          >
            {label}
          </Link>
        ))}

        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ME.avatar}
          alt={ME.name}
          className="w-8 h-8 rounded-full ml-2 border-2"
          style={{ borderColor: "var(--accent)" }}
        />
      </div>
    </nav>
  );
}
