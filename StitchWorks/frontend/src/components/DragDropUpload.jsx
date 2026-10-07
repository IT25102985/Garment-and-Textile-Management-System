import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const DragDropUpload = ({ onFileSelect, acceptedTypes = '.pdf,.dxf', fileName = null, onClear }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClear?.();
    };

    return (
        <div className="w-full">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                        ? 'border-[#007AFF] bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {fileName ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                                {fileName}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                Click or drag to replace
                            </div>
                        </div>
                        <button
                            onClick={handleClear}
                            className="p-2 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0"
                        >
                            <FiX size={18} className="text-slate-600" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <FiUploadCloud
                            size={28}
                            className={`transition-colors ${isDragging ? 'text-[#007AFF]' : 'text-slate-400'}`}
                        />
                        <div className="text-sm font-semibold text-slate-900">
                            Drag and drop your file here
                        </div>
                        <div className="text-xs text-slate-500">
                            or click to browse (PDF, DXF)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragDropUpload;
