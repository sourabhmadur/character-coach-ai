-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.process_new_subscription()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  -- Call the edge function asynchronously using net.http_post
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