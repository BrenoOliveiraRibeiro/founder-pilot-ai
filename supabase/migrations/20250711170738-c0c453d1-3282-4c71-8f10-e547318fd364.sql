-- Enable real-time for transacoes table
ALTER TABLE public.transacoes REPLICA IDENTITY FULL;

-- Add transacoes table to supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.transacoes;