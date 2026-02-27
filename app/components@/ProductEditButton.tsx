// components/EditButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface EditButtonProps {
  productId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export default function ProductEditButton({
  productId,
 
 
  showLabel = false,
  label = 'Edit',
 
}: EditButtonProps) {
  const router = useRouter();

  const handleEdit = () => {
    // Navigate to the edit page (adjust the route to match your app structure)
    router.push(`/admin/product/edit/${productId}`);
    // Alternatively, you could open a modal here instead of navigation
  };

  return (
    <Button
    
    
      onClick={handleEdit}
     className="transition-colors duration-200 bg-red-300  hover:bg-red-700  "
    >
      <Pencil className={showLabel ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />
      {showLabel && label}
    </Button>
  );
}