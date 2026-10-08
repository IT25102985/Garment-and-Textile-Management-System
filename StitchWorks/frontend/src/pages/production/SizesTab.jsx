import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import InlineCrudTable from './InlineCrudTable';

const SizesTab = () => {
    const [sizes, setSizes] = useState([]);
    const load = async () => {
        try { setSizes(await productService.getAllSizes()); }
        catch { toast.error('Failed to load sizes'); }
    };
    useEffect(() => { load(); }, []);
    return (
        <InlineCrudTable
            label="Size"
            items={sizes}
            accentClass="bg-amber-50 text-amber-700 border-amber-100"
            onAdd={async (name) => { await productService.createSize({ name }); toast.success('Size added'); load(); }}
            onUpdate={async (id, name) => { await productService.updateSize(id, { name }); toast.success('Size updated'); load(); }}
            onDelete={async (id) => { await productService.deleteSize(id); toast.success('Size deleted'); load(); }}
        />
    );
};

export default SizesTab;
