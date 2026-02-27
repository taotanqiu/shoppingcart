
"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
 import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
export default function EmailPasswordSignOutButton() {
      const router = useRouter()

    const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                // 退出成功后的重定向逻辑
                // window.location.href = "/";
                router.push("/")
                router.refresh()
            },
        },
    });
};
    return (
        <Button
      onClick={handleSignOut}
      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
    >
      signout  
    </Button>
    )
}
