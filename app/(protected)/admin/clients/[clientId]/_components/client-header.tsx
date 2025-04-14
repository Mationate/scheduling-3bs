"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ClientDetails } from "../types";

interface ClientHeaderProps {
  client: ClientDetails;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const router = useRouter();

  const handleWhatsApp = () => {
    if (client.phone) {
      window.open(`https://wa.me/${client.phone}`, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">{client.name}</h1>
      </div>
      <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600">
        <MessageCircle className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
    </div>
  );
} 