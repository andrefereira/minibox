// Edge Function: recebe a transcrição de um pedido falado + o catálogo de
// produtos do Mini Box, pede pro Claude Haiku identificar quais produtos do
// catálogo foram mencionados (e em qual quantidade) e devolve só isso.
//
// A chave da Anthropic fica só aqui (secret do Supabase), nunca no navegador.
// Deploy: supabase functions deploy identificar-produtos
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5-20251001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!ANTHROPIC_API_KEY) {
    return jsonResponse({ error: "ANTHROPIC_API_KEY não configurada nos secrets da function." }, 500);
  }

  let body: { transcript?: string; produtos?: Array<{ id: number; nome: string; categoria?: string; unidade?: string }> };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON inválido" }, 400);
  }

  const { transcript, produtos } = body;
  if (!transcript || typeof transcript !== "string") {
    return jsonResponse({ error: "transcript é obrigatório" }, 400);
  }
  if (!Array.isArray(produtos) || produtos.length === 0) {
    return jsonResponse({ error: "produtos é obrigatório" }, 400);
  }

  const catalogo = produtos.map((p) => ({ id: p.id, nome: p.nome, categoria: p.categoria, unidade: p.unidade }));

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system:
        "Você é um assistente de PDV de um mini mercado. A partir da transcrição de um pedido falado pelo " +
        "vendedor, identifique quais produtos do catálogo fornecido foram mencionados e em qual quantidade. " +
        "Use APENAS produtos que existem no catálogo — nunca invente um produto novo nem escolha um id que não " +
        "esteja na lista. NUNCA substitua um produto mencionado por outro parecido ou da mesma categoria: se " +
        "pedirem algo que não existe no catálogo (ex: 'guaraná' quando só há Coca e Fanta), NÃO inclua nenhum " +
        "item para esse pedido — é preferível deixar de fora do que entregar o produto errado. Se a quantidade " +
        "não for dita, use 1. Só inclua um item se tiver certeza absoluta de que ele corresponde exatamente ao " +
        "que foi dito.",
      messages: [
        {
          role: "user",
          content: `Transcrição do pedido: "${transcript}"\n\nCatálogo de produtos (JSON):\n${JSON.stringify(catalogo)}`,
        },
      ],
      tools: [
        {
          name: "registrar_itens_identificados",
          description: "Registra os produtos do catálogo identificados no pedido falado, com suas quantidades.",
          input_schema: {
            type: "object",
            properties: {
              itens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    produto_id: { type: "integer", description: "id do produto no catálogo" },
                    quantidade: { type: "number", description: "quantidade pedida" },
                  },
                  required: ["produto_id", "quantidade"],
                },
              },
            },
            required: ["itens"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "registrar_itens_identificados" },
    }),
  });

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text();
    return jsonResponse({ error: "Falha na API da Anthropic", detail }, 502);
  }

  const data = await anthropicRes.json();
  const toolUse = data.content?.find((b: { type: string }) => b.type === "tool_use");
  const itens: Array<{ produto_id: number; quantidade: number }> = toolUse?.input?.itens ?? [];

  // Nunca confie cegamente no modelo: só devolve itens cujo id realmente existe no catálogo enviado.
  const idsValidos = new Set(produtos.map((p) => p.id));
  const itensValidos = itens.filter((it) => idsValidos.has(it.produto_id) && it.quantidade > 0);

  return jsonResponse({ itens: itensValidos });
});
