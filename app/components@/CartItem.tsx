 'use client';
import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;   // 直接使用上下文的类型
  updateQuantity: (id: string, newQty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}
// CartItem.tsx
import { CartItem as CartItemType } from '@/app/contexts@/CartContext'; // 根据实际路径导入



 



 

export const CartItem = memo(function CartItem({
  item,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  const [localQty, setLocalQty] = useState(item.quantity);

  // 同步数量到服务器，带库存保护
  const syncQuantity = async (newQty: number) => {
    if (newQty < 1) newQty = 1;
    if (newQty > item.product.stock) newQty = item.product.stock;
    if (newQty === item.quantity) return;
    try {

      await updateQuantity(item.id, newQty);
    } catch (error) {
      console.error('Update failed:', error);

      
      setLocalQty(item.quantity); // 回退到原数量
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* 商品图片 */}
        <div className="w-20 h-20 relative flex-shrink-0">
          <Image
            src={item.product.imageUrl || 'https://dummyimage.com/300x300/f0f0f0/999999.png&text=No+Image'}
            alt={item.product.name}
            fill
            className="object-cover rounded"
          />
        </div>

        {/* 商品信息 */}
        <div className="flex-1">
          <h3 className="font-semibold">{item.product.name}</h3>
          <p className="text-sm text-gray-600">Price: ${item.product.price}</p>
          <p className="text-xs text-gray-500">Stock: {item.product.stock}</p>
        </div>

        {/* 数量控制 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const nextQty = localQty - 1;
              setLocalQty(nextQty);
              syncQuantity(nextQty);
            }}
            disabled={localQty <= 1}
          >
            −
          </Button>

        <Input
  type="number"
  min={1}
  max={item.product.stock}
  value={localQty}
  onChange={(e) => {
    const rawValue = e.target.value;
    const parsed = parseInt(rawValue, 10);
    let newQty = isNaN(parsed) ? 1 : parsed;
    newQty = Math.min(Math.max(newQty, 1), item.product.stock);
    setLocalQty(newQty);
  }}
  onBlur={() => syncQuantity(localQty)}
  className="w-20 text-center"
/>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const nextQty = localQty + 1;
              setLocalQty(nextQty);
              syncQuantity(nextQty);
            }}
            disabled={localQty >= item.product.stock}
          >
            +
          </Button>
        </div>

        {/* 小计 */}
        <div className="w-24 text-right font-medium">
          ${(item.product.price * localQty).toFixed(2)}
        </div>

        {/* 删除按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.id).catch(console.error)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
});