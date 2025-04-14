"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  Scissors, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  Menu,
  DollarSign,
  UserSquare2,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = {
  "/admin": [
    {
      title: "Locales",
      icon: Building2,
      href: "/admin/shops",
      color: "text-blue-500",
    },
    {
      title: "Profesionales",
      icon: Users,
      href: "/admin/workers",
      color: "text-violet-500",
    },
    {
      title: "Servicios",
      icon: Scissors,
      href: "/admin/services",
      color: "text-pink-500",
    },
  ],
  "/admin/stats": [
    {
      title: "Ventas",
      icon: DollarSign,
      href: "/admin/stats/sales",
      color: "text-green-500",
    },
    {
      title: "Clientes",
      icon: UserSquare2,
      href: "/admin/stats/clients",
      color: "text-orange-500",
    },
    {
      title: "Personal",
      icon: Store,
      href: "/admin/stats/staff",
      color: "text-purple-500",
    },
  ]
};

interface SidebarContentProps {
  collapsed: boolean;
  onCollapse?: () => void;
  showCollapseButton?: boolean;
}

function SidebarContent({ collapsed, onCollapse, showCollapseButton = true }: SidebarContentProps) {
  const pathname = usePathname();
  const section = pathname.includes("/admin/stats") ? "/admin/stats" : "/admin";
  const currentMenuItems = menuItems[section];

  return (
    <div className={cn(
      "h-full bg-white border-r flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "p-4 flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold">
              {section === "/admin" ? "Información" : "Estadísticas"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {section === "/admin" ? "Gestiona tu negocio" : "Analiza tu negocio"}
            </p>
          </div>
        )}
        {showCollapseButton && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCollapse}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div className="space-y-1 px-2 relative flex-1">
        {currentMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-x-2 px-4 py-3 text-sm font-medium rounded-lg relative",
                isActive ? "text-primary" : "text-slate-500 hover:bg-slate-100/80",
                collapsed && "justify-center px-2"
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
              {!collapsed && <span className="relative">{item.title}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setCollapsed(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent collapsed={false} showCollapseButton={false} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <SidebarContent 
      collapsed={collapsed} 
      onCollapse={() => setCollapsed(!collapsed)} 
    />
  );
} 