import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import axios from 'axios';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

interface ImgurResponse {
  data: {
    link: string;
    id: string;
  };
  success: boolean;
}

export async function POST(request: NextRequest) {
  try {
    if (!IMGUR_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Imgur client ID not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const tileSize = parseInt(formData.get('tileSize') as string) || 50;

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    const uploadedImages: { url: string; id: string }[] = [];

    for (const file of files) {
      // Read file buffer
      const buffer = await file.arrayBuffer();
      
      // Resize and compress image
      const resizedBuffer = await sharp(Buffer.from(buffer))
        .resize(tileSize, tileSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Convert to base64 for Imgur API
      const base64Image = resizedBuffer.toString('base64');

      // Upload to Imgur
      const imgurResponse = await axios.post<ImgurResponse>(
        'https://api.imgur.com/3/image',
        {
          image: base64Image,
          type: 'base64',
          title: `Mosaic tile ${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (imgurResponse.data.success) {
        uploadedImages.push({
          url: imgurResponse.data.data.link,
          id: imgurResponse.data.data.id
        });
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}