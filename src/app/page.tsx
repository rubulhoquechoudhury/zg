'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface UploadedImage {
  url: string;
  id: string;
}

interface MosaicResult {
  mosaicUrl: string;
  mosaicId: string;
  tilesUsed: number;
  gridSize: number;
}

export default function Home() {
  const [tileImages, setTileImages] = useState<File[]>([]);
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [uploadedTiles, setUploadedTiles] = useState<UploadedImage[]>([]);
  const [targetImageUrl, setTargetImageUrl] = useState<string>('');
  const [mosaic, setMosaic] = useState<MosaicResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string>('');

  const tileInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleTileImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTileImages(Array.from(e.target.files));
    }
  };

  const handleTargetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTargetImage(e.target.files[0]);
    }
  };

  const uploadImages = async () => {
    if (tileImages.length === 0) {
      setError('Please select tile images first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      tileImages.forEach(file => formData.append('images', file));
      formData.append('tileSize', '50');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedTiles(result.images);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadTargetImage = async () => {
    if (!targetImage) {
      setError('Please select a target image first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('images', targetImage);
      formData.append('tileSize', '800'); // Larger size for target image

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.images.length > 0) {
        setTargetImageUrl(result.images[0].url);
      } else {
        setError(result.error || 'Target image upload failed');
      }
    } catch (error) {
      setError('Target image upload failed');
      console.error('Target upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const generateMosaic = async () => {
    if (!targetImageUrl || uploadedTiles.length === 0) {
      setError('Please upload both target image and tile images first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/mosaic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetImageUrl,
          tileImageUrls: uploadedTiles.map(img => img.url),
          gridSize: 50,
          outputWidth: 2000,
          outputHeight: 2000,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMosaic(result);
      } else {
        setError(result.error || 'Mosaic generation failed');
      }
    } catch (error) {
      setError('Mosaic generation failed');
      console.error('Mosaic error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMosaic = () => {
    if (mosaic) {
      const link = document.createElement('a');
      link.href = mosaic.mosaicUrl;
      link.download = `mosaic-${mosaic.mosaicId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Photo Mosaic Generator
          </h1>
          <p className="text-gray-600">
            Create beautiful photo mosaics from your images
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Images</h2>
            
            {/* Tile Images Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tile Images (Multiple small images)
              </label>
              <input
                ref={tileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleTileImagesChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Selected: {tileImages.length} images
              </p>
              <button
                onClick={uploadImages}
                disabled={isUploading || tileImages.length === 0}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Tile Images'}
              </button>
              {uploadedTiles.length > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ {uploadedTiles.length} tiles uploaded successfully
                </p>
              )}
            </div>

            {/* Target Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Image (Main image for mosaic)
              </label>
              <input
                ref={targetInputRef}
                type="file"
                accept="image/*"
                onChange={handleTargetImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <button
                onClick={uploadTargetImage}
                disabled={isUploading || !targetImage}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Target Image'}
              </button>
              {targetImageUrl && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Target image uploaded successfully
                </p>
              )}
            </div>

            {/* Generate Mosaic Button */}
            <button
              onClick={generateMosaic}
              disabled={isGenerating || !targetImageUrl || uploadedTiles.length === 0}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Mosaic...' : 'Generate Mosaic'}
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Preview</h2>
            
            {/* Target Image Preview */}
            {targetImageUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Target Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Image
                    src={targetImageUrl}
                    alt="Target image"
                    width={300}
                    height={300}
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Tile Images Preview */}
            {uploadedTiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Uploaded Tiles ({uploadedTiles.length})
                </h3>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {uploadedTiles.slice(0, 12).map((tile, index) => (
                    <Image
                      key={tile.id}
                      src={tile.url}
                      alt={`Tile ${index + 1}`}
                      width={50}
                      height={50}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ))}
                  {uploadedTiles.length > 12 && (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                      +{uploadedTiles.length - 12}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mosaic Display */}
        {mosaic && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Generated Mosaic</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="text-sm">Zoom: {Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={downloadMosaic}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download High-Res
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-auto max-h-96">
              <Image
                src={mosaic.mosaicUrl}
                alt="Generated mosaic"
                width={2000}
                height={2000}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.2s ease'
                }}
                className="max-w-none"
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Grid Size: {mosaic.gridSize}x{mosaic.gridSize}</p>
              <p>Tiles Used: {mosaic.tilesUsed}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
