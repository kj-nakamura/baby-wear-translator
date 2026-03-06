import app from './app';

const port = process.env.PORT || 8081;

// サーバー起動
app.listen(port, () => {
  console.log(`Work Hours Service listening at http://localhost:${port}`);
});
