import React, { useState, useCallback } from 'react';
import { Upload, Image, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadStatus {
  uploading: boolean;
  success: boolean;
  error: string | null;
}

export default function ImageUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<UploadStatus>({
    uploading: false,
    success: false,
    error: null
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setStatus({ uploading: false, success: false, error: 'Please select valid image files' });
      return;
    }

    setStatus({ uploading: true, success: false, error: null });

    try {
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('ai-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('images')
          .insert({
            filename: fileName,
            original_name: file.name,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          });

        if (dbError) throw dbError;
      }

      setStatus({ uploading: false, success: true, error: null });
      setTimeout(() => {
        setStatus({ uploading: false, success: false, error: null });
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ 
        uploading: false, 
        success: false, 
        error: 'Failed to upload image. Please try again.' 
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : status.success
            ? 'border-green-500 bg-green-50'
            : status.error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={status.uploading}
        />

        <div className="space-y-4">
          {status.uploading ? (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-blue-600 font-medium">Uploading your AI creation...</p>
            </>
          ) : status.success ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-green-600 font-medium">Successfully uploaded! Thank you for sharing your AI art.</p>
            </>
          ) : status.error ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-red-600 font-medium">{status.error}</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Share Your AI Creation
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your AI-generated images here, or click to browse
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Image className="w-4 h-4 mr-1" />
                  JPG, PNG, WebP
                </div>
                <div>Max 10MB each</div>
              </div>
            </>
          )}
        </div>

        <label
          htmlFor="file-upload"
          className={`mt-6 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 cursor-pointer ${
            status.uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          {status.uploading ? 'Uploading...' : 'Choose Files'}
        </label>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your images will be displayed publicly and automatically removed at midnight daily.</p>
      </div>
    </div>
  );
}