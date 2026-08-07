import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- FB CONFIG (pakai ENV dulu) ---
let fbConfig: any = {};
try {
  if (fs.existsSync(path.join(__dirname, 'fb_config.json'))) {
    fbConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'fb_config.json'), 'utf-8'));
  }
} catch {}
const FB_APP_ID = process.env.FB_APP_ID || fbConfig?.credentials?.app_id || '';
const FB_VERSION = process.env.FB_API_VERSION || 'v26.0';

// --- MUTT CONFIG (BEDA!) ---
const MUTT_API_KEY = process.env.MUTT_API_KEY || '';
const MUTT_API_URL = process.env.MUTT_API_URL || '';

app.get('/api/fb-embed', (req, res) => {
  const { url } = req.query as any;
  if (!url) return res.status(400).json({ error: 'URL kosong' });
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=380&height=476&appId=${FB_APP_ID}`;
  res.json({ embedUrl, appId: FB_APP_ID });
});

// API MUTT - TERPISAH
app.get('/api/mutt/:action', (req, res) => {
  const { action } = req.params;
  res.json({ 
    message: `MUTT API ${action}`, 
    key_exists: !!MUTT_API_KEY,
    url: MUTT_API_URL,
    note: 'Ini API beda dari FB, jangan pakai FB_APP_ID'
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'fb_Steaming.html')));

app.listen(PORT, () => console.log(`Ready - FB:${FB_APP_ID} MUTT:${!!MUTT_API_KEY}`));
export default app; // penting buat Vercel 
