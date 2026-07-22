-- Adicionar campo de código de barras aos produtos
alter table produtos add column if not exists codigo_barras text;
create index if not exists idx_produtos_codigo_barras on produtos(codigo_barras);
