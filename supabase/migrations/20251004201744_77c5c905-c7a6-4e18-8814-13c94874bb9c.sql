-- Add conversation column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN conversation TEXT;

-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call edge function when new subscription is created
CREATE OR REPLACE FUNCTION public.process_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function asynchronously
  PERFORM net.http_post(
    url := 'https://tbnxlhamuwqurreytwzp.supabase.co/functions/v1/generate-conversation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRibnhsaGFtdXdxdXJyZXl0d3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDU0ODYsImV4cCI6MjA3NTA4MTQ4Nn0.LVRjKYz4JLyYrD10HnMGeEYpfWa6Lmj2oSiLrmwDSFg'
    ),
    body := jsonb_build_object(
      'subscription_id', NEW.id,
      'email', NEW.email,
      'character_name', NEW.character_name,
      'goal', NEW.goal
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to fire on INSERT
CREATE TRIGGER on_subscription_created
  AFTER INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.process_new_subscription();