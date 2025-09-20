'use client';

import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Image Gallery Composer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your images and see them composed into a beautiful gallery
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <ImageUpload />
          <ImageGallery />
        </div>
      </div>
    </div>
  );
}
