# Osho Screen Saver

A beautiful, full-screen screen saver application built with Remix, featuring elegant transitions and Cloudinary integration. Designed for large displays with high-quality image handling.

## Features

- **Full-screen display** optimized for large screens (1000m+ displays)
- **Multiple transition effects**: fade, slide, zoom, and collage layouts
- **Cloudinary integration** for high-quality image hosting
- **Responsive design** that scales beautifully
- **Control panel** with play/pause, speed control, and transition selection
- **Keyboard shortcuts** for easy navigation
- **Image preloading** for smooth transitions
- **Smart image fitting** with artistic collage layouts for non-fitting images

## Transition Effects

1. **Fade** - Smooth crossfade between images
2. **Slide** - Images slide in from left, right, up, or down
3. **Zoom** - Images zoom in or out during transitions
4. **Collage** - Creates artistic mosaic layouts for non-fitting images

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Image Configuration

The app comes pre-configured with 7 Osho images from Cloudinary, so it works out of the box! 

#### Easy Image Updates

To update the image list, simply edit `app/lib/images.json`:

```json
{
  "oshoImages": [
    "Your_Image_1_abc123",
    "Your_Image_2_def456", 
    "Your_Image_3_ghi789"
  ],
  "cloudName": "your-cloud-name",
  "transformations": {
    "width": 1920,
    "height": 1080,
    "crop": "fill",
    "format": "auto",
    "quality": "auto"
  }
}
```

Or use the helper script:

```bash
# Interactive mode
pnpm run update-images
# or
node update-images.js

# Command line mode
node update-images.js "Image1_abc123,Image2_def456,Image3_ghi789"
```

#### Using Your Own Cloudinary Account (Optional)

1. Create a free account at [https://cloudinary.com](https://cloudinary.com)
2. Upload your Osho images to Cloudinary
3. Update `app/lib/images.json` with your cloud name and image IDs
4. Copy `env.example` to `.env` and add your Cloudinary details:

```bash
cp env.example .env
```

Update the `.env` file with your Cloudinary credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000` (or the port shown in terminal)

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## Deployment

### Netlify

1. Build the project: `pnpm build`
2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## Usage

### Controls

- **Mouse movement** - Shows/hides control panel
- **Spacebar** - Play/pause
- **Arrow keys** - Previous/next image
- **Escape** - Hide control panel

### Control Panel

- **Play/Pause** - Start or stop the screen saver
- **Transition Effect** - Select from available transition types
- **Duration** - Adjust transition speed (1-10 seconds)
- **Navigation** - Previous/next image buttons

## Image Requirements

- Upload images to the `osho_images` folder in Firebase Storage
- Supported formats: JPG, PNG, WebP
- Recommended resolution: 4K or higher for large displays
- Images will be automatically scaled and fitted to the screen

## Technical Details

- **Framework**: Remix (React Router v7)
- **Styling**: Tailwind CSS
- **Storage**: Google Drive API (Free!)
- **Package Manager**: pnpm
- **TypeScript**: Full type safety
- **Responsive**: Optimized for any screen size

## File Structure

```
app/
├── components/
│   ├── ScreenSaver.tsx      # Main screen saver component
│   └── ControlPanel.tsx     # Control panel component
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   ├── imageService.ts      # Image loading and management
│   └── transitionService.ts # Transition effects
├── routes/
│   └── _index.tsx           # Main route
├── styles/
│   └── app.css              # Global styles and Tailwind
└── root.tsx                 # Root component
```

## Customization

### Adding New Transition Effects

1. Add the new transition type to `TransitionType` in `transitionService.ts`
2. Implement the transition logic in `TransitionService`
3. Add the option to the control panel

### Styling

The app uses Tailwind CSS with custom animations. Modify `tailwind.config.js` and `app/styles/app.css` for styling changes.

## Troubleshooting

### Images Not Loading

1. Check Firebase Storage configuration
2. Ensure images are in the `osho_images` folder
3. Verify Firebase Storage rules allow public read access

### Performance Issues

1. Optimize image sizes before uploading
2. Reduce transition duration
3. Use fewer images in rotation

## License

MIT License - feel free to use and modify as needed.
