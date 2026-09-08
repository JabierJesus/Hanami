"use client";

import { createContext, useContext, useState } from "react";
import { Product } from "@/data/products";

type CartItem = {
  product: Product;
  quantity: number;
  option?: string;
};

type CartContextType = {
  cart: CartItem[];
  locationId: string;
  setLocationId: (locationId: string) => void;
  addToCart: (product: Product, option?: string) => void;
  increaseQuantity: (productId: string, option?: string) => void;
  decreaseQuantity: (productId: string, option?: string) => void;
  removeFromCart: (productId: string, option?: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const [locationId, setLocationId] = useState(
    "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3"
  );

  const addToCart = (product: Product, option?: string) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product.id === product.id &&
          item.option === option
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id &&
          item.option === option
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
          option,
        },
      ];
    });
  };

  const increaseQuantity = (
    productId: string,
    option?: string
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId &&
        item.option === option
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (
    productId: string,
    option?: string
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId &&
          item.option === option
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (
    productId: string,
    option?: string
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.option === option
          )
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        locationId,
        setLocationId,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider"
    );
  }

  return context;
}