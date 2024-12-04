"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Pencil, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ShopData {
  id: string;
  name: string;
  phone: string;
  mail: string;
  address: string;
  workersCount: number;
  createdAt: string;
}

interface ShopsDataTableProps {
  initialData: ShopData[];
}

export function ShopsDataTable({ initialData }: ShopsDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData);

  const filteredData = data.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: "Tienda",
      accessorKey: "name",
      cell: (row: ShopData) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.name}</span>
          <Badge variant="outline">{row.workersCount} trabajadores</Badge>
        </div>
      )
    },
    { 
      header: "Contacto",
      id: "contact",
      cell: (row: ShopData) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            {row.mail}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            {row.phone}
          </div>
        </div>
      )
    },
    { 
      header: "Ubicación",
      accessorKey: "address",
      cell: (row: ShopData) => (
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          {row.address}
        </div>
      )
    },
    { 
      header: "Creado",
      accessorKey: "createdAt",
      cell: (row: ShopData) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          {format(new Date(row.createdAt), "PP", { locale: es })}
        </div>
      )
    },
    {
      header: "Acciones",
      id: "actions",
      cell: (row: ShopData) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/shops/${row.id}/schedule`)}
            title="Gestionar Horarios"
          >
            <Calendar className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/shops/${row.id}/workers`)}
            title="Gestionar Trabajadores"
          >
            <Users className="h-4 w-4 text-green-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin/shops/${row.id}`)}>
                <Users className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/shops/${row.id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  if (confirm("¿Estás seguro de que quieres eliminar esta tienda?")) {
                    const res = await fetch(`/api/shops/${row.id}`, {
                      method: "DELETE"
                    });
                    if (res.ok) {
                      setData(prev => prev.filter(shop => shop.id !== row.id));
                      router.refresh();
                    }
                  }
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ] satisfies Column<ShopData>[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar tiendas..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <DataTable
        data={filteredData}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
} 