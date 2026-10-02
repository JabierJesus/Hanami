"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";
import { Product } from "@/data/products";

type ProductWithStock = Product & {
  stock?: number;
};

type CartItem = {
  product: ProductWithStock;
  quantity: number;
  option?: string;
};

type CartContextType = {
  cart: CartItem[];
  locationId: string;
  setLocationId: (locationId: string) => void;
  addToCart: (
    product: ProductWithStock,
    option?: string
  ) => void;
  increaseQuantity: (
    productId: string,
    option?: string
  ) => void;
  decreaseQuantity: (
    productId: string,
    option?: string
  ) => void;
  removeFromCart: (
    productId: string,
    option?: string
  ) => void;
  clearCart: () => void;
};

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const [locationId, setLocationIdState] =
    useState(
      "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3"
    );

  const setLocationId = (newLocationId: string) => {
    if (newLocationId === locationId) {
      return;
    }

    if (cart.length > 0) {
      const confirmed = window.confirm(
        "Tienes productos en tu pedido.\n\nSi cambias de local, tu pedido actual se vaciará.\n\n¿Quieres cambiar de local?"
      );

      if (!confirmed) {
        return;
      }

      setCart([]);
    }

    setLocationIdState(newLocationId);
  };

  const addToCart = (
    product: ProductWithStock,
    option?: string
  ) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.product.id === product.id &&
          item.option === option
      );

      const currentQuantity = currentCart
        .filter(
          (item) => item.product.id === product.id
        )
        .reduce(
          (total, item) => total + item.quantity,
          0
        );

      if (
        product.stock !== undefined &&
        currentQuantity >= product.stock
      ) {
        return currentCart;
      }

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
    setCart((currentCart) => {
      const item = currentCart.find(
        (item) =>
          item.product.id === productId &&
          item.option === option
      );

      if (!item) {
        return currentCart;
      }

      const currentQuantity = currentCart
        .filter(
          (item) => item.product.id === productId
        )
        .reduce(
          (total, item) => total + item.quantity,
          0
        );

      if (
        item.product.stock !== undefined &&
        currentQuantity >= item.product.stock
      ) {
        return currentCart;
      }

      return currentCart.map((item) =>
        item.product.id === productId &&
        item.option === option
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    });
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

  const clearCart = () => {
    setCart([]);
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
        clearCart,
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