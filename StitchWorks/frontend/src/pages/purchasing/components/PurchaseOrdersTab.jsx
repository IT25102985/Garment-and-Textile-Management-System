import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { purchaseOrderApi } from '../api/purchaseOrderApi';
import { PurchaseOrderDialog } from './PurchaseOrderDialog';
import { ReceiveShipmentDialog } from './ReceiveShipmentDialog';

export const PurchaseOrdersTab = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: pos, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrderApi.getAll
  });

  const payMutation = useMutation({
    mutationFn: purchaseOrderApi.recordPayment,
    onSuccess: () => queryClient.invalidateQueries(['purchase-orders'])
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center justify-start gap-3 mb-1">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Purchase Orders</h2>
            <Button onClick={() => setIsCreateOpen(true)} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">Manage orders, payments, and statuses</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
            <tr>
              <th className="px-4 py-3 font-medium">PO Number</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Order Date</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pos?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No purchase orders found.
                </td>
              </tr>
            ) : pos?.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-semibold text-gray-900">{po.poNumber}</td>
                <td className="px-4 py-3 text-gray-600">{po.supplierName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                    ${po.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                      po.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 
                      po.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{po.orderDate}</td>
                <td className="px-4 py-3 text-right font-medium">Rs. {po.totalAmount}</td>
                <td className="px-4 py-3 text-right text-gray-600">Rs. {po.amountPaid}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {po.status !== 'CLOSED' && po.totalAmount > po.amountPaid && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const amt = prompt('Enter payment amount:');
                        if(amt && !isNaN(amt)) payMutation.mutate({ id: po.id, amount: parseFloat(amt) });
                      }}>
                        Record Payment
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PurchaseOrderDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
};

