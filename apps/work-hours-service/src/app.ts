import express from 'express';
import cors from 'cors';
import router from './handlers/index.js';

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'work-hours-service' });
});

// ルーティング
app.use('/api/v1', router);

export default app;
