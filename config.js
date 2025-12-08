require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    directus: {
        url: process.env.DIRECTUS_URL,
        token: process.env.DIRECTUS_TOKEN
    },
    openai: {
        key: process.env.OPENAI_API_KEY
    }
};
