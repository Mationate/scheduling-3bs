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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkerData {
  id: string;
  name: string;
  phone: string;
  mail: string;
  avatar: string;
  status: string;
  shopName: string;
  createdAt: string;
}

interface WorkersDataTableProps {
  initialData: WorkerData[];
}

export function WorkersDataTable({ initialData }: WorkersDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData);

  const filteredData = data.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Teléfono", accessorKey: "phone" },
    { header: "Email", accessorKey: "mail" },
    { 
      header: "Estado", 
      accessorKey: "status",
      cell: (row: WorkerData) => (
        <Badge variant={row.status === "UNASSIGNED" ? "destructive" : "default"}>
          {row.status === "UNASSIGNED" ? "Sin Asignar" : 
           row.status === "ACTIVE" ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
    { header: "Tienda", accessorKey: "shopName" },
    { header: "Creado", accessorKey: "createdAt" },
    {
      header: "Acciones",
      id: "actions",
      cell: (row: WorkerData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/workers/${row.id}`)}>
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/workers/${row.id}/edit`)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/workers/${row.id}/services`)}>
              Gestionar Servicios
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={async () => {
                if (confirm("¿Estás seguro de que quieres eliminar este trabajador?")) {
                  const res = await fetch(`/api/workers/${row.id}`, {
                    method: "DELETE"
                  });
                  if (res.ok) {
                    setData(prev => prev.filter(worker => worker.id !== row.id));
                    router.refresh();
                  }
                }
              }}
              className="text-red-600"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ] satisfies Column<WorkerData>[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar trabajadores..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={() => router.push("/admin/workers/new")}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Trabajador
        </Button>
      </div>
      <DataTable
        data={filteredData}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
} 