import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import axios from 'axios';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

interface ImageData {
  url: string;
  avgColor: { r: number; g: number; b: number };
}

interface MosaicRequest {
  targetImageUrl: string;
  tileImageUrls: string[];
  gridSize: number;
  outputWidth: number;
  outputHeight: number;
}

// Calculate average color of an image
async function getAverageColor(imageBuffer: Buffer): Promise<{ r: number; g: number; b: number }> {
  const { data } = await sharp(imageBuffer)
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  return {
    r: data[0],
    g: data[1],
    b: data[2]
  };
}

// Calculate color distance between two colors
function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Find the best matching tile image for a given color
function findBestMatch(targetColor: { r: number; g: number; b: number }, tileImages: ImageData[]): string {
  let bestMatch = tileImages[0];
  let minDistance = colorDistance(targetColor, bestMatch.avgColor);

  for (const image of tileImages) {
    const distance = colorDistance(targetColor, image.avgColor);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = image;
    }
  }

  return bestMatch.url;
}

export async function POST(request: NextRequest) {
  try {
    if (!IMGUR_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Imgur client ID not configured' },
        { status: 500 }
      );
    }

    const { targetImageUrl, tileImageUrls, gridSize = 50, outputWidth = 2000, outputHeight = 2000 }: MosaicRequest = await request.json();

    if (!targetImageUrl || !tileImageUrls || tileImageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Download and analyze tile images
    console.log('Downloading and analyzing tile images...');
    const tileImages: ImageData[] = [];
    
    for (const url of tileImageUrls) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const avgColor = await getAverageColor(buffer);
        tileImages.push({ url, avgColor });
      } catch (error) {
        console.error(`Error downloading tile image ${url}:`, error);
      }
    }

    if (tileImages.length === 0) {
      return NextResponse.json(
        { error: 'No valid tile images found' },
        { status: 400 }
      );
    }

    // Download target image
    console.log('Downloading target image...');
    const targetResponse = await axios.get(targetImageUrl, { responseType: 'arraybuffer' });
    const targetBuffer = Buffer.from(targetResponse.data);

    // Resize target image to work with
    const resizedTarget = await sharp(targetBuffer)
      .resize(gridSize, gridSize)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate tile size for output
    const tileSize = Math.floor(outputWidth / gridSize);
    
    console.log('Generating mosaic...');
    
    // Create mosaic tiles
    const mosaicTiles: sharp.OverlayOptions[] = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Get pixel color from target image
        const pixelIndex = (y * gridSize + x) * 3;
        const targetColor = {
          r: resizedTarget.data[pixelIndex],
          g: resizedTarget.data[pixelIndex + 1],
          b: resizedTarget.data[pixelIndex + 2]
        };

        // Find best matching tile
        const bestTileUrl = findBestMatch(targetColor, tileImages);
        
        // Download and resize tile
        const tileResponse = await axios.get(bestTileUrl, { responseType: 'arraybuffer' });
        const tileBuffer = await sharp(Buffer.from(tileResponse.data))
          .resize(tileSize, tileSize)
          .toBuffer();

        mosaicTiles.push({
          input: tileBuffer,
          left: x * tileSize,
          top: y * tileSize
        });
      }
    }

    // Create the mosaic
    const mosaicBuffer = await sharp({
      create: {
        width: outputWidth,
        height: outputHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite(mosaicTiles)
    .jpeg({ quality: 90 })
    .toBuffer();

    // Upload mosaic to Imgur
    console.log('Uploading mosaic to Imgur...');
    const base64Mosaic = mosaicBuffer.toString('base64');
    
    const imgurResponse = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: base64Mosaic,
        type: 'base64',
        title: `Photo Mosaic ${Date.now()}`
      },
      {
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (imgurResponse.data.success) {
      return NextResponse.json({
        success: true,
        mosaicUrl: imgurResponse.data.data.link,
        mosaicId: imgurResponse.data.data.id,
        tilesUsed: tileImages.length,
        gridSize: gridSize
      });
    } else {
      throw new Error('Failed to upload mosaic to Imgur');
    }

  } catch (error) {
    console.error('Mosaic generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mosaic' },
      { status: 500 }
    );
  }
}