"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

export default function NavLinks({
  items,
  variant,
}: {
  items: NavItem[];
  variant: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  return (
    <div
      className={
        variant === "sidebar"
          ? "flex flex-col gap-2"
          : "flex flex-wrap gap-2"
      }
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);

        const base =
          "rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] transition";
        const activeClass =
          "bg-foreground text-white shadow-[0_18px_40px_-25px_rgba(15,23,42,0.5)]";
        const inactiveClass =
          "border border-transparent text-muted-foreground hover:border-foreground/15 hover:bg-white hover:text-foreground";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${base} ${active ? activeClass : inactiveClass}`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
