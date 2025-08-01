
-- Create user roles enum
CREATE TYPE public.user_role AS ENUM (
  'superuser',
  'administrator', 
  'secretary',
  'treasurer',
  'board_member',
  'member',
  'viewer'
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  member_id TEXT UNIQUE,
  role public.user_role NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  appointed_by UUID REFERENCES public.profiles(id),
  appointed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_role public.user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = _role 
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_roles public.user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = ANY(_roles) 
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
-- Superusers and administrators can view all profiles
CREATE POLICY "Superusers and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_any_role(ARRAY['superuser', 'administrator']::public.user_role[]));

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Board members can view other member profiles
CREATE POLICY "Board members can view member profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role('board_member'));

-- Only superusers can insert/update profiles (appointment system)
CREATE POLICY "Only superusers can manage profiles"
  ON public.profiles FOR ALL
  USING (public.has_role('superuser'))
  WITH CHECK (public.has_role('superuser'));

-- Update documents table to add access control
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'public';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.documents ADD CONSTRAINT check_access_level 
  CHECK (access_level IN ('public', 'members', 'board', 'financial', 'admin'));

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public delete access to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public insert access to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public read access to documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public update access to documents" ON public.documents;

-- Create proper RLS policies for documents
-- Public documents - anyone can view
CREATE POLICY "Anyone can view public documents"
  ON public.documents FOR SELECT
  USING (access_level = 'public');

-- Member documents - active members can view
CREATE POLICY "Members can view member documents"
  ON public.documents FOR SELECT
  USING (
    access_level = 'members' AND 
    public.has_any_role(ARRAY['superuser', 'administrator', 'secretary', 'treasurer', 'board_member', 'member']::public.user_role[])
  );

-- Board documents - board members and above
CREATE POLICY "Board can view board documents"
  ON public.documents FOR SELECT
  USING (
    access_level = 'board' AND 
    public.has_any_role(ARRAY['superuser', 'administrator', 'secretary', 'board_member']::public.user_role[])
  );

-- Financial documents - treasurer and above
CREATE POLICY "Financial access for financial documents"
  ON public.documents FOR SELECT
  USING (
    access_level = 'financial' AND 
    public.has_any_role(ARRAY['superuser', 'administrator', 'treasurer']::public.user_role[])
  );

-- Admin documents - admin and superuser only
CREATE POLICY "Admin access for admin documents"
  ON public.documents FOR SELECT
  USING (
    access_level = 'admin' AND 
    public.has_any_role(ARRAY['superuser', 'administrator']::public.user_role[])
  );

-- Document upload permissions
CREATE POLICY "Authorized users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    public.has_any_role(ARRAY['superuser', 'administrator', 'secretary', 'treasurer', 'board_member']::public.user_role[])
  );

-- Document update permissions
CREATE POLICY "Document creators and admins can update"
  ON public.documents FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    public.has_any_role(ARRAY['superuser', 'administrator']::public.user_role[])
  );

-- Document delete permissions  
CREATE POLICY "Only admins can delete documents"
  ON public.documents FOR DELETE
  USING (public.has_any_role(ARRAY['superuser', 'administrator']::public.user_role[]));

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create audit log table for role changes
CREATE TABLE public.role_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  old_role public.user_role,
  new_role public.user_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.role_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role changes"
  ON public.role_changes FOR SELECT
  USING (public.has_any_role(ARRAY['superuser', 'administrator']::public.user_role[]));
