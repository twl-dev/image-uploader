# AI Image Showcase

A beautiful web application for students to upload and share their AI-generated artwork. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📤 **Easy Upload**: Drag & drop or click to upload AI-generated images
- 🖼️ **Public Gallery**: Beautiful responsive gallery to view all submissions
- 👨‍💼 **Admin Dashboard**: Manage and moderate uploaded content
- 🕐 **Auto Cleanup**: Images automatically removed daily at 11:59 PM
- 📱 **Mobile Friendly**: Optimized for both desktop and mobile devices
- 🚀 **Real-time Updates**: Gallery updates instantly when new images are uploaded

## Setup Instructions

### 1. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be fully initialized

2. **Connect to Supabase**:
   - Click the "Connect to Supabase" button in the top right of Bolt
   - This will automatically configure your environment variables

3. **Run Database Migration**:
   - Copy the SQL from `supabase/migrations/create_images_table.sql`
   - Go to your Supabase Dashboard → SQL Editor
   - Paste and run the SQL to create the necessary tables and storage bucket

4. **Set up Daily Cleanup (Optional)**:
   - Deploy the edge function: Copy `supabase/functions/daily-cleanup/index.ts` to your Supabase project
   - Set up a cron job in your Supabase Dashboard → SQL Editor:
   
   ```sql
   SELECT cron.schedule(
     'daily-image-cleanup',
     '59 23 * * *',
     'SELECT net.http_post(url:=''https://YOUR-PROJECT-REF.supabase.co/functions/v1/daily-cleanup'', headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb);'
   );
   ```

### 2. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Admin Access

- Click the settings icon in the header
- Enter password: `admin123` (change this in production!)
- Access admin features like image deletion and management

### 4. Deployment to Netlify

The app is ready to deploy to Netlify as a static site:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## File Structure

```
src/
├── components/
│   ├── ImageUpload.tsx      # Upload interface component
│   └── ImageGallery.tsx     # Gallery and admin components
├── lib/
│   └── supabase.ts          # Supabase client configuration
└── App.tsx                  # Main application component

supabase/
├── migrations/
│   └── create_images_table.sql    # Database schema
└── functions/
    └── daily-cleanup/
        └── index.ts               # Daily cleanup edge function
```

## Security Notes

- Images are publicly accessible (perfect for gallery display)
- Change the admin password in `App.tsx` before production
- The daily cleanup ensures storage doesn't grow indefinitely
- All uploads are logged with metadata for moderation

## Customization

- **Upload Limits**: Modify file size limits in the upload component
- **Image Formats**: Update accepted formats in the file input
- **Cleanup Schedule**: Adjust the cron schedule for different cleanup times
- **Styling**: Customize the Tailwind classes for your branding

## Support

This project uses modern web standards and should work in all recent browsers. For issues, check the browser console for detailed error messages.