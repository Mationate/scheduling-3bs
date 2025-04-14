export interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  totalVisits: number;
  lastVisit: string;
  bookings: Array<{
    date: string;
    service: { name: string };
    worker: { name: string };
    shop: { name: string };
  }>;
} 