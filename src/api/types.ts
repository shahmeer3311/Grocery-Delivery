export interface CartItem {
  _id?: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  unit?: string;
  description?: string;
  stock?: number;
  quantity?: number;
}

export interface CartResponse {
  ok: boolean;
  cart: CartItem[];
}
