const NOTION_DB_ID = "1ea593d445984e69b12dc474bd93cd82";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function notionHeaders(token) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "Notion-Version": "2022-06-28",
  };
}

function buildProperties({ descricao, valor, categoria, data }) {
  return {
    Descrição: { title: [{ text: { content: descricao } }] },
    Valor: { number: valor },
    Categoria: { select: { name: categoria } },
    Data: { date: { start: data } },
  };
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => (raw += c));
    req.on("end", () => resolve(JSON.parse(raw || "{}")));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  // POST — criar transação
  if (req.method === "POST") {
    const { notion_token, descricao, valor, categoria, data } = await readBody(req);
    if (!notion_token || !descricao || valor == null || !categoria || !data)
      return res.status(400).json({ error: "Campos obrigatórios: notion_token, descricao, valor, categoria, data" });

    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: notionHeaders(notion_token),
      body: JSON.stringify({ parent: { database_id: NOTION_DB_ID }, properties: buildProperties({ descricao, valor, categoria, data }) }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message });
    return res.status(201).json({ id: d.id });
  }

  // PATCH — editar transação
  if (req.method === "PATCH") {
    const { notion_token, id, descricao, valor, categoria, data } = await readBody(req);
    if (!notion_token || !id)
      return res.status(400).json({ error: "Campos obrigatórios: notion_token, id" });

    const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: notionHeaders(notion_token),
      body: JSON.stringify({ properties: buildProperties({ descricao, valor, categoria, data }) }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message });
    return res.status(200).json({ id: d.id });
  }

  // DELETE — arquivar transação
  if (req.method === "DELETE") {
    const { id, notion_token } = req.query;
    if (!notion_token || !id)
      return res.status(400).json({ error: "Query params obrigatórios: id, notion_token" });

    const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: notionHeaders(notion_token),
      body: JSON.stringify({ archived: true }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
