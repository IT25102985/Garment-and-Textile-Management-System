import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { purchaseOrderApi } from '../api/purchaseOrderApi';

export const ReceiveShipmentDialog = ({ open, onOpenChange, po }) => {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (open && po) {
      const initial = {};
      po.items.forEach(item => {
        initial[item.id] = 0; // Default received today is 0
      });
      setQuantities(initial);
    }
  }, [open, po]);

  const mutation = useMutation({
    mutationFn: (payload) => purchaseOrderApi.receiveShipment({ id: po.id, receivedQuantities: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast.success('Shipment received successfully');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to process shipment')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    Object.keys(quantities).forEach(k => {
      if (quantities[k] > 0) payload[k] = parseFloat(quantities[k]);
    });
    if (Object.keys(payload).length === 0) return toast.error('Please enter at least one received quantity');
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900">Receive Shipment - {po?.poNumber}</DialogTitle>
        </DialogHeader>
        <form id="receiveForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="space-y-2">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Material</th>
                  <th className="px-4 py-2 text-right">Ordered</th>
                  <th className="px-4 py-2 text-right">Previously Received</th>
                  <th className="px-4 py-2 text-right">Receiving Now</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {po?.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.rawMaterialName}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{item.quantityReceived}</td>
                    <td className="px-4 py-3 w-32">
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        max={item.quantity - item.quantityReceived}
                        className="h-8 text-right"
                        value={quantities[item.id] || ''}
                        onChange={(e) => setQuantities({...quantities, [item.id]: e.target.value})}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
        <div className="flex justify-end gap-2 p-6 shrink-0 border-t border-gray-100 bg-white">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="receiveForm" disabled={mutation.isPending}>{mutation.isPending ? 'Processing...' : 'Confirm Receipt'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

