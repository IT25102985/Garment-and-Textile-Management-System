import React, { useState } from 'react';
import { Plus, PackageSearch } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Skeleton } from '@/components/common/ui/skeleton';
import { MaterialCard } from './MaterialCard';
import { MaterialDialog } from './MaterialDialog';
import { useMaterials } from '../hooks/useMaterials';
import { toast } from 'react-toastify';

export const MaterialGrid = ({ selectedCategory }) => {
  const categoryId = selectedCategory?.id;
  const { materialsQuery, createMaterial, updateMaterial, deleteMaterial } = useMaterials(categoryId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const handleAdd = () => {
    setEditingMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  const handleDelete = async (material) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteMaterial.mutateAsync(material.id);
        toast.success('Material deleted');
      } catch (e) {
        toast.error('Failed to delete material');
      }
    }
  };

  const handleSave = async (formData) => {
    if (editingMaterial) {
      await updateMaterial.mutateAsync({ id: editingMaterial.id, formData });
      toast.success('Material updated');
    } else {
      await createMaterial.mutateAsync(formData);
      toast.success('Material created');
    }
  };

  if (!categoryId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gray-50/80 max-w-md w-full border border-gray-100">
          <PackageSearch className="h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">No Category Selected</h3>
          <p className="text-gray-500 text-sm">Select a category from the sidebar to view and manage its materials.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Materials in {selectedCategory.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {materialsQuery.data?.length || 0} {materialsQuery.data?.length === 1 ? 'material' : 'materials'} configured
            </p>
          </div>
          <Button 
            onClick={handleAdd} 
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto premium-scrollbar pb-20 pr-2">
          {materialsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : materialsQuery.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-[400px] w-full rounded-2xl bg-white border border-gray-100 shadow-sm">
                <PackageSearch className="h-12 w-12 text-gray-300 mb-3" />
                <h4 className="text-sm font-semibold text-gray-800">No materials found</h4>
                <p className="text-xs text-gray-500 mt-1 mb-4">There are no materials in this category yet.</p>
                <Button onClick={handleAdd} size="sm" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add First Material
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {materialsQuery.data?.map(mat => (
                <MaterialCard 
                  key={mat.id} 
                  material={mat} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MaterialDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        material={editingMaterial}
        categoryId={categoryId}
        onSave={handleSave}
      />
    </>
  );
};

