import Link from "next/link"
 
import { auth } from "@/lib/auth"

import { prisma } from '@/lib/prisma';

// after session check:


import React from 'react'


import { headers } from "next/headers";
import Image from "next/image";
import EmailPasswordSignOutButton from "./EmailPasswordSignOutButton";
import TotalQuantity from "./TotalQTY";
import { ShoppingCart } from 'lucide-react';

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

let isAdmin = false;
let isUser= false;
if (session?.user?.id) {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  isAdmin = user?.role === 'ADMIN';
  isUser = user?.role === 'USER';
}





 
  
    return (
        <div className="w-full bg-blue-500 text-white px-6 py-4 block sm:flex justify-between items-center">
    
    
    
    
       <div className="w-full bg-blue-500 text-white px-6 py-4 flex justify-between items-center">
         <Link href="/">Home</Link>


                {!isAdmin && <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <ShoppingCart className="w-5 h-5" />
       <TotalQuantity/>
      </div>
      <Link 
        href="/cart" 
        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
      >
        Cart
      </Link>
    </div>  }
       </div>
             
        

<div className="flex items-center gap-1 justify-end bg-red-5000 w-full">
  {!session && <Link href="/Register"  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition">Register</Link>}
{!session && <Link href="/Login" className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition">Login</Link>}
{session && <EmailPasswordSignOutButton/>}
  
{isAdmin && <span  className="font-bold px-2 py-1">Admin&nbsp;: </span>  }
{isUser && <span  className="font-bold px-2 py-1">User&nbsp;: </span>  }
<span>{session?.user?.email}</span> 


 



{!isAdmin && session?.user.image && (
  <Image
    src={`${session.user.image}`}
    width={50}
    height={50}
    alt="Picture of the author"
    className="hidden sm:inline-block"
  />
)}
</div>

</div>

    )}
