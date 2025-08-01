
-- Create the documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no user authentication is implemented yet)
CREATE POLICY "Allow public read access to documents" 
  ON public.documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to documents" 
  ON public.documents 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete access to documents" 
  ON public.documents 
  FOR DELETE 
  USING (true);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Create storage policy for public access
CREATE POLICY "Allow public access to documents bucket" 
  ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'documents');
