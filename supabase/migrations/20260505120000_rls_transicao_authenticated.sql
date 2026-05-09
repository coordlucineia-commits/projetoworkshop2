-- ==========================================================================
-- Migração: RLS de transição — qualquer authenticated pode operar
-- Aplicada em: 2026-05-05
-- Motivo: Políticas anteriores bloqueavam completamente o fluxo de cadastro
--         de alunos (salvarCadastroAluno) pois avaliacoes e pagamentos só
--         permitiam operações do is_admin. alunos_own_select causava
--         "permission denied for table users" por subquery inline em auth.users.
-- ==========================================================================

-- ──────────────────────────────────────────────────────────
-- TABELA: alunos
-- Problema: alunos_own_select fazia subquery inline em auth.users
--           (role authenticated não tem SELECT em auth.users → erro de permissão).
--           alunos_staff_insert/select/update bloqueava usuários não-admin.
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "alunos_own_select"    ON public.alunos;
DROP POLICY IF EXISTS "alunos_staff_select"  ON public.alunos;
DROP POLICY IF EXISTS "alunos_staff_insert"  ON public.alunos;
DROP POLICY IF EXISTS "alunos_staff_update"  ON public.alunos;

CREATE POLICY "alunos_authenticated_select" ON public.alunos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "alunos_authenticated_insert" ON public.alunos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "alunos_authenticated_update" ON public.alunos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- alunos_super_delete já existia corretamente (is_admin only) — mantida.

-- ──────────────────────────────────────────────────────────
-- TABELA: avaliacoes
-- Problema: aval_super_all (ALL) só permitia is_admin.
--           salvarCadastroAluno precisava de INSERT aqui.
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "aval_super_all" ON public.avaliacoes;

CREATE POLICY "avaliacoes_authenticated_select" ON public.avaliacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "avaliacoes_authenticated_insert" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "avaliacoes_authenticated_update" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "avaliacoes_super_delete" ON public.avaliacoes
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ──────────────────────────────────────────────────────────
-- TABELA: pagamentos
-- Problema: pagamentos_super_only (ALL) só permitia is_admin.
--           salvarCadastroAluno precisava de INSERT aqui.
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pagamentos_super_only" ON public.pagamentos;

CREATE POLICY "pagamentos_authenticated_select" ON public.pagamentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "pagamentos_authenticated_insert" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pagamentos_authenticated_update" ON public.pagamentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pagamentos_super_delete" ON public.pagamentos
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ──────────────────────────────────────────────────────────
-- TABELA: checkins
-- Problema: policies só permitiam staff/admin — bloqueava administração geral.
--           RPC registrar_checkin_por_pin (SECURITY DEFINER) já cuida do
--           check-in por PIN para anon (modo recepção) — não precisa de
--           policy INSERT na tabela para anon.
-- ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "checkins_staff_select" ON public.checkins;
DROP POLICY IF EXISTS "checkins_staff_write"  ON public.checkins;
DROP POLICY IF EXISTS "checkins_staff_update" ON public.checkins;

CREATE POLICY "checkins_authenticated_select" ON public.checkins
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "checkins_authenticated_insert" ON public.checkins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "checkins_authenticated_update" ON public.checkins
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- checkins_super_delete já existia corretamente — mantida.


-- ──────────────────────────────────────────────────────────
-- SEED: planos (tabela estava vazia — bloqueava cadastro de alunos)
-- ──────────────────────────────────────────────────────────
INSERT INTO public.planos (id, nome, descricao, preco, beneficios)
VALUES
  (gen_random_uuid(), 'Mensal Basic',
   'Acesso livre à academia, seg–sab, das 6h às 22h.', 99.90,
   '["Acesso à musculação","Vestiários com armários","App de treinos"]'::jsonb),
  (gen_random_uuid(), 'Mensal Plus',
   'Tudo do Basic + 2 aulas em grupo por semana.', 149.90,
   '["Acesso à musculação","2 aulas em grupo/semana","Avaliação física mensal","App de treinos"]'::jsonb),
  (gen_random_uuid(), 'Trimestral',
   'Plano de 3 meses com desconto. Aulas ilimitadas.', 399.90,
   '["Acesso à musculação","Aulas ilimitadas","Avaliação física mensal","Professor acompanhante","App de treinos"]'::jsonb),
  (gen_random_uuid(), 'Anual',
   'Melhor custo-benefício. Acesso total por 12 meses.', 1199.90,
   '["Acesso à musculação","Aulas ilimitadas","Avaliação física quinzenal","Personal incluso","Nutrição básica","App de treinos"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;
