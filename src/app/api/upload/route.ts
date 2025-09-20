import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In-memory storage for uploaded images (in production, use a database)
const uploadedImages: Array<{
  id: string;
  url: string;
  deleteHash: string;
  uploadedAt: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.IMGUR_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'Imgur API client ID not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Upload to Imgur
    const imgurResponse = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: base64,
        type: 'base64',
      },
      {
        headers: {
          Authorization: `Client-ID ${clientId}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageData = imgurResponse.data.data;
    
    // Store image info in memory (in production, use a database)
    const uploadedImage = {
      id: imageData.id,
      url: imageData.link,
      deleteHash: imageData.deletehash,
      uploadedAt: new Date().toISOString(),
    };
    
    uploadedImages.push(uploadedImage);

    return NextResponse.json({
      success: true,
      image: {
        id: imageData.id,
        url: imageData.link,
        uploadedAt: uploadedImage.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Error uploading to Imgur:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      images: uploadedImages.map(img => ({
        id: img.id,
        url: img.url,
        uploadedAt: img.uploadedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}