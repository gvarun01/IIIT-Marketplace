import { User } from "./user";

interface OrderItem {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    price: number;
    sellerId : User;
  };
  quantity: number;
}
interface Order {
  _id: string;
  transactionId: string;
  buyerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

  export type { Order, OrderItem };