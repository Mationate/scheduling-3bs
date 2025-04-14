"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ClientHeader } from "./_components/client-header";
import { ClientInfoCards } from "./_components/client-info-cards";
import { BookingHistory } from "./_components/booking-history";
import type { ClientDetails } from "./types";

export default function ClientPage() {
  const params = useParams();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, []);

  const fetchClientDetails = async () => {
    try {
      const response = await fetch(`/api/clients/${params.clientId}/details`);
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast.error("Error al cargar los detalles del cliente");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ClientHeader client={client} />
      <ClientInfoCards client={client} />
      <BookingHistory bookings={client.bookings} />
    </div>
  );
} 