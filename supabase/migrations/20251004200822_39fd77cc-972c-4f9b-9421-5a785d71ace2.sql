-- Create subscriptions table for character motivation
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  character_name TEXT NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their subscription (public form)
CREATE POLICY "Anyone can create subscription"
ON public.subscriptions
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anyone to view subscriptions (for admin purposes later)
CREATE POLICY "Anyone can view subscriptions"
ON public.subscriptions
FOR SELECT
TO anon
USING (true);