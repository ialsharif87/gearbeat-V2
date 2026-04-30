"use client";

import { useCart } from "../context/cart-context";
import T from "./t";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd} 
      className={`btn btn-large ${added ? 'btn-success' : 'btn-primary'}`}
      disabled={added}
    >
      {added ? (
        <T en="Added!" ar="تم الإضافة!" />
      ) : (
        <T en="Add to Cart" ar="أضف للسلة" />
      )}
    </button>
  );
}
