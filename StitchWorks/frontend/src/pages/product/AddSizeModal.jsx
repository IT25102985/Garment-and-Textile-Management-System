import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import DragDropUpload from '../../components/DragDropUpload';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogFooter,
} from '../../components/common/ui/dialog';

const AddSizeModal = ({ isOpen, onClose, onSubmit, editingSize = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        measurements: [{ topicName: '', measurementValue: '' }],
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editingSize) {
            setFormData({
                name: editingSize.name || '',
                code: editingSize.code || '',
                measurements: editingSize.measurements || [{ topicName: '', measurementValue: '' }],
            });
            setFileName(editingSize.patternBlockFilePath?.split('/').pop() || null);
        } else {
            setFormData({
                name: '',
                code: '',
                measurements: [{ topicName: '', measurementValue: '' }],
            });
            setFileName(null);
        }
        setSelectedFile(null);
    }, [editingSize, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMeasurementChange = (index, field, value) => {
        const newMeasurements = [...formData.measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        setFormData((prev) => ({ ...prev, measurements: newMeasurements }));
    };

    const handleAddMeasurement = () => {
        setFormData((prev) => ({
            ...prev,
            measurements: [...prev.measurements, { topicName: '', measurementValue: '' }],
        }));
    };

    const handleRemoveMeasurement = (index) => {
        if (formData.measurements.length > 1) {
            setFormData((prev) => ({
                ...prev,
                measurements: prev.measurements.filter((_, i) => i !== index),
            }));
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setFileName(file.name);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFileName(null);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.code.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const submitFormData = new FormData();
            submitFormData.append('size', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
            if (selectedFile) {
                submitFormData.append('file', selectedFile);
            }

            await onSubmit(submitFormData, editingSize?.id);
            setFormData({
                name: '',
                code: '',
                measurements: [{ topicName: '', measurementValue: '' }],
            });
            setSelectedFile(null);
            setFileName(null);
            onClose();
        } catch (error) {
            console.error('Error submitting size:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 1. Main Modal Wrapper Container: max-h-[90vh], flex flex-col, overflow-hidden */}
            <DialogContent className="sm:max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-0 flex flex-col max-h-[90vh] overflow-hidden">
                {/* 2. Modal Header: Static top, p-6 pb-4, shrink-0 */}
                <DialogHeader className="p-6 pb-4 shrink-0 border-b border-gray-100 bg-white">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        {editingSize ? 'Edit Size' : 'Add New Size'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                        {editingSize ? 'Update garment size specifications and pattern block' : 'Define size codes, pattern files, and critical measurements'}
                    </DialogDescription>
                </DialogHeader>

                {/* 3. Modal Body: Scrollable middle area, flex-1, overflow-y-auto, px-6 py-4 */}
                <DialogBody className="flex-1 overflow-y-auto px-6 py-4 space-y-5 custom-scrollbar">
                    {/* Name and Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Size Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Medium"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Size Code *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="e.g., M"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Pattern Block File
                        </label>
                        <DragDropUpload
                            onFileSelect={handleFileSelect}
                            fileName={fileName}
                            onClear={handleClearFile}
                        />
                    </div>

                    {/* Measurements */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-semibold text-slate-700">
                                Measurements
                            </label>
                            <button
                                type="button"
                                onClick={handleAddMeasurement}
                                className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:text-blue-700 transition-colors cursor-pointer"
                            >
                                <FiPlus size={14} /> Add Measurement
                            </button>
                        </div>

                        <div className="space-y-2 bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                            {formData.measurements.map((measurement, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <input
                                        type="text"
                                        value={measurement.topicName}
                                        onChange={(e) =>
                                            handleMeasurementChange(index, 'topicName', e.target.value)
                                        }
                                        placeholder="e.g., Collar Size"
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={measurement.measurementValue}
                                        onChange={(e) =>
                                            handleMeasurementChange(index, 'measurementValue', e.target.value)
                                        }
                                        placeholder="e.g., 15.5 inches"
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-blue-500/15 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMeasurement(index)}
                                        className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogBody>

                {/* 4. Modal Footer: Static bottom, p-6, shrink-0, border-t border-gray-100 */}
                <DialogFooter className="p-6 shrink-0 border-t border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-lg bg-[#007AFF] text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                        {isLoading ? 'Saving...' : editingSize ? 'Update Size' : 'Create Size'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddSizeModal;
