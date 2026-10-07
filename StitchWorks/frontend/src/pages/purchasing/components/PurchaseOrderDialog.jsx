import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { supplierApi } from '../api/supplierApi';
import { purchaseOrderApi } from '../api/purchaseOrderApi';
import { materialApi } from '../api/materialApi';

export const PurchaseOrderDialog = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState([]); // { rawMaterialId, quantity, unitPrice }

  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: supplierApi.getAll });
  const { data: materials } = useQuery({ queryKey: ['materials'], queryFn: () => materialApi.getAll() });

  const mutation = useMutation({
    mutationFn: purchaseOrderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      toast.success('PO Created successfully');
      setSupplierId('');
      setExpectedDate('');
      setItems([]);
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to create PO')
  });

  const handleAddItem = () => setItems([...items, { rawMaterialId: '', quantity: 1, unitPrice: 0 }]);
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'rawMaterialId') {
      const mat = materials?.find(m => m.id.toString() === value);
      if (mat) newItems[index].unitPrice = mat.pricePerUnit;
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || items.length === 0 || items.some(i => !i.rawMaterialId || i.quantity <= 0)) {
      return toast.error('Please fill all required fields correctly');
    }
    mutation.mutate({
      supplierId: parseInt(supplierId),
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate || null,
      items: items.map(i => ({
        rawMaterialId: parseInt(i.rawMaterialId),
        quantity: parseFloat(i.quantity),
        unitPrice: parseFloat(i.unitPrice)
      }))
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white">
          <DialogTitle className="text-xl font-bold text-slate-900">Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form id="poForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                <option value="">Select Supplier...</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}><Plus className="w-3 h-3 mr-1"/> Add Item</Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border">
                  <div className="flex-1">
                    <select className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                            value={item.rawMaterialId} onChange={e => handleItemChange(idx, 'rawMaterialId', e.target.value)} required>
                      <option value="">Select Material...</option>
                      {materials?.filter(m => !supplierId || m.supplierId?.toString() === supplierId).map(m => 
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      )}
                    </select>
                  </div>
                  <div className="w-24">
                    <Input type="number" step="0.01" min="0.1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} placeholder="Qty" required />
                  </div>
                  <div className="w-32">
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-2">Rs.</span>
                      <Input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} placeholder="Price" required />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-lg">No items added yet</p>}
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 p-6 shrink-0 border-t border-gray-100 bg-white">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="poForm" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create PO'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

