export type UserRole = "client" | "master";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'client' | 'master';
  nickname?: string;
  createdAt: any;
  photoURL?: string;
}

export interface MasterProfile extends UserProfile {
  phone: string;
  displayName: string;
  nickname?: string;
  city: string;
  mainCategory: string;
  subcategories: string[];
  experience: number;
  bio: string;
  price: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  slug: string;
  availability: "Kunlik" | "Haftalik";
}

export interface Review {
  id: string;
  masterId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: any;
}
