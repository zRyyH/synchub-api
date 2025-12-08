const users = require('../services/users');
const { Router } = require('express');

const router = Router();

router.post('/activate', async (req, res) => {
    const { email, first_name, last_name } = req.body.data?.buyer || {};
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    try {
        const exists = await users.findByEmail(email);
        if (exists) {
            await users.updateStatus(email, 'active');
            return res.json({ message: 'Usuário ativado', email });
        }
        await users.create({ email, first_name, last_name, status: 'active' });
        res.status(201).json({ message: 'Usuário criado e ativado', email });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao processar webhook' });
    }
});

router.post('/suspend', async (req, res) => {
    const { email } = req.body.data?.buyer || {};
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    try {
        const user = await users.findByEmail(email);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        await users.updateStatus(email, 'suspended');
        res.json({ message: 'Usuário suspenso', email });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao processar webhook' });
    }
});

module.exports = router;
