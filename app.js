const { port } = require('./config');
const express = require('express');
const cron = require('./cron');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/opportunities', require('./routes/opportunities'));
app.use('/statistics', require('./routes/statistics'));
app.use('/webhook', require('./routes/webhooks'));

cron.init();

app.listen(port, () => console.log(`API rodando na porta ${port}`));