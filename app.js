const { port } = require('./config');
const express = require('express');
const cron = require('./cron');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/webhooks', require('./routes/webhooks'));
app.use('/statistics', require('./routes/statistics'));
app.use('/opportunities', require('./routes/opportunities'));

cron.init();

app.listen(port, () => console.log(`API rodando na porta ${port}`));
