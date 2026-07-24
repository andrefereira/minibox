-- Assinatura do cliente nas vendas por notinha (capturada na tela de venda)
alter table vendas add column if not exists assinatura text;
