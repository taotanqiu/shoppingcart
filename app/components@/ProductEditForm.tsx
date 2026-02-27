// app/products/[id]/edit/EditProductForm.tsx
'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { productSchema, FormDataType, FormErrors } from '@/app/types/productType';

// Local type for form fields (without imageUrl)
type FormFields = Omit<FormDataType, 'imageUrl'>;

interface EditProductFormProps {
  product: FormDataType & { id: string }; // product must include id and all schema fields
}

export default function ProductEditForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form fields without imageUrl
  const [formData, setFormData] = useState<FormFields>({
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    isActive: product.isActive,
  });

  // Image handling (separate from formData)
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
  const [preview, setPreview] = useState<string | null>(product.imageUrl || null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));

    // Clear error only if the field exists in formData (i.e., not imageUrl)
    if (name in formData) {
      const key = name as keyof FormFields;
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setPreview(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Unknown error';
      setServerError(errorMessage);
      setPreview(product.imageUrl || null); // revert to original on error
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const fullData = {
      ...formData,
      imageUrl: imageUrl || '',
    };
    const result = productSchema.safeParse(fullData);

    
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormDataType; // use FormDataType, not global FormData
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      imageUrl: imageUrl || '',
    };

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/edit/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Update failed');
      }

      router.push('/'); // adjust as needed
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Unknown error';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-5xl font-bold text-gray-800 text-center">
            Edit Product
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Image upload */}
            <div className="flex items-start gap-4">
              {preview && (
                <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700 
                             border border-gray-300 rounded-md 
                             py-2 px-3 
                             file:mr-4 file:py-1.5 file:px-3 
                             file:rounded-md file:border-0 
                             file:text-sm file:font-medium
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to keep current image
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Classic T‑shirt"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-base font-semibold">
                  Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-base font-semibold">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  step="1"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-semibold">
                  Product Status
                </Label>
                <p className="text-sm text-gray-500">
                  When enabled, product will be visible in the store
                </p>
              </div>
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleSwitchChange(e.target.checked)}
                className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-md 
                           checked:bg-blue-600 checked:border-blue-600 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors cursor-pointer
                           relative checked:after:content-['✓'] after:absolute after:text-white 
                           after:text-sm after:inset-0 after:flex after:items-center after:justify-center"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="min-w-[100px]  bg-red-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}