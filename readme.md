# Watch2Gether-Lite (2 Kullanıcı)

Basit, ücretsiz-katman dostu Watch2Gether tarzı uygulama (sadece 2 eşzamanlı kullanıcı).

## Klasör yapısı
- `server/` — Node.js + Socket.IO backend
- `client/` — Statik frontend: HTML/CSS/JS (YouTube IFrame API)

## Lokal çalıştırma

### Backend
```bash
cd server
cp .env.example .env
# .env içindeki FRONTEND_ORIGIN'i güncelle (örn: http://localhost:5500)
npm install
npm run start
