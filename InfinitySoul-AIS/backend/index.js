require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runFullAudit } = require('../api/audit-engine');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/audit', async (req, res) => {
  const { url } = req.body;
  const report = await runFullAudit(url);
  res.json(report);
});

app.listen(3001, () => console.log('Backend running on port 3001'));
