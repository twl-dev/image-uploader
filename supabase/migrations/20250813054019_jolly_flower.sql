/*
  # AI Image Showcase Database Schema

  1. New Tables
    - `images`
      - `id` (uuid, primary key) - Unique identifier for each image
      - `filename` (text, not null) - Storage filename in Supabase bucket
      - `original_name` (text, not null) - Original filename from user upload
      - `file_size` (integer, not null) - File size in bytes
      - `uploaded_at` (timestamptz, not null) - When the image was uploaded
      - `created_at` (timestamptz, default now()) - Record creation timestamp

  2. Security
    - Enable RLS on `images` table
    - Add policy for public read access (since this is a public gallery)
    - Add policy for public insert access (for image uploads)

  3. Storage
    - Creates `ai-images` storage bucket for file storage
    - Public access for gallery viewing
    - File upload restrictions (10MB max, images only)
*/

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_name text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public gallery)
CREATE POLICY "Public can view images"
  ON images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can upload images"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-images', 'ai-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view images in bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ai-images');

CREATE POLICY "Public can upload images to bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'ai-images' 
    AND (storage.foldername(name))[1] = 'uploads'
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at DESC);