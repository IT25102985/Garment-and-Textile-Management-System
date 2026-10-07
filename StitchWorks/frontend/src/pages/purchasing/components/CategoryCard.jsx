import React from 'react';
import { PackageOpen, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/ui/button';

export const CategoryCard = ({ category, isSelected, onClick, onEdit, onDelete }) => {
  return (
    <div 
      onClick={() => onClick(category)}
      className={cn(
        "group relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        isSelected 
          ? "bg-blue-50/90 border-blue-200 text-blue-950 shadow-xs" 
          : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50/80 text-gray-700"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200/60 shadow-xs">
          {category.coverImageUrl ? (
            <img src={category.coverImageUrl} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <PackageOpen className={cn("h-5 w-5", isSelected ? "text-blue-600" : "text-gray-400")} />
          )}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className={cn("font-semibold text-sm leading-tight truncate", isSelected ? "text-blue-900" : "text-gray-800")}>
            {category.name}
          </h4>
          <span className="text-xs font-medium text-gray-500 mt-0.5">
            {category.materialCount || 0} {category.materialCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button 
          type="button"
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-100/70 rounded-lg transition-colors cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(category); }}
          title="Edit Category"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button 
          type="button"
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-100/70 rounded-lg transition-colors cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(category); }}
          title="Delete Category"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

