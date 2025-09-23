export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  available: boolean;
  stock: number;
  date: string;
}

export interface Order {
  items: MenuItem[];
  total: number;
}

export interface PaymentDetails {
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  cvv: string;
}