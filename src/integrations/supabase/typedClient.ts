
import { supabase } from './client';

// Helper functions with proper type casting
export const fromProfiles = () => supabase.from('profiles') as unknown as ReturnType<typeof supabase.from<'profiles'>>;
export const fromEmpresas = () => supabase.from('empresas') as unknown as ReturnType<typeof supabase.from<'empresas'>>;
export const fromTransacoes = () => supabase.from('transacoes') as unknown as ReturnType<typeof supabase.from<'transacoes'>>;
export const fromMetricas = () => supabase.from('metricas') as unknown as ReturnType<typeof supabase.from<'metricas'>>;
export const fromIntegracoesBancarias = () => supabase.from('integracoes_bancarias') as unknown as ReturnType<typeof supabase.from<'integracoes_bancarias'>>;
export const fromInsights = () => supabase.from('insights') as unknown as ReturnType<typeof supabase.from<'insights'>>;
export const fromDocumentos = () => supabase.from('documentos') as unknown as ReturnType<typeof supabase.from<'documentos'>>;
