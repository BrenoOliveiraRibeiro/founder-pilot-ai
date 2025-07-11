-- Enable full replica identity for transacoes table (for real-time updates)
ALTER TABLE public.transacoes REPLICA IDENTITY FULL;