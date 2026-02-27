
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

 

import { deleteProductAction } from "./ProductDeleteButtonAction";



interface DeleteButtonProps {
  productId: string;
  
}


            
const  handledeleteProduct = async (productId:string) => {


        try {
          await deleteProductAction(productId);
  //  ==========================
        } catch (err) {
        console.log(err)
        
        }
      }

export default function ProductDeleteButton({ productId }: DeleteButtonProps) {
 
  return (
   
       <AlertDialog>
      <AlertDialogTrigger asChild>

 
 <Button 
            
            
 
                // 小号按钮
       
        className="transition-colors duration-200 bg-red-300  hover:bg-red-700  "
            
            
            
            ><Trash2 className="w-4 h-4" /></Button>


      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction  onClick={()=>handledeleteProduct(productId)} >Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
           

    
  );
}


