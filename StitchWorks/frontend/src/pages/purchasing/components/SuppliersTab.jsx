import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { supplierApi } from '../api/supplierApi';
import { SupplierDialog } from './SupplierDialog';

export const SuppliersTab = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierApi.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => queryClient.invalidateQueries(['suppliers'])
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading suppliers...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center justify-start gap-3 mb-1">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Suppliers</h2>
            <Button onClick={() => { setEditingSupplier(null); setIsDialogOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">Manage vendors and their performance</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Payment Terms</th>
              <th className="px-4 py-3 font-medium text-center">Rating</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suppliers?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No suppliers found. Add one to get started.
                </td>
              </tr>
            ) : suppliers?.map((sup) => (
              <tr key={sup.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{sup.name}</td>
                <td className="px-4 py-3 text-gray-600">{sup.contactPerson}</td>
                <td className="px-4 py-3 text-gray-600">{sup.email}</td>
                <td className="px-4 py-3 text-gray-600">{sup.paymentTerms || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {sup.performanceRating ? `${sup.performanceRating}/5` : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => { setEditingSupplier(sup); setIsDialogOpen(true); }}
                      title="Edit Supplier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => {
                        if (window.confirm(`Delete supplier ${sup.name}?`)) {
                          deleteMutation.mutate(sup.id);
                        }
                      }}
                      title="Delete Supplier"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <SupplierDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        supplier={editingSupplier} 
      />
    </div>
  );
};

