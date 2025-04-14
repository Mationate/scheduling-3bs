export interface Booking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  client: {
    name: string | null;
    email: string;
    phone?: string;
  };
  service: { 
    id: string; 
    name: string;
  };
  worker: { 
    id: string; 
    name: string; 
    avatar: string;
  };
} 