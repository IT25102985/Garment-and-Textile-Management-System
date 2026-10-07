import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { purchaseOrderApi } from '../api/purchaseOrderApi';
import { ReceiveShipmentDialog } from './ReceiveShipmentDialog';

export const ReceiveShipmentsTab = () => {
  const [selectedPo, setSelectedPo] = useState(null);

  const { data: pos, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrderApi.getAll
  });

  const activePos = pos?.filter(po => po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED') || [];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Receive Shipments</h2>
          <p className="text-sm text-gray-500">Select an active purchase order to receive materials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePos.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed rounded-xl">
            No active shipments waiting to be received.
          </div>
        ) : activePos.map(po => (
          <div key={po.id} className="border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedPo(po)}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-primary">{po.poNumber}</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase
                    ${po.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {po.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{po.supplierName}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Package className="w-3 h-3" /> {po.items.length} items expected
            </div>
            <Button className="w-full mt-4" variant="secondary" size="sm">Receive Items</Button>
          </div>
        ))}
      </div>

      <ReceiveShipmentDialog 
        open={!!selectedPo} 
        onOpenChange={(v) => { if(!v) setSelectedPo(null); }}
        po={selectedPo}
      />
    </div>
  );
};

