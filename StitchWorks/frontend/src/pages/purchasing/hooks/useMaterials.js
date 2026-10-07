import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '../api/materialApi';

export const useMaterials = (categoryId) => {
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: ['materials', categoryId],
    queryFn: () => materialApi.getByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 60000,
  });

  const createMaterial = useMutation({
    mutationFn: materialApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      // update specific category material list if we parsed the formData to get categoryId
    },
  });

  const updateMaterial = useMutation({
    mutationFn: materialApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: materialApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: materialApi.getSuppliers,
    staleTime: 5 * 60000, // 5 minutes
  });

  return {
    materialsQuery,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    suppliersQuery
  };
};
