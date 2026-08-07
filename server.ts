import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve portal utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API buat FB - biar gak ke-block pas rame di Vercel
app.get('/api/fb-embed', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL kosong');
  
  const encoded = encodeURIComponent(url as string);
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=380`;
  
  res.json({ embedUrl });
});

app.listen(PORT, () => {
  console.log(`🌿 Indramayu Club jalan di http://localhost:${PORT}`);
});
