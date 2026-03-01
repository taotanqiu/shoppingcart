
"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
 import { useRouter } from "next/navigation"
 
import { authClient } from "@/lib/auth-client"
import { useCart } from '../contexts@/CartContext';


 

import { useSignOut } from '@/lib/useSignOut';




export default function EmailPasswordSignOutButton() {
    
const signOut = useSignOut();

    return (
        <Button
      onClick={signOut}
      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
    >
      signout  
    </Button>
    )
}
