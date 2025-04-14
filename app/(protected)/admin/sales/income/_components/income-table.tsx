"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateRange } from "react-day-picker";

interface Worker {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Income {
  id: string;
  date: Date;
  workerId: string;
  workerName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  paymentMethod: string;
  ticketNumber: string;
  observation?: string;
  cardAmount?: number;
  cashAmount?: number;
}

interface IncomeTableProps {
  shopId: string;
  dateFilter: Date | DateRange;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function IncomeTable({ shopId, dateFilter, isLoading, setIsLoading }: IncomeTableProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    workerId: "",
    serviceId: "",
    amount: 0,
    paymentMethod: "",
    ticketNumber: "",
    observation: "",
    cardAmount: undefined as number | undefined,
    cashAmount: undefined as number | undefined
  });
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [splitPayment, setSplitPayment] = useState({
    cardAmount: 0,
    cashAmount: 0
  });
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    fetchIncomes();
    fetchWorkers();
    fetchServices();
  }, [shopId, dateFilter]);

  const fetchIncomes = async () => {
    try {
      const params = new URLSearchParams({
        shopId,
        ...(dateFilter instanceof Date
          ? { date: format(dateFilter, 'yyyy-MM-dd') }
          : {
              from: format(dateFilter.from!, 'yyyy-MM-dd'),
              to: format(dateFilter.to || dateFilter.from!, 'yyyy-MM-dd'),
            }),
      });

      const response = await fetch(`/api/sales/income?${params}`);
      const data = await response.json();
      console.log("Ingresos cargados:", data);
      setIncomes(data);
    } catch (error) {
      toast.error("Error al cargar los ingresos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/workers`);
      const data = await response.json();
      setWorkers(data);
    } catch (error) {
      toast.error("Error al cargar los profesionales");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}/services`);
      const data = await response.json();
      console.log("Servicios cargados:", data);
      setServices(data);
    } catch (error) {
      toast.error("Error al cargar los servicios");
    }
  };

  const handleAddIncome = async () => {
    try {
      const response = await fetch("/api/sales/income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newIncome,
          shopId,
          date: new Date()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error en la respuesta:", error);
        throw new Error();
      }

      toast.success("Ingreso registrado correctamente");
      fetchIncomes();
      setIsAddingNew(false);
      setNewIncome({
        workerId: "",
        serviceId: "",
        amount: 0,
        paymentMethod: "",
        ticketNumber: "",
        observation: "",
        cardAmount: undefined,
        cashAmount: undefined
      });
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error al registrar el ingreso");
    }
  };

  const handleEditIncome = async () => {
    try {
      console.log("Enviando datos de edición:", editingIncome);
      const response = await fetch(`/api/sales/income/${editingIncome?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerId: editingIncome?.workerId,
          serviceId: editingIncome?.serviceId,
          amount: editingIncome?.amount,
          paymentMethod: editingIncome?.paymentMethod,
          ticketNumber: editingIncome?.ticketNumber,
          observation: editingIncome?.observation,
          cardAmount: editingIncome?.cardAmount,
          cashAmount: editingIncome?.cashAmount
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error en la respuesta:", error);
        throw new Error();
      }

      toast.success("Ingreso actualizado correctamente");
      fetchIncomes();
      setIsEditDialogOpen(false);
      setEditingIncome(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("Error al actualizar el ingreso");
    }
  };

  const handleServiceChange = (serviceId: string, target: 'new' | 'edit') => {
    const service = services.find(s => s.id === serviceId);
    console.log("Servicio seleccionado:", service);
    const amount = Math.round(service?.price || 0);
    console.log("Monto calculado:", amount);
    
    if (target === 'new') {
      setNewIncome(prev => ({
        ...prev,
        serviceId,
        amount
      }));
    } else {
      setEditingIncome(prev => {
        const updated = prev ? {
          ...prev,
          serviceId,
          amount
        } : null;
        console.log("Estado actualizado:", updated);
        return updated;
      });
    }
  };

  const handleSplitPayment = () => {
    const total = splitPayment.cardAmount + splitPayment.cashAmount;
    const currentAmount = editingIncome?.amount || newIncome.amount;
    
    console.log("Split Payment - Valores actuales:", {
      total,
      currentAmount,
      splitPayment,
      editingIncome,
      newIncome
    });
    
    if (total !== currentAmount) {
      toast.error("La suma de los montos debe ser igual al total");
      return;
    }

    if (editingIncome) {
      const updatedIncome = {
        ...editingIncome,
        paymentMethod: 'split',
        cardAmount: splitPayment.cardAmount,
        cashAmount: splitPayment.cashAmount
      };
      console.log("Actualizando ingreso con split:", updatedIncome);
      setEditingIncome(updatedIncome);
    } else {
      const updatedNewIncome = {
        ...newIncome,
        paymentMethod: 'split',
        cardAmount: splitPayment.cardAmount,
        cashAmount: splitPayment.cashAmount
      };
      console.log("Creando nuevo ingreso con split:", updatedNewIncome);
      setNewIncome(updatedNewIncome);
    }
    setShowSplitPayment(false);
  };

  const handleDeleteIncome = async () => {
    try {
      const response = await fetch(`/api/sales/income/${editingIncome?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Ingreso eliminado correctamente");
      fetchIncomes();
      setIsEditDialogOpen(false);
      setEditingIncome(null);
      setShowDeleteAlert(false);
    } catch (error) {
      toast.error("Error al eliminar el ingreso");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>N° Ticket</TableHead>
              <TableHead>Barbero</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Método Pago</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Observación</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAddingNew && (
              <TableRow>
                <TableCell>Nuevo</TableCell>
                <TableCell>{format(new Date(), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <Input
                    value={newIncome.ticketNumber}
                    onChange={(e) => setNewIncome({
                      ...newIncome,
                      ticketNumber: e.target.value
                    })}
                    placeholder="N° Ticket"
                    className="w-[100px]"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newIncome.workerId}
                    onValueChange={(value) => setNewIncome({
                      ...newIncome,
                      workerId: value
                    })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={newIncome.serviceId}
                    onValueChange={(value) => handleServiceChange(value, 'new')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Select
                      value={newIncome.paymentMethod}
                      onValueChange={(value) => setNewIncome({
                        ...newIncome,
                        paymentMethod: value,
                        cardAmount: undefined,
                        cashAmount: undefined
                      })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="redcompra">Redcompra</SelectItem>
                        <SelectItem value="plataforma">Plataforma</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSplitPayment({
                          cardAmount: 0,
                          cashAmount: newIncome.amount
                        });
                        setShowSplitPayment(true);
                      }}
                    >
                      Dividir Pago
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(newIncome.amount)}</TableCell>
                <TableCell>
                  <Input
                    value={newIncome.observation || ''}
                    onChange={(e) => setNewIncome(prev => ({
                      ...prev,
                      observation: e.target.value
                    }))}
                    placeholder="Observación"
                    className="w-[140px]"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddIncome}
                      disabled={!newIncome.workerId || !newIncome.serviceId || !newIncome.paymentMethod || !newIncome.ticketNumber}
                      size="sm"
                    >
                      Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewIncome({
                          workerId: "",
                          serviceId: "",
                          amount: 0,
                          paymentMethod: "",
                          ticketNumber: "",
                          observation: "",
                          cardAmount: undefined,
                          cashAmount: undefined
                        });
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {incomes.map((income, index) => (
              <TableRow key={income.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{format(new Date(income.date), "dd/MM/yyyy")}</TableCell>
                <TableCell>{income.ticketNumber}</TableCell>
                <TableCell>{income.workerName}</TableCell>
                <TableCell>{income.serviceName}</TableCell>
                <TableCell>
                  {income.paymentMethod === 'split' ? (
                    <div className="space-y-1 text-sm">
                      <div>Tarjeta: {formatCurrency(income.cardAmount || 0)}</div>
                      <div>Efectivo: {formatCurrency(income.cashAmount || 0)}</div>
                    </div>
                  ) : (
                    income.paymentMethod === 'efectivo' ? 'Efectivo' :
                    income.paymentMethod === 'redcompra' ? 'Redcompra' :
                    'Plataforma'
                  )}
                </TableCell>
                <TableCell>{formatCurrency(income.amount)}</TableCell>
                <TableCell>{income.observation}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setEditingIncome(income);
                      if (income.paymentMethod === 'split') {
                        setSplitPayment({
                          cardAmount: income.cardAmount || 0,
                          cashAmount: income.cashAmount || 0
                        });
                      }
                      setIsEditDialogOpen(true);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ingreso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>N° Ticket</label>
              <Input
                value={editingIncome?.ticketNumber}
                onChange={(e) => setEditingIncome(prev => prev ? {
                  ...prev,
                  ticketNumber: e.target.value
                } : null)}
              />
            </div>
            <div className="space-y-2">
              <label>Profesional</label>
              <Select
                value={editingIncome?.workerId}
                onValueChange={(value) => setEditingIncome(prev => prev ? {
                  ...prev,
                  workerId: value
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Servicio</label>
              <Select
                value={editingIncome?.serviceId}
                onValueChange={(value) => handleServiceChange(value, 'edit')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Método de Pago</label>
              <div className="flex gap-2">
                <Select
                  value={editingIncome?.paymentMethod}
                  onValueChange={(value) => setEditingIncome(prev => prev ? {
                    ...prev,
                    paymentMethod: value,
                    cardAmount: undefined,
                    cashAmount: undefined
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="redcompra">Redcompra</SelectItem>
                    <SelectItem value="plataforma">Plataforma</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSplitPayment({
                      cardAmount: 0,
                      cashAmount: editingIncome?.amount || 0
                    });
                    setShowSplitPayment(true);
                  }}
                >
                  Dividir Pago
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label>Monto</label>
              <div className="text-lg font-medium">
                {formatCurrency(editingIncome?.amount || 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                El monto se actualiza automáticamente según el servicio seleccionado
              </p>
            </div>
            <div className="space-y-2">
              <label>Observación</label>
              <Input
                value={editingIncome?.observation || ''}
                onChange={(e) => setEditingIncome(prev => prev ? {
                  ...prev,
                  observation: e.target.value
                } : null)}
                placeholder="Observación (opcional)"
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                type="button"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingIncome(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleEditIncome}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el ingreso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIncome}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSplitPayment} onOpenChange={setShowSplitPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dividir Pago</DialogTitle>
            <DialogDescription>
              Total a pagar: {formatCurrency(editingIncome?.amount || newIncome.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>Monto en Tarjeta</label>
              <Input
                type="number"
                value={splitPayment.cardAmount}
                onChange={(e) => {
                  const cardAmount = parseInt(e.target.value) || 0;
                  const totalAmount = editingIncome?.amount || newIncome.amount;
                  setSplitPayment(prev => ({
                    ...prev,
                    cardAmount,
                    cashAmount: totalAmount - cardAmount
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <label>Monto en Efectivo</label>
              <Input
                type="number"
                value={splitPayment.cashAmount}
                onChange={(e) => {
                  const cashAmount = parseInt(e.target.value) || 0;
                  const totalAmount = editingIncome?.amount || newIncome.amount;
                  setSplitPayment(prev => ({
                    ...prev,
                    cashAmount,
                    cardAmount: totalAmount - cashAmount
                  }));
                }}
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSplitPayment(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSplitPayment}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 