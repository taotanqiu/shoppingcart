// app/products/add/page.tsx
'use client';
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
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

// Zod validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ProductAddPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- ROLE CHECK (from API) -----
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    isActive: true,
  });


  useEffect(() => {
    fetch('/api/user/role')
      .then(res => {
        if (res.status === 401) {
          // Not logged in
          setRole(null);
          setRoleLoading(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.role) {
          setRole(data.role);
        } else {
          setRole(null);
        }
        setRoleLoading(false);
      })
      .catch(() => {
        setRole(null);
        setRoleLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!roleLoading) {
      if (role !== 'ADMIN') {
        router.replace('/'); // redirect non‑admins to homepage
      }
    }
  }, [role, roleLoading, router]);

  if (roleLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (role !== 'ADMIN') {
    return null; // will be redirected by the effect
  }
  // --------------------------------

  // Form state
  
  

  // Handle regular input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  // Upload image to server
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
    return data.url; // backend should return { url: '/uploads/xxx.jpg' }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setPreview(url); // replace with actual URL
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Unknown error';
      setServerError(errorMessage);
      setPreview(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl); // free memory
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Form validation (including image URL)
  const validateForm = (): boolean => {
    const fullData = {
      ...formData,
      imageUrl: imageUrl || '',
    };
    const result = productSchema.safeParse(fullData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof FormData;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Submit form
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Creation failed');
      }

      router.push('/');
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
            Add New Product
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Global error message */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Image upload area */}
            <div className="flex items-start gap-4">
              {preview && (
                <div className="relative w-24 h-24 rounded overflow-hidden">
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
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
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
              {/* Price */}
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
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
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
                {errors.stock && (
                  <p className="text-red-500 text-sm">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Active status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-semibold">
                  Active status – if enabled, product will be visible in the store
                </Label>
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}