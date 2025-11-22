import express from 'express';
import cors from 'cors';
import { processPromptHandler } from './routes/processRoute';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/process', processPromptHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LLM Safety Gateway' });
});

app.listen(PORT, () => {
  console.log(`🛡️  LLM Safety Gateway running on http://localhost:${PORT}`);
});
