"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Domaines", href: "/domains" },
  { label: "Containers", href: "/containers" },
  { label: "Hosts", href: "/hosts" },
  { label: "Certificats SSL", href: "/certificates" },
  { label: "Apps", href: "/apps" },
  { label: "Paramètres", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold uppercase text-muted-foreground">
            VPS
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Ops Dashboard
          </span>
        </div>
        <Badge variant="secondary">Beta</Badge>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground"
              )}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto px-3 pb-2 pt-6">
          <Link className={buttonVariants({ className: "w-full" })} href="/apps">
            Créer une app
          </Link>
        </div>
      </nav>
    </aside>
  );
}
