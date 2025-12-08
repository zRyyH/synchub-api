const opportunities = require('../services/opportunities');
const { Router } = require('express');

const router = Router();

router.post('/fetch', async (req, res) => {
    try {
        const result = await opportunities.fetchAndCreate();
        res.json({ message: 'Busca concluída', ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/status', (req, res) => {
    res.json({ status: 'active', schedule: '0 0 * * 0', timezone: 'America/Sao_Paulo' });
});

module.exports = router;
