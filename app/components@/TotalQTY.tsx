'use client';

import { useCart } from "../contexts@/CartContext";

export default function TotalQuantity() {
  const { cart, totalQuantity } = useCart();

  // Placeholder state (cart not loaded yet)
  if (cart === null) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-300 animate-pulse text-xs text-white">
        {/* Can show a dot or leave blank */}
        &nbsp;
      </span>
    );
  }

  // Show actual quantity
  return totalQuantity > 0 ? (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-xs text-white font-bold">
      {totalQuantity}
    </span>
  ) : null; // Do not show badge when quantity is 0
}