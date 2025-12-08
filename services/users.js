const db = require('../lib/directus');

const ROLE_ID = '73f63e4b-23ae-4def-9d35-e3742205bd00';

async function findByEmail(email) {
    const { data } = await db.get(`/users?filter[email][_eq]=${encodeURIComponent(email)}`);
    return data?.[0] || null;
}

async function create({ email, first_name, last_name, status = 'active' }) {
    return db.post('/users', { email, first_name, last_name, status, role: ROLE_ID });
}

async function updateStatus(email, status) {
    const user = await findByEmail(email);
    if (!user) return null;
    return db.patch(`/users/${user.id}`, { status });
}

async function getAll() {
    const { data } = await db.get('/users');
    return data || [];
}

module.exports = { findByEmail, create, updateStatus, getAll };
