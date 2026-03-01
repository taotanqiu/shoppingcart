
"use client";

import { Button } from "@/components/ui/button";
 import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

 import { useRouter } from 'next/navigation';





interface DeleteButtonProps {
  productId: string;
  
}


            

export default function ProductDeleteButton({ productId }: DeleteButtonProps) {
   const router = useRouter();

const  handledeleteProduct = async (productId:string) => {



        try {
           const res = await fetch(`/api/products/delete/${productId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('删除失败');
  const data = await res.json();
  console.log('删除成功', data);
 router.push('/')
  //  ==========================
        } catch (err) {
        console.log(err)
        
        }
      }




  return (
   
       <AlertDialog>
      <AlertDialogTrigger asChild>

 
 <Button 
            
            
 
                // 小号按钮
       
        className="transition-colors duration-200 bg-red-300  hover:bg-red-700  "
            
            
            
            ><Trash2 className="w-4 h-4" /></Button>

 
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-500">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
          className="transition-colors duration-200 bg-red-500  hover:bg-red-700 "
          
          onClick={()=>handledeleteProduct(productId)} >Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
           

    
  );
}


