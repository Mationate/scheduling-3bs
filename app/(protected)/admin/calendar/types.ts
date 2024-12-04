export interface Booking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  service: {
    id: string;
    name: string;
  };
  worker: {
    id: string;
    name: string;
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
} 