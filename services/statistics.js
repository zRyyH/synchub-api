const db = require('../lib/directus');
const users = require('./users');

async function getPitches(userId) {
    const { data } = await db.get(`/items/pitches?filter[user_created][_eq]=${userId}`);
    return data || [];
}

async function getByUser(userId) {
    const { data } = await db.get(`/items/statistics?filter[user][_eq]=${userId}`);
    return data?.[0] || null;
}

function calculate(pitches) {
    const now = new Date();
    const total = pitches.length;
    
    const thisMonth = pitches.filter(p => {
        const d = new Date(p.date_created);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const byStatus = (s) => pitches.filter(p => p.status?.toLowerCase() === s).length;
    const approved = byStatus('aceito');
    const refused = byStatus('rejeitado');
    const underReview = byStatus('aguardando');
    const rate = total > 0 ? ((approved / total) * 100).toFixed(2) : '0.00';

    const insights = total === 0 
        ? 'Nenhum pitch enviado ainda. Comece a enviar suas músicas!'
        : [
            rate >= 50 ? 'Excelente taxa de aprovação!' : rate >= 25 ? 'Boa taxa de aprovação!' : total >= 5 ? 'Considere revisar a qualidade.' : '',
            thisMonth >= 10 ? 'Ótima atividade este mês!' : thisMonth === 0 ? 'Nenhum pitch este mês.' : '',
            underReview > 5 ? `${underReview} pitches aguardando.` : ''
          ].filter(Boolean).join(' ') || 'Continue enviando pitches!';

    return {
        all_send_musics: String(total),
        send_mounth: String(thisMonth),
        participation_fee: rate,
        accepted_pitches: String(approved),
        approved: String(approved),
        refused: String(refused),
        under_review: String(underReview),
        automatic_insights: insights
    };
}

async function generateForAllUsers() {
    const allUsers = await users.getAll();
    let processed = 0;

    for (const user of allUsers) {
        try {
            const pitches = await getPitches(user.id);
            const stats = calculate(pitches);
            const existing = await getByUser(user.id);

            if (existing) {
                await db.patch(`/items/statistics/${existing.id}`, stats);
            } else {
                await db.post('/items/statistics', { ...stats, user: user.id });
            }
            processed++;
        } catch (e) {
            console.error(`[STATS] Erro ${user.email}:`, e.message);
        }
    }

    return { success: true, processed };
}

module.exports = { generateForAllUsers };
