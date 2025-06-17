
-- Habilitar REPLICA IDENTITY FULL para capturar dados completos durante updates
ALTER TABLE public.transacoes REPLICA IDENTITY FULL;
ALTER TABLE public.metricas REPLICA IDENTITY FULL;
ALTER TABLE public.integracoes_bancarias REPLICA IDENTITY FULL;
ALTER TABLE public.insights REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação do supabase_realtime para ativar funcionalidade em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.transacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.metricas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.integracoes_bancarias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
