import React, { useState, useEffect, useRef } from 'react';
import { CategoryList } from './components/CategoryList';
import { MaterialGrid } from './components/MaterialGrid';
import { SuppliersTab } from './components/SuppliersTab';
import { PurchaseOrdersTab } from './components/PurchaseOrdersTab';
import { ReceiveShipmentsTab } from './components/ReceiveShipmentsTab';

const RawMaterialsAdmin = () => {
  const [activeTab, setActiveTab] = useState('materials'); // 'materials', 'suppliers', 'pos', 'receiving'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const tabs = [
    { id: 'materials', label: 'Raw Materials' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'pos', label: 'Purchase Orders' },
    { id: 'receiving', label: 'Receive Shipments' }
  ];

  const [bubbleStyle, setBubbleStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];
    
    if (activeTabElement) {
      setBubbleStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth
      });
    }
  }, [activeTab]);

  return (
    <div className="container-fluid h-full p-4 md:p-6 lg:p-8 bg-background/50 flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Supplier & Raw Material Management</h1>
        <p className="text-muted-foreground mt-2">Unified workspace for materials, vendors, and purchasing.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="relative flex p-1 bg-gray-100/80 rounded-full mb-6 w-fit border border-gray-200 shadow-inner">
        {/* The sliding bubble */}
        <div 
          className="absolute top-1 bottom-1 bg-white rounded-[50px] shadow-sm"
          style={{
            ...bubbleStyle,
            transition: 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        />
        
        {/* Tab Buttons */}
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabsRef.current[index] = el}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
              activeTab === tab.id 
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'materials' && (
          <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="w-full md:w-[280px] lg:w-[300px] flex-shrink-0 h-full">
              <CategoryList 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
            </div>
            <div className="flex-1 h-full min-w-0">
              <MaterialGrid selectedCategory={selectedCategory} />
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && <SuppliersTab />}
        
        {activeTab === 'pos' && <PurchaseOrdersTab />}
        
        {activeTab === 'receiving' && <ReceiveShipmentsTab />}
      </div>
    </div>
  );
};

export default RawMaterialsAdmin;
