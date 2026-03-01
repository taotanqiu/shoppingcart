// hooks/useSignOut.ts
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client'; // 根据你的实际路径调整
import { useCart } from '@/app/contexts@/CartContext';

export function useSignOut() {
  const router = useRouter();
  const { clearCart } = useCart();

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // 清除客户端 anonymous_id cookie
            document.cookie = 'anonymous_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            // 重置购物车状态
            clearCart();
            // 跳转并刷新
            router.push('/');
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // 可根据需要添加错误处理（例如 toast 提示）
    }
  }, [router, clearCart]);

  return signOut;
}