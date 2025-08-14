import { useMemo } from 'react';
import { getCategoryIcon, getCategoryColor, getAllCategories, getUniqueCategories } from '@/app/config/componentCategories';

export const useComponentCategories = (components: any[]) => {
  const categories = useMemo(() => {
    return getUniqueCategories(components);
  }, [components]);

  const getCategoryIconById = (categoryId: string) => {
    return getCategoryIcon(categoryId);
  };

  const getCategoryColorById = (categoryId: string) => {
    return getCategoryColor(categoryId);
  };

  const getAllAvailableCategories = () => {
    return getAllCategories();
  };

  return {
    categories,
    getCategoryIcon: getCategoryIconById,
    getCategoryColor: getCategoryColorById,
    getAllCategories: getAllAvailableCategories
  };
}; 