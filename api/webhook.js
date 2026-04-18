import { twiml as TwilioTwiml } from "twilio";

const NOTION_DB_ID = "1ea593d445984e69b12dc474bd93cd82";

async function interpretarGasto(mensagem) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: `You are a financial assistant. Extract expense info and return ONLY a JSON object with keys: descricao (string), valor (number in USD), categoria (one of: Alimentação, Transporte, Saúde, Lazer, Moradia, Educação, Vestuário, Outros), data (YYYY-MM-DD, use today ${new Date().toISOString().split("T")[0]} if not mentioned). No markdown, no explanation — raw JSON only.`,
      messages: [{ role: "user", content: mensagem }],
    }),
  });

  const data = await res.json();
  console.log("[anthropic] status:", res.status, "body:", JSON.stringify(data));

  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${data.error?.message}`);

  const texto = data.content[0].text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(texto);
}

async function salvarNoNotion(gasto) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        Descrição: { title: [{ text: { content: gasto.descricao } }] },
        Valor: { number: gasto.valor },
        Categoria: { select: { name: gasto.categoria } },
        Data: { date: { start: gasto.data } },
      },
    }),
  });

  const data = await res.json();
  console.log("[notion] status:", res.status, "body:", JSON.stringify(data).slice(0, 200));
  if (!res.ok) throw new Error(`Notion error ${res.status}: ${data.message}`);
}

async function lerBody(req) {
  if (req.body) {
    if (typeof req.body === "object") return req.body;
    return Object.fromEntries(new URLSearchParams(req.body));
  }
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(Object.fromEntries(new URLSearchParams(raw))));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const params = await lerBody(req);
  const mensagem = params.Body?.trim();
  console.log("[handler] mensagem recebida:", mensagem);

  if (!mensagem) return res.status(200).send("<Response></Response>");

  const twiml = new TwilioTwiml.MessagingResponse();

  try {
    const gasto = await interpretarGasto(mensagem);
    console.log("[handler] gasto interpretado:", gasto);
    await salvarNoNotion(gasto);

    twiml.message(
      `Gasto registrado!\n\nDescrição: ${gasto.descricao}\nValor: $${gasto.valor.toFixed(2)}\nCategoria: ${gasto.categoria}\nData: ${gasto.data}`
    );
  } catch (err) {
    console.error("[handler] erro:", err.message);
    twiml.message("Não consegui registrar o gasto. Tente: 'Gastei $50 no mercado'.");
  }

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twiml.toString());
}
