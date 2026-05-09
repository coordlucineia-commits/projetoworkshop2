-- Seed: exercícios (30) + 100 receitas. Idempotente (só se tabelas vazias).

insert into public.exercicios (grupo_muscular, nome, equipamento, imagem_url, descricao_execucao, dicas_seguranca)
select * from (values
  ('braço','Rosca direta barra','Barra olímpica','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=640','Flexione os cotovelos mantendo ombros fixos.','Sem impulso.'),
  ('braço','Tríceps corda na polia','Polia alta','https://images.unsplash.com/photo-1583454110551-21f2fa2afe43?w=640','Estenda cotovelos abrindo corda no final.','Ombro descomprimido.'),
  ('braço','Rosca martelo','Halteres','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=640','Pegada neutra; amplitude completa.','Tronco imóvel.'),
  ('braço','Extensão francesa halter','Banco inclinado','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640','Só antebraço se move verticalmente.','Use carga controlada.'),
  ('braço','Rosca Scott máquina ou barra W','Banco padre','https://images.unsplash.com/photo-1517963879466-cd6b4c3d3b2c?w=640','Tronco contra o banco.','Não arquear pulsos.'),
  ('costas','Remada curvada com barra','Barra','https://images.unsplash.com/photo-1603287687966-fe34be98d8f2?w=640','Puxe barriga do peito mantendo lombar neutra.','Barriga cheia controlada.'),
  ('costas','Puxada frontal aberta','Polia alta','https://images.unsplash.com/photo-1598266663430-7d84b7d3d999?w=640','Cotovelos fecha em direção aos flancos.','Peito orgulhoso.'),
  ('costas','Remada máquina pegada neutra','Chest supported','https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=640','Puxe alças ao abdômen inferior.','Escape costal.'),
  ('costas','Pull-over com halter','Banco','https://images.unsplash.com/photo-1583454110551-21f2fa2afe43?w=640','Ombros fazem flexão com controle.','Não hiperextenda cotovelos.'),
  ('costas','Remada unilateral com halter','Banco','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=640','Puxe halter ao quadril.','Quadril paralelo ao chão.'),
  ('peito','Supino reto com barra','Banco','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640','Barra desce linha mamilos.','Pé plantado; escápulas fixas.'),
  ('peito','Supino inclinado halteres','Banco inclinado','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640','Punhos alinhados aos cotovelos ~45°.','Toque leve no topo.'),
  ('peito','Crossover polia alta','Polia dupla','https://images.unsplash.com/photo-1583454110551-21f2fa2afe43?w=640','Convergência até linha do umbigo.','Suave na transição.'),
  ('peito','Flexão com apoio joelhos','Peso corporal','https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=640','Linha reta ombro-joelho.','Mãos sob ombros.'),
  ('peito','Supino pegada fechada smith','Smith','https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=640','Foco tríceps/peito interno.','Assistência nas travas.'),
  ('ombro','Desenvolvimento militar sentado','Halteres','https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=640','Linha visual ao nariz.','Joelhos 90°.'),
  ('ombro','Elevação lateral máquina ou livre','Halteres','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640','Stop na altura externa do ombro.','Ombros baixos.'),
  ('ombro','Desenvolvimento Arnold','Halteres','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640','Rotação supinada → pronada subindo.','Não arquear.'),
  ('ombro','Elevação frontal com corda','Polia baixa','https://images.unsplash.com/photo-1603287687966-fe34be98d8f2?w=640','Alongar braços à frente até ombros.','Tronco firme.'),
  ('ombro','Encolhimento com halter','Halteres pesados','https://images.unsplash.com/photo-1517963879466-cd6b4c3d3b2c?w=640','Eleve ombros ao máximo; desça lento.','Não rotacionar punho.'),
  ('abdomen','Prancha tradicional','Tapete','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640','Ponto entre cotovelos e pés linear.','Glúteos ativos.'),
  ('abdomen','Abdominal crunch bola','Bola suíça','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640','Flexão torácica curta.','Não puxar nuca.'),
  ('abdomen','Hanging leg raise','Barra fixa','https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=640','Eleve quadris em flexão posterior.','Respire no controle.'),
  ('abdomen','Prancha lateral','Colchonete','https://images.unsplash.com/photo-1598266663430-7d84b7d3d999?w=640','Corpo em linha lateral.','Empilhe ombros/quadris.'),
  ('abdomen','Abdominal infra banco','Declínio','https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640','Flexão de quadril no banco.','Segure apoio dos joelhos.'),
  ('pernas','Agachamento terra sumô','Halter pesado','https://images.unsplash.com/photo-1434608519344-49d77a38e9d1?w=640','Abdução moderada de joelhos.','Coluna ereta.'),
  ('pernas','Leg press horizontal','Máquina','https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=640','Amplitude profunda sem levantar glúteo.','Pés na largura do quadril.'),
  ('pernas','Afundo com halteres','Halteres','https://images.unsplash.com/photo-1598266663430-7d84b7d3d999?w=640','Passo controlado; joelho traseiro desce.','Quadril neutro.'),
  ('pernas','Stiff com halteres','Halteres','https://images.unsplash.com/photo-1583454110551-21f2fa2afe43?w=640','Alongue isquios descendo halteres.','Joelhos microflexionados.'),
  ('pernas','Panturrilha em pé máquina','Smith','https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=640','Amplitude máxima plantar/dorsal.','Segurança nas mãos.')
) v(grupo_muscular, nome, equipamento, imagem_url, descricao_execucao, dicas_seguranca)
where not exists (select 1 from public.exercicios limit 1);

insert into public.receitas (
  categoria, refeicao, nome, imagem_url, ingredientes, modo_preparo,
  calorias, proteinas_g, carboidratos_g, gorduras_g
)
select
  case when n <= 50 then 'perda_peso' else 'ganho_massa' end,
  (ARRAY['cafe_manha','lanche_manha','almoco','lanche_tarde','jantar']::text[])[1 + ((n - 1) % 5)],
  case ((n - 1) % 10)
    when 0 then 'Ovos revolvidos com espinafre — lote ' || n::text
    when 1 then 'Iogurte grego com frutas vermelhas — lote ' || n::text
    when 2 then 'Pão integral com avocado e limão — lote ' || n::text
    when 3 then 'Smoothie bowl banana e aveia — lote ' || n::text
    when 4 then 'Crepioca com queijo cottage — lote ' || n::text
    when 5 then 'Frango grelhado com brócolis — lote ' || n::text
    when 6 then 'Salmão assado com batata doce — lote ' || n::text
    when 7 then 'Carne magra com arroz integral — lote ' || n::text
    when 8 then 'Atum com grão-de-bico e azeite — lote ' || n::text
    else 'Shake whey com banana e aveia — lote ' || n::text
  end,
  case ((n - 1) % 10)
    when 0 then 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=640'
    when 1 then 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=640'
    when 2 then 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=640'
    when 3 then 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=640'
    when 4 then 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640'
    when 5 then 'https://images.unsplash.com/photo-1604908176997-12112c88465e?w=640'
    when 6 then 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=640'
    when 7 then 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=640'
    when 8 then 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=640'
    else 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=640'
  end,
  'Ingredientes (lote ' || n::text || '): consulte cardápio NutriLuTe; ajuste por porções de 100–150g proteína magra, 1 porção carboidrato complexo, 1–2 colheres gordura boa, vegetais à vontade.',
  'Modo de preparo: tempere com ervas e limão; cozinhe em grelha, vapor ou forno 180°C até ponto seguro; monte prato combinando macros desejados.',
  (case when n <= 50 then 320 else 480 end + (n % 9) * 6),
  (case when n <= 50 then 28 else 36 end + (n % 5))::numeric,
  (case when n <= 50 then 35 else 50 end + (n % 7))::numeric,
  (case when n <= 50 then 12 else 18 end + (n % 4))::numeric
from generate_series(1, 100) x(n)
where not exists (select 1 from public.receitas limit 1);

notify pgrst, 'reload schema';
