const { directus } = require('../config');

const headers = {
    'Authorization': `Bearer ${directus.token}`,
    'Content-Type': 'application/json'
};

async function request(endpoint, options = {}) {
    const res = await fetch(`${directus.url}${endpoint}`, { headers, ...options });
    return res.json();
}

const get = (endpoint) => request(endpoint);

const post = (endpoint, data) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
});

const patch = (endpoint, data) => request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
});

module.exports = { get, post, patch };