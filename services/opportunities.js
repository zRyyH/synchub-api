const { openai } = require('../config');
const db = require('../lib/directus');

async function getPrompt() {
    const { data } = await db.get('/items/synchub?limit=1');
    const item = Array.isArray(data) ? data[0] : data;
    if (!item?.prompt) throw new Error('Prompt não configurado');
    return item.prompt;
}

async function fetchFromGPT(userPrompt) {
    const systemPrompt = `
Retorne APENAS JSON válido no formato:
[{"title":"","style":"","use":"","payment":"","term":"YYYY-MM-DD HH:MM:SS ou null","plataform":"","url":""}]
Sem markdown, sem texto adicional.`;

    const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openai.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'gpt-4o',
            tools: [{ type: 'web_search_preview', search_context_size: 'high' }],
            instructions: systemPrompt,
            input: userPrompt
        })
    });

    if (!res.ok) throw new Error(`GPT Error: ${res.status}`);

    const data = await res.json();

    const msg = data.output?.find(i => i.type === 'message');
    const content = msg?.content?.find(c => c.type === 'output_text')?.text
        || msg?.content?.find(c => c.type === 'text')?.text
        || data.output_text
        || '';

    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];

    try {
        const parsed = JSON.parse(match[0]);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function exists(url) {
    if (!url) return false;
    const { data } = await db.get(`/items/opportunities?filter[url][_eq]=${encodeURIComponent(url)}`);
    return data?.length > 0;
}

async function create(opp) {
    let term = null;
    if (opp.term && opp.term !== 'null') {
        const d = new Date(opp.term);
        if (!isNaN(d)) term = d.toISOString().slice(0, 19).replace('T', ' ');
    }

    return db.post('/items/opportunities', {
        title: opp.title || null,
        style: opp.style || null,
        use: opp.use || null,
        payment: opp.payment || null,
        term,
        plataform: opp.plataform || opp.platform || null,
        url: opp.url || null
    });
}

async function fetchAndCreate() {
    const prompt = await getPrompt();
    const opportunities = await fetchFromGPT(prompt);

    let created = 0, skipped = 0;

    for (const opp of opportunities) {
        if (await exists(opp.url)) {
            skipped++;
        } else {
            await create(opp);
            created++;
        }
    }

    return { success: true, created, skipped, total: opportunities.length };
}

module.exports = { fetchAndCreate };