import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { supplierApi } from '../api/supplierApi';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  performanceRating: z.string().optional(),
});

export const SupplierDialog = ({ open, onOpenChange, supplier }) => {
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '', contactPerson: '', email: '', phone: '', address: '', paymentTerms: '', performanceRating: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        reset({
          name: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          paymentTerms: supplier.paymentTerms || '',
          performanceRating: supplier.performanceRating?.toString() || ''
        });
      } else {
        reset({ name: '', contactPerson: '', email: '', phone: '', address: '', paymentTerms: '', performanceRating: '' });
      }
    }
  }, [open, supplier, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? supplierApi.update({ id: supplier.id, ...data }) : supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success(isEditing ? 'Supplier updated' : 'Supplier created');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to save supplier')
  });

  const onSubmit = (data) => {
    // Clean up empty strings
    const payload = { ...data };
    if (!payload.performanceRating) payload.performanceRating = null;
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>
        <form id="supplierForm" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input {...register('name')} placeholder="e.g. Apex Textiles" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input {...register('contactPerson')} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email</Label>
              <Input {...register('email')} type="email" placeholder="contact@apex.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Input {...register('address')} placeholder="123 Industrial Way" />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Input {...register('paymentTerms')} placeholder="e.g. Net 30" />
            </div>
            <div className="space-y-2">
              <Label>Performance Rating (0-5)</Label>
              <Input {...register('performanceRating')} type="number" step="0.1" min="0" max="5" placeholder="4.5" />
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 p-6 shrink-0 border-t border-gray-100 bg-white">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="supplierForm" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Supplier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

