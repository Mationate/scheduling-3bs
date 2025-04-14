"use client";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Building2, 
  Scissors, 
  ChevronDown, 
  Store, 
  Menu,
  DollarSign,
  Receipt,
  UserSquare2,
  History,
  Medal,
  FileText,
  PieChart,
  UserCog,
  Home,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SubMenuItem {
  label: string;
  href: string;
  icon: typeof Calendar;
  color: string;
  description?: string;
}

interface MenuItem {
  label: string;
  icon: typeof Calendar;
  href: string;
  color: string;
  submenu?: SubMenuItem[];
}

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  if (href === '/admin/management') {
    return ['/admin/services', '/admin/workers', '/admin/shops'].includes(pathname);
  }
  return pathname.startsWith(href);
};

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    icon: Home,
    href: "/admin",
    color: "text-primary",
  },
  {
    label: "Agenda",
    icon: Calendar,
    href: "/admin/calendar",
    color: "text-orange-500",
  },
  {
    label: "Ventas",
    icon: DollarSign,
    href: "/admin/sales",
    color: "text-green-500",
    submenu: [
      { 
        label: "Formulario de ingresos", 
        href: "/admin/sales/income",
        icon: FileText,
        color: "text-green-600",
        description: "Ver y registrar ingresos"
      }
    ]
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/admin/clients",
    color: "text-violet-500",
    submenu: [
      { 
        label: "Gestión de Clientes", 
        href: "/admin/clients",
        icon: UserCog,
        color: "text-violet-600",
        description: "Administrar clientes"
      },
      { 
        label: "Fidelización", 
        href: "/admin/clients/loyalty",
        icon: Medal,
        color: "text-violet-700",
        description: "Programa de lealtad"
      },
      { 
        label: "Historial", 
        href: "/admin/clients/history",
        icon: History,
        color: "text-violet-800",
        description: "Ver historial de clientes"
      },
    ]
  },
  {
    label: "Administración",
    icon: Settings,
    href: "/admin/management",
    color: "text-blue-500",
    submenu: [
      {
        label: "Locales",
        description: "Gestiona tus locales",
        icon: Building2,
        href: "/admin/shops",
        color: "text-blue-500"
      },
      {
        label: "Profesionales",
        description: "Gestiona tus profesionales",
        icon: Users,
        href: "/admin/workers",
        color: "text-blue-500"
      },
      {
        label: "Servicios",
        description: "Gestiona tus servicios",
        icon: Scissors,
        href: "/admin/services",
        color: "text-blue-500"
      }
    ]
  },
  {
    label: "Estadísticas",
    icon: BarChart3,
    href: "/admin/stats",
    color: "text-pink-500",
    submenu: [
      { 
        label: "Reporte de Ventas", 
        href: "/admin/stats/sales",
        icon: PieChart,
        color: "text-pink-600",
        description: "Análisis de ventas"
      },
      { 
        label: "Clientes", 
        href: "/admin/stats/clients",
        icon: UserSquare2,
        color: "text-pink-700",
        description: "Métricas de clientes"
      },
      { 
        label: "Personal", 
        href: "/admin/stats/staff",
        icon: Users,
        color: "text-pink-800",
        description: "Rendimiento del personal"
      },
    ]
  },
];

export function Navbar() {
  const pathname = usePathname();

  const renderMenuItems = (isMobile?: boolean) => (
    <>
      {menuItems.map((item) => {
        const active = isActive(pathname, item.href);

        return item.submenu ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "flex items-center gap-2 transition-colors relative group",
                  active ? item.color : "text-muted-foreground hover:text-primary",
                  isMobile && "w-full justify-start"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align={isMobile ? "end" : "start"} 
              className="w-[220px] p-2"
            >
              {item.submenu.map((subitem) => {
                const isSubActive = pathname === subitem.href;
                return (
                  <Link key={subitem.href} href={subitem.href}>
                    <DropdownMenuItem className={cn(
                      "flex flex-col items-start p-2 cursor-pointer rounded-md transition-colors",
                      isSubActive && "bg-secondary"
                    )}>
                      <div className="flex items-center gap-2 w-full">
                        <subitem.icon className={cn("w-4 h-4 shrink-0", subitem.color)} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">
                            {subitem.label}
                          </span>
                          {subitem.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {subitem.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link key={item.label} href={item.href} className={cn(isMobile && "w-full")}>
            <Button 
              variant={active ? "secondary" : "ghost"}
              className={cn(
                "flex items-center gap-2 transition-colors",
                active ? item.color : "text-muted-foreground hover:text-primary",
                isMobile && "w-full justify-start"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </>
  );

  return (
    <nav className="h-14 px-4 border-b bg-white flex items-center sticky top-0 z-50">
      <div className="hidden md:flex items-center gap-2 mr-6">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          App Agenda
        </span>
      </div>

      <div className="hidden md:flex items-center flex-1 gap-1">
        {renderMenuItems()}
      </div>

      <div className="flex items-center ml-auto gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-2">
            <div className="flex flex-col gap-2">
              {renderMenuItems(true)}
            </div>
          </SheetContent>
        </Sheet>
        <UserButton />
      </div>
    </nav>
  );
}

