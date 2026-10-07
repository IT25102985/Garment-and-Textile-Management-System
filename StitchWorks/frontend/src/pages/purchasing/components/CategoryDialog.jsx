import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { SingleImageUploader } from './ImageUploader';
import { toast } from 'react-toastify';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  coverImage: z.any().optional(),
});

export const CategoryDialog = ({ open, onOpenChange, category, onSave }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', coverImage: null }
  });

  const coverImage = watch('coverImage');

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name || '',
          description: category.description || '',
          coverImage: category.coverImageUrl || null,
        });
      } else {
        reset({ name: '', description: '', coverImage: null });
      }
    }
  }, [open, category, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      
      if (data.coverImage instanceof File) {
        formData.append('coverImage', data.coverImage);
      }

      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save category');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900">{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <SingleImageUploader 
                value={coverImage} 
                onChange={(file) => setValue('coverImage', file)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Cotton Fabrics" 
                {...register('name')} 
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Add a brief description..." 
                {...register('description')} 
                rows={3}
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 p-6 shrink-0 border-t border-gray-100 bg-white">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

