"use client";

import { cn } from "@/lib/utils";
import { Building2, Users, Scissors } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
  {
    title: "Locales",
    icon: Building2,
    href: "/admin/(dashboard)/shops",
    color: "text-blue-500",
  },
  {
    title: "Profesionales",
    icon: Users,
    href: "/admin/(dashboard)/workers",
    color: "text-violet-500",
  },
  {
    title: "Servicios",
    icon: Scissors,
    href: "/admin/(dashboard)/services",
    color: "text-pink-500",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-white border-r space-y-4 py-4 px-2">
      <div className="px-4">
        <h2 className="text-lg font-semibold">Información básica</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona tu negocio
        </p>
      </div>
      <div className="space-y-1 relative">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 px-4 py-3 text-sm font-medium rounded-lg relative",
                isActive && "text-primary"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <item.icon className={cn("h-5 w-5", item.color)} />
              <span className="relative">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 