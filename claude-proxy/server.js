const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();

// CORS — allow only Kate's Netlify site
app.use(cors({
  origin: [
    'https://verdant-pudding-f296ae.netlify.app',
    'http://localhost:3000' // for local testing
  ]
}));

app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'claude-proxy is running' });
});

// Main endpoint — all games call this
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Anthropic error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`claude-proxy running on port ${PORT}`);
});
