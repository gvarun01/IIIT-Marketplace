import { User } from "../types/user";
 

interface Review {
    reviewer: User;
    rating: number;
    comment?: string;
    _id: string;
    createdAt: string;
  }

  interface Item {
    _id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    sellerId: User;
    images: string[];
    averageRating: number;
    totalReviews: number;
    reviews: Review[];
    createdAt: string;
    updatedAt: string;
  }
  
  export type { Item, Review };