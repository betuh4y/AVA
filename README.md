# 🐱 Doação PIX — Gatinha

Stack: **Next.js 14 + Server Actions + Tailwind + Mercado Pago**
Deploy: **GitHub → Vercel (grátis)**

---

## Como funciona (segurança)

```
Browser                  Next.js Server Action          Mercado Pago
   │                            │                            │
   │── createPixPayment() ─────>│  (roda no servidor)        │
   │                            │── POST /v1/payments ──────>│
   │                            │<── { qr_code, id } ────────│
   │<── { qrCode, paymentId } ──│                            │
   │                            │                            │
   │── checkPixPayment() ──────>│  (poll a cada 6s)          │
   │                            │── GET /v1/payments/id ────>│
   │<── { approved } ───────────│                            │
```

✅ `MP_ACCESS_TOKEN` fica **apenas no Vercel** (env var secreta)
✅ Server Actions rodam no servidor — nunca expostos ao browser
✅ `.env.local` está no `.gitignore` — nunca vai ao GitHub

---

## Rodar localmente

```bash
# 1. Instalar
npm install

# 2. Editar .env.local
MP_ACCESS_TOKEN=APP_USR-SEU-TOKEN-DE-PRODUCAO-AQUI

# 3. Rodar
npm run dev
# → http://localhost:3000
```

---

## Deploy no GitHub + Vercel (passo a passo)

### Passo 1 — Subir no GitHub

```bash
git init
git add .
git commit -m "pix gatinha"
```

Crie um repositório em **github.com** e suba:
```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

> O `.gitignore` já exclui `.env.local` — seu token nunca vai ao GitHub ✅

### Passo 2 — Conectar ao Vercel

1. Acesse **vercel.com** e crie conta gratuita (pode entrar com o GitHub)
2. Clique em **"Add New Project"**
3. Escolha o repositório que você criou
4. Clique em **"Deploy"** (as configurações são detectadas automaticamente)

### Passo 3 — Adicionar o token secreto

1. No projeto no Vercel, vá em **Settings → Environment Variables**
2. Clique em **Add**:
   - **Name:** `MP_ACCESS_TOKEN`
   - **Value:** seu Access Token de PRODUÇÃO (começa com `APP_USR-`)
   - **Environment:** Production + Preview + Development
3. Clique em **Save**
4. Vá em **Deployments** → clique nos 3 pontos → **Redeploy**

### Pronto! 🎉

Você receberá uma URL pública tipo:
`https://pix-gatinha.vercel.app`

---

## Onde pegar o Access Token de Produção

1. Acesse: [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Vá em **Aplicações → Sua app → Credenciais de produção**
3. Copie o **Access Token** (começa com `APP_USR-`)

> ⚠️ Não use credenciais de Sandbox/Teste — não geram QR Code real.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── actions/
│   │   └── pix.ts           ← Server Actions (createPixPayment, checkPixPayment)
│   ├── components/
│   │   └── DoacaoForm.tsx   ← UI completa (Client Component)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
.env.local                   ← 🔒 Token local (no .gitignore)
.gitignore
```
