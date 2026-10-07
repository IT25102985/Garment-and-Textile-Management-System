import React from 'react';
import { Edit2, Trash2, Box } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export const MaterialCard = ({ material, onEdit, onDelete }) => {
  return (
    <div className="group relative flex flex-col bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full">
      {/* Card Image Area */}
      <div className="relative w-full bg-slate-50 border-b border-gray-100 overflow-hidden">
        {material.images && material.images.length > 0 ? (
          <Carousel 
            showArrows={material.images.length > 1} 
            showStatus={false} 
            showThumbs={false} 
            infiniteLoop={true} 
            dynamicHeight={false} 
            className="h-52"
          >
            {material.images.map((img, idx) => (
              <div key={idx} className="h-52 w-full bg-slate-50 flex items-center justify-center">
                <img 
                  src={img.imageUrl || img} 
                  alt={`${material.name} ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="h-52 w-full flex flex-col items-center justify-center bg-slate-50 text-gray-300">
            <Box className="h-12 w-12 stroke-1" />
            <span className="text-xs text-gray-400 mt-2 font-medium">No preview image</span>
          </div>
        )}

        {/* Quick action buttons floating on top-right of image */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-sm border border-white/60">
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(material); }} 
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Edit Material"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(material); }} 
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete Material"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {/* Card Content Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug break-words flex-1 group-hover:text-blue-600 transition-colors">
            {material.name}
          </h3>
        </div>

        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {material.description || 'No description provided.'}
        </p>
        
        {/* Custom Fields Badges */}
        {material.customFields && Object.keys(material.customFields).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {Object.entries(material.customFields).map(([key, value]) => (
              <span key={key} className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <span className="text-slate-400 font-normal mr-1">{key}:</span> {value}
              </span>
            ))}
          </div>
        )}
        
        {/* Footer Pricing and Unit */}
        <div className="pt-3.5 mt-auto flex items-center justify-between border-t border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Price / Unit</span>
            <span className="text-base font-extrabold text-gray-900">
              Rs. {Number(material.pricePerUnit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {material.unit && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Unit</span>
              <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {material.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

