export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
}

export interface Order {
  id: number;
  customerId: number;
  products: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: Date;
}

export interface OrderWithCustomer extends Order {
  customer: {
    id: number;
    name: string;
  };
}
