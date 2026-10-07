import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/ui/button';

export const SingleImageUploader = ({ value, onChange, placeholder = "Drag & drop an image here" }) => {
  const [preview, setPreview] = useState(value instanceof File ? URL.createObjectURL(value) : value);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors bg-white/5",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-white/10"
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative w-full h-full p-2">
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
          <UploadCloud className="w-10 h-10 mb-3" />
          <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs">{placeholder}</p>
        </div>
      )}
    </div>
  );
};

export const MultiImageUploader = ({ existingImages = [], onRemoveExisting, newFiles = [], onChangeNewFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      const remainingSlots = 5 - existingImages.length - newFiles.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      onChangeNewFiles([...newFiles, ...filesToAdd]);
    }
  }, [existingImages, newFiles, onChangeNewFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
    disabled: (existingImages.length + newFiles.length) >= 5
  });

  const removeExisting = (e, id) => {
    e.stopPropagation();
    onRemoveExisting(id);
  };

  const removeNew = (e, index) => {
    e.stopPropagation();
    const updated = [...newFiles];
    updated.splice(index, 1);
    onChangeNewFiles(updated);
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors bg-white/5",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-white/10",
          totalImages >= 5 && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
          <UploadCloud className="w-8 h-8 mb-2" />
          <p className="text-sm"><span className="font-semibold">Upload Images</span> (Max 5)</p>
          <p className="text-xs">{totalImages}/5 uploaded</p>
        </div>
      </div>

      {totalImages > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingImages.map((imgUrl, idx) => (
            <div key={idx} className="relative aspect-square">
              <img src={imgUrl} alt="Existing" className="w-full h-full object-cover rounded-lg border border-border" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={(e) => removeExisting(e, imgUrl)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {newFiles.map((file, idx) => (
            <div key={idx} className="relative aspect-square">
              <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover rounded-lg border border-border" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={(e) => removeNew(e, idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

