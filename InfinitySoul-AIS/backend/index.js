require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runFullAudit } = require('../api/audit-engine');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main audit endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const report = await runFullAudit(url);
    res.json(report);
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: 'Audit failed', details: error.message });
  }
});

// Partner API endpoint
app.get('/api/partner/scores/:vaultId', async (req, res) => {
  // TODO: Implement partner API access
  res.json({ message: 'Partner API coming soon' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
