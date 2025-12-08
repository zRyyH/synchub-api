const statistics = require('../services/statistics');
const { Router } = require('express');

const router = Router();

router.post('/generate', async (req, res) => {
    try {
        const result = await statistics.generateForAllUsers();
        res.json({ message: 'Estatísticas geradas', ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/status', (req, res) => {
    res.json({ status: 'active', schedule: '* * * * *', timezone: 'America/Sao_Paulo' });
});

module.exports = router;
