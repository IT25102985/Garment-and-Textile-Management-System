import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Skeleton } from '@/components/common/ui/skeleton';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/common/ui/collapsible';
import { CategoryCard } from './CategoryCard';
import { CategoryDialog } from './CategoryDialog';
import { useCategories } from '../hooks/useCategories';
import { toast } from 'react-toastify';

export const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  const { categoriesQuery, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = async (category) => {
    const willProceed = window.confirm(category.materialCount > 0
      ? 'This category has materials. Deleting it will disassociate those materials. Proceed?'
      : 'Are you sure you want to delete this category?');
    if (!willProceed) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success('Category deleted');
      if (selectedCategory?.id === category.id) {
        onSelectCategory(null);
      }
    } catch (e) {
      toast.error('Failed to delete category');
    }
  };

  const handleSave = async (formData) => {
    if (editingCategory) {
      const res = await updateCategory.mutateAsync({ id: editingCategory.id, formData });
      toast.success('Category updated');
      if (selectedCategory?.id === editingCategory.id) {
        onSelectCategory(res);
      }
    } else {
      const res = await createCategory.mutateAsync(formData);
      toast.success('Category created');
      onSelectCategory(res);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold tracking-tight text-gray-900">Categories</h2>
          <Button onClick={handleAdd} size="sm" className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-col gap-3 overflow-y-auto pr-2 pb-20 premium-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {categoriesQuery.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : (
            categoriesQuery.data?.map(cat => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                isSelected={selectedCategory?.id === cat.id}
                onClick={(c) => onSelectCategory(c)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <Collapsible open={isMobileOpen} onOpenChange={setIsMobileOpen} className="border rounded-2xl bg-card p-4">
            <CollapsibleTrigger className="flex w-full justify-between items-center font-medium">
              <span>{selectedCategory ? selectedCategory.name : 'Select a Category'}</span>
              <span className="text-muted-foreground text-sm">
                {isMobileOpen ? 'Close' : 'Expand'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 flex flex-col gap-3">
              {categoriesQuery.isLoading ? (
                <Skeleton className="h-24 w-full rounded-2xl" />
              ) : (
                categoriesQuery.data?.map(cat => (
                  <CategoryCard 
                    key={cat.id} 
                    category={cat} 
                    isSelected={selectedCategory?.id === cat.id}
                    onClick={(c) => { onSelectCategory(c); setIsMobileOpen(false); }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <CategoryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        category={editingCategory}
        onSave={handleSave}
      />
    </>
  );
};

