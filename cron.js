const opportunities = require('./services/opportunities');
const statistics = require('./services/statistics');
const cron = require('node-cron');

const TZ = { timezone: 'America/Sao_Paulo' };

function init() {
    // Estatísticas: a cada minuto
    cron.schedule('* * * * *', async () => {
        try {
            await statistics.generateForAllUsers();
        } catch (e) {
            console.error('[CRON] Stats:', e.message);
        }
    }, TZ);

    // Oportunidades: domingo 00:00
    cron.schedule('0 0 * * 0', async () => {
        try {
            const r = await opportunities.fetchAndCreate();
            console.log(`[CRON] Oportunidades - Criadas: ${r.created}, Ignoradas: ${r.skipped}`);
        } catch (e) {
            console.error('[CRON] Opportunities:', e.message);
        }
    }, TZ);

    console.log('[CRON] Agendados: stats (1min), opportunities (dom 00:00)');
}

module.exports = { init };
