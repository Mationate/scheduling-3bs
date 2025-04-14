"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface UploadClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadClientsModal({ isOpen, onClose, onSuccess }: UploadClientsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        name: "Juan Pérez",
        email: "juan@ejemplo.com",
        phone: "912345678",
        notes: "Cliente VIP"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "plantilla_clientes.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setIsLoading(true);
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const response = await fetch('/api/clients/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clients: jsonData }),
          });

          if (!response.ok) throw new Error('Error al cargar los clientes');

          toast.success('Clientes cargados exitosamente');
          onSuccess();
          onClose();
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Error al procesar el archivo');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cargar Clientes</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              1. Descarga la plantilla Excel
              <br />
              2. Llena los datos de los clientes
              <br />
              3. Sube el archivo completado
              <br />
              <br />
              Campos requeridos: nombre y email
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 