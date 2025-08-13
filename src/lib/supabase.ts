import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string;
          filename: string;
          original_name: string;
          file_size: number;
          uploaded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          original_name: string;
          file_size: number;
          uploaded_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          original_name?: string;
          file_size?: number;
          uploaded_at?: string;
          created_at?: string;
        };
      };
    };
  };
}