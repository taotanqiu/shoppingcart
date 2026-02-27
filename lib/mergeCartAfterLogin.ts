


import { useCart } from "@/app/contexts@/CartContext";



export async function useMergeCartAfterLogin() {

    const {refreshCart}= useCart()
  try {
    const response = await fetch('/api/cart/merge', {
      method: 'POST',
      credentials: 'include', 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);

      return;
    }

    const result = await response.json();
  
refreshCart()
   
  } catch (error) {
    console.error( error);
  }
}