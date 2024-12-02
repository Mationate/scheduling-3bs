"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Scissors, Calendar, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const routes = [
  {
    label: "Management",
    items: [
      {
        label: "Shops",
        icon: Building2,
        href: "/admin/shops",
        color: "text-sky-500",
      },
      {
        label: "Workers",
        icon: Users,
        href: "/admin/workers",
        color: "text-violet-500",
      },
      {
        label: "Services",
        icon: Scissors,
        href: "/admin/services",
        color: "text-pink-700",
      },
      {
        label: "Bookings",
        icon: Calendar,
        href: "/admin/bookings",
        color: "text-orange-700",
      },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <Link href="/admin" className="font-bold text-xl">
          Admin Panel
        </Link>

        <div className="ml-8 flex items-center space-x-4">
          {routes.map((route) => (
            <DropdownMenu key={route.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-semibold">
                  {route.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {route.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}