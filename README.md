# Photo Mosaic Generator

A full-stack Next.js 14 application that creates beautiful photo mosaics by arranging small uploaded images as tiles to form a larger target image.

## Features

- **Multiple Image Upload**: Upload multiple small images to use as mosaic tiles
- **Target Image Processing**: Upload a main image that will be recreated using the tile images
- **Automatic Image Processing**: Images are resized, compressed, and optimized using Sharp
- **Free Cloud Storage**: All images are stored on Imgur using their free API
- **Interactive Mosaic Viewer**: View generated mosaics with zoom in/out functionality
- **High-Resolution Downloads**: Download the generated mosaic in full resolution
- **Mobile-Friendly**: Responsive design that works on all devices
- **Real-time Progress**: Loading indicators during upload and mosaic generation

## How It Works

1. **Upload Tile Images**: Select multiple small images that will be used as tiles
2. **Upload Target Image**: Select one main image that will be recreated as a mosaic
3. **Process Images**: Images are automatically resized to 50x50px tiles and uploaded to Imgur
4. **Generate Mosaic**: The system analyzes colors and creates a mosaic by matching tiles to target image regions
5. **View & Download**: Zoom in/out to explore the mosaic and download high-resolution version

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- Imgur API Client ID (free at [Imgur API](https://api.imgur.com/oauth2/addclient))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd zg
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```
   IMGUR_CLIENT_ID=your_imgur_client_id_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting an Imgur API Key

1. Go to [Imgur API Registration](https://api.imgur.com/oauth2/addclient)
2. Select "OAuth 2 authorization without a callback URL"
3. Fill in the application name and description
4. Copy the Client ID and add it to your `.env.local` file

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `IMGUR_CLIENT_ID` environment variable in Vercel dashboard
4. Deploy!

The application is optimized for Vercel deployment with:
- Automatic builds via Next.js
- API routes for backend functionality
- Static optimization where possible

## Technical Architecture

- **Frontend**: Next.js 14 with App Router, React, TypeScript, TailwindCSS
- **Backend**: Next.js API routes
- **Image Processing**: Sharp for resize/compression
- **Storage**: Imgur API for free cloud image hosting
- **Deployment**: Vercel-ready configuration

## API Endpoints

### POST /api/upload
Uploads and processes images to Imgur
- **Body**: FormData with image files and optional tile size
- **Returns**: Array of uploaded image URLs and IDs

### POST /api/mosaic  
Generates photo mosaic from target and tile images
- **Body**: JSON with target image URL, tile URLs, and grid settings
- **Returns**: Generated mosaic URL and metadata

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

MIT License

---

## Getting Started (Development)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
