const users = require('../services/users');
const { Router } = require('express');

const router = Router();

const ACTIVATE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED'];

router.post('/', async (req, res) => {
    const { event, data } = req.body;
    const buyer = data?.buyer || data?.subscriber;

    if (!buyer?.email) {
        return res.status(400).json({ error: 'Email não encontrado' });
    }

    const { email, first_name, last_name } = buyer;
    const shouldActivate = ACTIVATE_EVENTS.includes(event);

    try {
        const existing = await users.findByEmail(email);

        if (shouldActivate) {
            if (existing) {
                await users.updateStatus(email, 'active');
            } else {
                await users.create({ email, first_name, last_name, status: 'active' });
            }
            return res.json({ event, action: 'activated', email });
        }

        if (existing) {
            await users.updateStatus(email, 'suspended');
        }

        res.json({ event, action: 'suspended', email });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;