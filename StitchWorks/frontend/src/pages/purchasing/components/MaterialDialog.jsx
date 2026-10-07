import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/common/ui/dialog';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Label } from '@/components/common/ui/label';
import { MultiImageUploader } from './ImageUploader';
import { useMaterials } from '../hooks/useMaterials';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const materialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit: z.string().optional(),
  pricePerUnit: z.string().min(1, 'Price is required'),
  description: z.string().optional(),
  supplierId: z.string().optional(),
});

export const MaterialDialog = ({ open, onOpenChange, material, categoryId, onSave }) => {
  const { suppliersQuery } = useMaterials(null);
  const suppliers = suppliersQuery.data || [];

  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [customFieldsList, setCustomFieldsList] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '', unit: '', pricePerUnit: '', description: '', supplierId: ''
    }
  });

  useEffect(() => {
    if (open) {
      if (material) {
        reset({
          name: material.name || '',
          unit: material.unit || '',
          pricePerUnit: material.pricePerUnit?.toString() || '',
          description: material.description || '',
          supplierId: material.supplier?.id?.toString() || '',
        });
        setExistingImages(material.images || []);
        if (material.customFields) {
          setCustomFieldsList(Object.entries(material.customFields).map(([k, v]) => ({ key: k, value: v })));
        } else {
          setCustomFieldsList([]);
        }
      } else {
        reset({
          name: '', unit: '', pricePerUnit: '', description: '', supplierId: ''
        });
        setExistingImages([]);
        setCustomFieldsList([]);
      }
      setRemovedImageIds([]);
      setNewFiles([]);
    }
  }, [open, material, reset]);

  const handleRemoveExisting = (url) => {
    setRemovedImageIds(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(imgUrl => imgUrl !== url));
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      if (categoryId !== null && categoryId !== undefined && categoryId !== '' && categoryId !== 'undefined' && categoryId !== 'null') {
        formData.append('categoryId', categoryId);
      }
      
      const fieldsObj = {};
      customFieldsList.forEach(field => {
        if (field.key.trim()) {
          fieldsObj[field.key.trim()] = field.value;
        }
      });
      formData.append('customFields', JSON.stringify(fieldsObj));

      newFiles.forEach(file => {
        formData.append('images', file);
      });

      if (material) {
        const originalUrls = material.images || [];
        const keepingUrls = originalUrls.filter(url => !removedImageIds.includes(url));
        keepingUrls.forEach(url => {
          formData.append('existingImageUrls', url);
        });
      }

      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save material');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 flex flex-col overflow-hidden sm:rounded-2xl bg-white shadow-2xl border border-slate-200/80">
        <div className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-slate-900">{material ? 'Edit Material' : 'Add Material'}</DialogTitle>
        </div>
        
        <form id="material-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
           {/* IMAGE */}
           <div>
              <Label className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4 block">Gallery</Label>
              <MultiImageUploader 
                existingImages={existingImages}
                onRemoveExisting={handleRemoveExisting}
                newFiles={newFiles}
                onChangeNewFiles={setNewFiles}
              />
           </div>

           {/* BASIC INFO */}
           <div className="space-y-6">
              <div>
                 <Input id="name" {...register('name')} placeholder="Material Name" className="text-xl font-medium border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus-visible:ring-1 focus-visible:border-black transition-colors placeholder:text-gray-400 h-auto" />
                 {errors.name && <p className="text-sm text-red-500 mt-2">{errors.name.message}</p>}
              </div>

              <div>
                 <Textarea id="description" {...register('description')} placeholder="Description (Optional)" rows={2} className="text-base resize-none border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus-visible:ring-1 focus-visible:border-black transition-colors placeholder:text-gray-400" />
              </div>

              <div>
                <div className="flex items-center border border-gray-200 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-colors py-1 px-4 group bg-white">
                  <span className="text-lg text-gray-500 group-focus-within:text-black transition-colors mr-2 font-medium">Rs</span>
                  <input id="pricePerUnit" type="number" step="0.01" {...register('pricePerUnit')} placeholder="0.00" className="text-lg flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-2 p-0 placeholder:text-gray-400" />
                  
                  <span className="text-lg text-gray-300 mx-3">/</span>
                  
                  <input id="unit" {...register('unit')} placeholder="Unit (e.g. kg, optional)" className="text-lg w-48 bg-transparent border-none focus:outline-none focus:ring-0 py-2 p-0 placeholder:text-gray-400 text-right" />
                </div>
                {errors.pricePerUnit && <p className="text-sm text-red-500 mt-2">{errors.pricePerUnit.message}</p>}
              </div>

              <div>
                <select 
                  id="supplierId" 
                  {...register('supplierId')}
                  className="w-full text-base border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors bg-white text-gray-900 cursor-pointer"
                >
                  <option value="" className="text-gray-400">Select Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
           </div>

           {/* CUSTOM FIELDS */}
           <div className="pt-2">
              <div className="flex justify-between items-center mb-6">
                <Label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Additional Attributes</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full text-gray-500 hover:text-black hover:bg-gray-100 h-8 px-3"
                  onClick={() => setCustomFieldsList([...customFieldsList, { key: '', value: '' }])}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Property
                </Button>
              </div>
              
              <div className="space-y-4">
                {customFieldsList.map((field, index) => (
                  <div key={index} className="flex flex-col gap-3 group">
                    <div className="flex gap-3 items-center">
                      <Input 
                          placeholder="Property (e.g. Color)" 
                          value={field.key}
                          onChange={(e) => {
                            const newList = [...customFieldsList];
                            newList[index].key = e.target.value;
                            setCustomFieldsList(newList);
                          }}
                          className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-black h-11 px-4"
                      />
                      <span className="text-gray-400 font-medium">:</span>
                      <Input 
                          placeholder="Value (e.g. Red)" 
                          value={field.value}
                          onChange={(e) => {
                            const newList = [...customFieldsList];
                            newList[index].value = e.target.value;
                            setCustomFieldsList(newList);
                          }}
                          className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-black h-11 px-4"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors h-11 w-11 ml-1 flex-shrink-0 rounded-lg border border-transparent hover:border-red-100"
                        onClick={() => {
                          const newList = customFieldsList.filter((_, i) => i !== index);
                          setCustomFieldsList(newList);
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    {/* Divider indicator after row */}
                    {index < customFieldsList.length - 1 && (
                      <div className="h-px bg-gray-100 w-full mt-2" />
                    )}
                  </div>
                ))}
                {customFieldsList.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No custom properties added yet.
                  </p>
                )}
              </div>
           </div>
        </form>
        <div className="flex justify-end gap-2 p-6 shrink-0 border-t border-gray-100 bg-white">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="material-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Material'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

