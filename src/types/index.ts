export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
  category: 'main' | 'opening' | 'drink';
  available: boolean;
  stock: number;
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