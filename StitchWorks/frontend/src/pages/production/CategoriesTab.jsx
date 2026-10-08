import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import InlineCrudTable from './InlineCrudTable';

const CategoriesTab = () => {
    const [categories, setCategories] = useState([]);
    const load = async () => {
        try { setCategories(await productService.getAllCategories()); }
        catch { toast.error('Failed to load categories'); }
    };
    useEffect(() => { load(); }, []);
    return (
        <InlineCrudTable
            label="Category"
            items={categories}
            accentClass="bg-violet-50 text-violet-700 border-violet-100"
            allowEdit={true}
            allowDelete={true}
            onAdd={async (name) => { await productService.createCategory({ name }); toast.success('Category added'); load(); }}
            onUpdate={async (id, name) => { await productService.updateCategory(id, { name }); toast.success('Category updated'); load(); }}
            onDelete={async (id) => { await productService.deleteCategory(id); toast.success('Category deleted'); load(); }}
        />
    );
};

export default CategoriesTab;
