/*
  # Daily Image Cleanup Function
  
  This edge function runs daily at 23:59 to clean up uploaded images.
  It deletes both the files from storage and the database records.
  
  To set up the cron job, run this SQL in your Supabase dashboard:
  
  ```sql
  SELECT cron.schedule(
    'daily-image-cleanup',
    '59 23 * * *',
    'SELECT net.http_post(url:=''https://your-project-ref.supabase.co/functions/v1/daily-cleanup'', headers:=''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb);'
  );
  ```
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting daily cleanup process...');

    // Get all images from the database
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('id, filename');

    if (fetchError) {
      throw new Error(`Failed to fetch images: ${fetchError.message}`);
    }

    console.log(`Found ${images?.length || 0} images to clean up`);

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No images to clean up',
          deleted_count: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete files from storage
    const filenames = images.map(img => img.filename);
    const { error: storageError } = await supabase.storage
      .from('ai-images')
      .remove(filenames);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database cleanup even if some storage deletions fail
    }

    // Delete records from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .in('id', images.map(img => img.id));

    if (dbError) {
      throw new Error(`Failed to delete database records: ${dbError.message}`);
    }

    console.log(`Successfully cleaned up ${images.length} images`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully cleaned up ${images.length} images`,
        deleted_count: images.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error during cleanup' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});