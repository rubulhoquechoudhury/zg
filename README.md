# Image Gallery Composer

A Next.js application that allows users to upload images to Imgur and view them in a beautiful gallery composition.

## Features

- **Image Upload**: Drag & drop or click to upload images
- **Imgur Integration**: Images are automatically uploaded to Imgur.com via API
- **Gallery View**: All uploaded images displayed in a responsive grid
- **Composite View**: Images arranged in a masonry-style layout
- **Real-time Updates**: Gallery updates immediately after upload
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- An Imgur API Client ID

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd zg
```

2. Install dependencies:
```bash
npm install
```

3. Configure Imgur API:
   - Go to [Imgur API](https://api.imgur.com/oauth2/addclient) to register your application
   - Get your Client ID
   - Copy `.env.example` to `.env.local`
   - Add your Imgur Client ID:
   ```
   IMGUR_CLIENT_ID=your_imgur_client_id_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. **Upload Images**: 
   - Drag and drop image files onto the upload area
   - Or click to browse and select files
   - Supported formats: JPG, PNG, GIF (max 10MB)

2. **View Gallery**: 
   - Uploaded images appear in the gallery section
   - Click "View Full" to open the original image on Imgur
   - Images are displayed in both grid and composite layouts

## API Endpoints

- `POST /api/upload` - Upload image to Imgur
- `GET /api/upload` - Get list of uploaded images

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Imgur API** - Image hosting
- **Axios** - HTTP client

## Project Structure

```
src/
├── app/
│   ├── api/upload/          # API routes for image handling
│   ├── components/          # React components
│   │   ├── ImageUpload.tsx  # Upload interface
│   │   ├── ImageGallery.tsx # Gallery display
│   │   └── Toast.tsx        # Notification system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
