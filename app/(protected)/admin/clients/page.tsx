"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Pencil, Plus, Trash2, Loader2, Upload } from "lucide-react";
import { ClientForm } from "./_components/client-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UploadClientsModal } from "./_components/upload-clients-modal";

interface Client {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  rut: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastVisit: Date | null;
  totalVisits: number;
  status: string;
}

interface Shop {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filtros
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const [selectedWorker, setSelectedWorker] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [shopsRes, workersRes, servicesRes] = await Promise.all([
          fetch("/api/shops"),
          fetch("/api/workers"),
          fetch("/api/services")
        ]);

        const [shopsData, workersData, servicesData] = await Promise.all([
          shopsRes.json(),
          workersRes.json(),
          servicesRes.json()
        ]);

        setShops(shopsData);
        setWorkers(workersData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Error al cargar los datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Cargar clientes cuando cambien los filtros
  useEffect(() => {
    fetchClients();
  }, [selectedShop, selectedWorker, selectedService]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      // Construir URL con los filtros
      const params = new URLSearchParams({
        ...(selectedShop !== 'all' && { shopId: selectedShop }),
        ...(selectedWorker !== 'all' && { workerId: selectedWorker }),
        ...(selectedService !== 'all' && { serviceId: selectedService })
      });

      const response = await fetch(`/api/clients?${params}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (formData: any) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast.success("Cliente creado correctamente");
      router.refresh();
      if (!response.ok) throw new Error("Error al crear el cliente");
      
      await fetchClients();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  };

  const handleUpdateClient = async (formData: any) => {
    if (!selectedClient) return;
    
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast.success("Cliente actualizado correctamente");
      router.refresh();
      if (!response.ok) throw new Error("Error al actualizar el cliente");
      
      await fetchClients();
      setShowForm(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Error al eliminar el cliente");
      
      await fetchClients();
      toast.success("Cliente eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setShowDeleteConfirm(false);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (client.name?.toLowerCase().includes(searchTerm) || false) ||
      client.email.toLowerCase().includes(searchTerm) ||
      (client.phone?.toLowerCase().includes(searchTerm) || false)
    );
  });

  // Modificar los handlers de los filtros
  const handleShopChange = (value: string) => {
    setSelectedShop(value);
    setSelectedWorker("all");
    setSelectedService("all");
  };

  const handleWorkerChange = (value: string) => {
    setSelectedWorker(value);
    setSelectedShop("all");
    setSelectedService("all");
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setSelectedShop("all");
    setSelectedWorker("all");
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Base de Clientes</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Cargar clientes
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-97px)]">
        {/* Sidebar Filters */}
        <div className="w-80 border-r p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Filtros avanzados</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Local/sede</label>
                <Select value={selectedShop} onValueChange={handleShopChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los locales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los locales</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Profesional/prestador</label>
                <Select value={selectedWorker} onValueChange={handleWorkerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los profesionales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los profesionales</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Servicios</label>
                <Select value={selectedService} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="flex justify-between items-center">
            <Input 
              placeholder="Buscar por nombre, email o teléfono" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Total Visitas</TableHead>
                    <TableHead className="text-right">Opciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name || "-"}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>
                        {client.lastVisit 
                          ? new Date(client.lastVisit).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>{client.totalVisits}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowForm(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => {
                              setClientToDelete(client);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            initialData={selectedClient || undefined}
            onSubmit={selectedClient ? handleUpdateClient : handleCreateClient}
            onCancel={() => {
              setShowForm(false);
              setSelectedClient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que deseas eliminar este cliente?</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UploadClientsModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
} 