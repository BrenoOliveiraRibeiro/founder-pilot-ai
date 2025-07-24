-- Fix critical security issues

-- 1. Enable RLS on documentos table and add policies
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their empresas" 
ON public.documentos 
FOR SELECT 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can create documents for their empresas" 
ON public.documentos 
FOR INSERT 
WITH CHECK (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can update documents for their empresas" 
ON public.documentos 
FOR UPDATE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can delete documents for their empresas" 
ON public.documentos 
FOR DELETE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

-- 2. Enable RLS on profiles table and add policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Add missing INSERT/UPDATE/DELETE policies for transacoes
CREATE POLICY "Users can create transactions for their empresas" 
ON public.transacoes 
FOR INSERT 
WITH CHECK (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can update transactions for their empresas" 
ON public.transacoes 
FOR UPDATE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can delete transactions for their empresas" 
ON public.transacoes 
FOR DELETE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

-- 4. Add missing INSERT/UPDATE/DELETE policies for metricas
CREATE POLICY "Users can create metrics for their empresas" 
ON public.metricas 
FOR INSERT 
WITH CHECK (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can update metrics for their empresas" 
ON public.metricas 
FOR UPDATE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can delete metrics for their empresas" 
ON public.metricas 
FOR DELETE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

-- 5. Add missing INSERT/UPDATE/DELETE policies for insights
CREATE POLICY "Users can create insights for their empresas" 
ON public.insights 
FOR INSERT 
WITH CHECK (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can update insights for their empresas" 
ON public.insights 
FOR UPDATE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can delete insights for their empresas" 
ON public.insights 
FOR DELETE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

-- 6. Add missing UPDATE policies for integracoes_bancarias
CREATE POLICY "Users can update their own bank integrations" 
ON public.integracoes_bancarias 
FOR UPDATE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own bank integrations" 
ON public.integracoes_bancarias 
FOR DELETE 
USING (empresa_id IN (
  SELECT empresas.id 
  FROM empresas 
  WHERE empresas.user_id = auth.uid()
));

-- 7. Fix database function search paths for security
CREATE OR REPLACE FUNCTION public.generate_transaction_hash(p_descricao text, p_valor numeric, p_data_transacao date, p_empresa_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN md5(CONCAT(p_descricao, '|', p_valor::text, '|', p_data_transacao::text, '|', p_empresa_id::text));
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_transaction_hash()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.transaction_hash = generate_transaction_hash(
    NEW.descricao, 
    NEW.valor, 
    NEW.data_transacao, 
    NEW.empresa_id
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_demo_data(p_empresa_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- Insert demo metrics
  INSERT INTO public.metricas (empresa_id, data_referencia, caixa_atual, receita_mensal, burn_rate, runway_meses, cash_flow, mrr_growth)
  VALUES 
    (p_empresa_id, CURRENT_DATE - INTERVAL '2 month', 150000, 25000, 30000, 5, -5000, 0.05),
    (p_empresa_id, CURRENT_DATE - INTERVAL '1 month', 145000, 27500, 32000, 4.5, -4500, 0.1),
    (p_empresa_id, CURRENT_DATE, 140000, 30000, 31000, 4.5, -1000, 0.09);

  -- Insert demo transactions
  INSERT INTO public.transacoes (empresa_id, descricao, valor, data_transacao, categoria, tipo, metodo_pagamento)
  VALUES 
    (p_empresa_id, 'Pagamento de Cliente A', 10000, CURRENT_DATE - INTERVAL '15 days', 'Receita', 'receita', 'Transferência'),
    (p_empresa_id, 'Pagamento de Cliente B', 12000, CURRENT_DATE - INTERVAL '10 days', 'Receita', 'receita', 'Transferência'),
    (p_empresa_id, 'Pagamento de Cliente C', 8000, CURRENT_DATE - INTERVAL '5 days', 'Receita', 'receita', 'Transferência'),
    (p_empresa_id, 'Folha de Pagamento', -20000, CURRENT_DATE - INTERVAL '12 days', 'Recursos Humanos', 'despesa', 'Transferência'),
    (p_empresa_id, 'AWS Cloud Services', -3500, CURRENT_DATE - INTERVAL '8 days', 'Infraestrutura', 'despesa', 'Cartão'),
    (p_empresa_id, 'Google Workspace', -1200, CURRENT_DATE - INTERVAL '6 days', 'Software', 'despesa', 'Cartão'),
    (p_empresa_id, 'Marketing Digital', -5000, CURRENT_DATE - INTERVAL '4 days', 'Marketing', 'despesa', 'Cartão');

  -- Insert demo insights
  INSERT INTO public.insights (empresa_id, tipo, titulo, descricao, prioridade, status)
  VALUES 
    (p_empresa_id, 'Alerta', 'Runway Crítico', 'Seu runway é de apenas 4.5 meses. Reduza despesas ou aumente a receita urgentemente.', 'alta', 'pendente'),
    (p_empresa_id, 'Recomendação', 'Crescimento de Receita', 'Sua receita aumentou 9% no último mês. Considere investir mais em aquisição de clientes.', 'media', 'pendente'),
    (p_empresa_id, 'Alerta', 'Custos de Marketing', 'Seus custos de marketing aumentaram 15% sem correspondente aumento na receita.', 'media', 'pendente');
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;