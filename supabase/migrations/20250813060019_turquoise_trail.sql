/*
  # AI Image Showcase Database Schema

  1. New Tables
    - `images`
      - `id` (uuid, primary key)
      - `filename` (text, unique filename in storage)
      - `original_name` (text, original uploaded filename)
      - `file_size` (integer, file size in bytes)
      - `uploaded_at` (timestamptz, when the image was uploaded)
      - `created_at` (timestamptz, record creation timestamp)

  2. Storage
    - Create `ai-images` storage bucket for public image storage
    - Configure bucket for public read access

  3. Security
    - Enable RLS on `images` table
    - Add policy for public users to insert images
    - Add policy for public users to read images
    - Configure storage bucket policies for public access

  4. Indexes
    - Add index on `uploaded_at` for efficient cleanup queries
*/

-- Create the images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text UNIQUE NOT NULL,
  original_name text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images (uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public can upload images"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view images"
  ON images
  FOR SELECT
  TO public
  USING (true);

-- Create storage bucket for images (run this in Supabase Dashboard if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-images', 'ai-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access
CREATE POLICY "Public can upload images to ai-images bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'ai-images');

CREATE POLICY "Public can view images in ai-images bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ai-images');

CREATE POLICY "Public can delete images in ai-images bucket"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'ai-images');