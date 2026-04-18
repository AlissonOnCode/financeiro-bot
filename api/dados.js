const NOTION_DB_ID = "1ea593d445984e69b12dc474bd93cd82";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

async function buscarTransacoes(notionToken, mes) {
  const [ano, mesNum] = mes.split("-");
  const inicio = `${ano}-${mesNum}-01`;
  const fim = new Date(ano, parseInt(mesNum), 0).toISOString().split("T")[0];

  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Data", date: { on_or_after: inicio } },
          { property: "Data", date: { on_or_before: fim } },
        ],
      },
      sorts: [{ property: "Data", direction: "descending" }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Notion error ${res.status}: ${data.message}`);
  return data.results;
}

function parsearPagina(page) {
  const props = page.properties;
  return {
    id: page.id,
    descricao: props.Descrição?.title?.[0]?.text?.content ?? "",
    valor: props.Valor?.number ?? 0,
    categoria: props.Categoria?.select?.name ?? "Outros",
    data: props.Data?.date?.start ?? null,
  };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  const { mes, notion_token } = req.query;

  if (!notion_token) return res.status(400).json({ error: "notion_token é obrigatório" });
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) return res.status(400).json({ error: "mes deve estar no formato YYYY-MM" });

  try {
    const paginas = await buscarTransacoes(notion_token, mes);
    const transactions = paginas.map(parsearPagina);

    const totalReceitas = transactions.filter(t => t.valor > 0).reduce((s, t) => s + t.valor, 0);
    const totalDespesas = transactions.filter(t => t.valor < 0).reduce((s, t) => s + t.valor, 0);
    const saldo = totalReceitas + totalDespesas;

    const porCategoria = transactions.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] ?? 0) + t.valor;
      return acc;
    }, {});

    return res.status(200).json({ transactions, totalReceitas, totalDespesas, saldo, porCategoria });
  } catch (err) {
    console.error("[dados] erro:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
