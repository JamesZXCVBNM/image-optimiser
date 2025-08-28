import React, { useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../constants';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isDragOver: boolean;
  onDragOver: (isDragOver: boolean) => void;
  error?: string;
}

export function DropZone({ onFileSelect, isDragOver, onDragOver, error }: DropZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(true);
  }, [onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onDragOver(false);
    }
  }, [onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ACCEPTED_FILE_TYPES.includes(file.type));
    
    if (imageFile && imageFile.size <= MAX_FILE_SIZE) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect, onDragOver]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ACCEPTED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${
            error ? 'bg-red-100' : 'bg-white shadow-sm'
          }`}>
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${
              error ? 'text-red-700' : 'text-gray-900'
            }`}>
              {error ? 'Upload Error' : 'Drop your image here'}
            </h3>
            {error ? (
              <p className="text-red-600 text-sm">{error}</p>
            ) : (
              <div className="text-gray-500 text-sm space-y-1">
                <p>or click to browse files</p>
                <p className="text-xs">
                  Supports PNG, JPEG, WebP, TIFF up to {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}