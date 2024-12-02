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

export function WorkersDataTable({ initialData }: ShopsDataTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData);

  const filteredData = data.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Email", accessorKey: "mail" },
    { header: "Address", accessorKey: "address" },
    { header: "Workers", accessorKey: "workersCount" },
    { header: "Created", accessorKey: "createdAt" },
    {
      header: "Actions",
      id: "actions",
      cell: (row: ShopData) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/shops/${row.id}`)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/shops/${row.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={async () => {
                if (confirm("Are you sure you want to delete this shop?")) {
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
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ] satisfies Column<ShopData>[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search shops..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={() => router.push("/admin/shops/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Shop
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