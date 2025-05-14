
import { supabase } from './client';
import type { Database } from './types';

// Helper functions with proper type handling
export const fromProfiles = () => supabase.from('profiles');
export const fromEmpresas = () => supabase.from('empresas');
export const fromTransacoes = () => supabase.from('transacoes');
export const fromMetricas = () => supabase.from('metricas');
export const fromIntegracoesBancarias = () => supabase.from('integracoes_bancarias');
export const fromInsights = () => supabase.from('insights');
export const fromDocumentos = () => supabase.from('documentos');
export const fromWebhookConfigs = () => supabase.from('webhook_configs');
export const fromWebhookExecutions = () => supabase.from('webhook_executions');
