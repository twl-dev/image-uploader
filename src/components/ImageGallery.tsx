import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageData {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  uploaded_at: string;
  url?: string;
}

interface ImageGalleryProps {
  isAdmin?: boolean;
}

export default function ImageGallery({ isAdmin = false }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      setLoading(true);
      
      // Fetch image metadata from database
      const { data: imageData, error: dbError } = await supabase
        .from('images')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (dbError) throw dbError;

      // Get public URLs for each image
      const imagesWithUrls = await Promise.all(
        (imageData || []).map(async (img) => {
          const { data } = supabase.storage
            .from('ai-images')
            .getPublicUrl(img.filename);
          
          return {
            ...img,
            url: data.publicUrl
          };
        })
      );

      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (image: ImageData) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeleting(image.id);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ai-images')
        .remove([image.filename]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // Update local state
      setImages(images.filter(img => img.id !== image.id));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    loadImages();

    // Set up real-time subscription for new uploads
    const subscription = supabase
      .channel('images')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'images' }, () => {
        loadImages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'Admin Gallery' : 'AI Art Gallery'}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadImages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
          <span className="text-sm text-gray-500">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No AI creations shared yet</p>
          <p className="text-gray-400 text-sm mt-2">Images will appear here as students upload them</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div 
                  className="aspect-square bg-gray-100 cursor-pointer relative group"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.original_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate mb-2">
                    {image.original_name}
                  </h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{formatFileSize(image.file_size)}</p>
                    <p>{formatDate(image.uploaded_at)}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center justify-end space-x-2 mt-3">
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteImage(image)}
                        disabled={deleting === image.id}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === image.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Image Modal */}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="max-w-4xl max-h-full bg-white rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.original_name}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 border-t">
                  <h3 className="text-lg font-semibold mb-2">{selectedImage.original_name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatFileSize(selectedImage.file_size)}</span>
                    <span>{formatDate(selectedImage.uploaded_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}