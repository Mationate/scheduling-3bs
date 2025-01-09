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

interface ServiceData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: number;
}

interface ServicesDataTableProps {
  initialData: ServiceData[];
}

export function ServicesDataTable({ initialData }: ServicesDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData);

  const filteredData = data.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
    { 
      header: "Price", 
      accessorKey: "price",
      cell: (row: ServiceData) => (
        <span>${row.price.toFixed(2)}</span>
      )
    },
    { 
      header: "Duration", 
      accessorKey: "duration",
      cell: (row: ServiceData) => (
        <span>{row.duration} min</span>
      )
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row: ServiceData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/services/${row.id}`)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/services/${row.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={async () => {
                if (confirm("Are you sure you want to delete this service?")) {
                  const res = await fetch(`/api/services/${row.id}`, {
                    method: "DELETE"
                  });
                  if (res.ok) {
                    setData(prev => prev.filter(service => service.id !== row.id));
                    router.refresh();
                  }
                }
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ] satisfies Column<ServiceData>[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search services..."
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