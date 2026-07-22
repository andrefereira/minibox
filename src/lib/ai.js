import { sb } from "./supabase.js";

export async function identificarProdutosPorVoz(transcript, produtos) {
  const { data, error } = await sb.functions.invoke("identificar-produtos", {
    body: {
      transcript,
      produtos: produtos.map(p => ({ id: p.id, nome: p.nome, categoria: p.categoria, unidade: p.unidade })),
    },
  });
  if (error) throw error;
  return data?.itens || [];
}
