'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UploadedImage {
  id: string;
  url: string;
  uploadedAt: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/upload');
      const result = await response.json();
      
      if (result.success) {
        setImages(result.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();

    // Listen for new image uploads
    const handleImageUploaded = () => {
      fetchImages();
    };

    window.addEventListener('imageUploaded', handleImageUploaded);
    return () => window.removeEventListener('imageUploaded', handleImageUploaded);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Image Gallery</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Image Gallery</h2>
        <div className="text-center py-12">
          <svg
            className="h-16 w-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No images uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">Upload your first image to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Image Gallery ({images.length} images)
      </h2>
      
      {/* Grid Layout for better composition */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-square relative">
              <Image
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => window.open(image.url, '_blank')}
                className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium transition-opacity duration-300"
              >
                View Full
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Composite View - Shows all images in a masonry-like layout */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Composite View</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((image, index) => (
              <div
                key={`composite-${image.id}`}
                className="break-inside-avoid rounded-lg overflow-hidden shadow-sm"
              >
                <Image
                  src={image.url}
                  alt={`Composite image ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}