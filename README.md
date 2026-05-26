<div align="center">

# 🛒 CampusXchange

### Anonymous Peer-to-Peer Marketplace for University Students

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campusxchange--dusky.vercel.app-6c63ff?style=for-the-badge&logo=vercel)](https://campusxchange-dusky.vercel.app/welcome)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)


> **Trade stuff. Stay hidden. Save money.**  
> Buy, sell, and exchange within your campus — completely anonymous.

</div>

---

## 📖 Overview

Every university campus has an informal economy — textbooks changing hands between semesters, hostel furniture resold at the end of the year, lab coats being passed down. But this economy typically lives in awkward WhatsApp groups and public notice boards where your real identity is always attached to your transaction.

**CampusXchange** solves this. It's a fully anonymous peer-to-peer marketplace built exclusively for university students, where you can buy, sell, and negotiate without ever exposing your real name, photo, or contact details to another user.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **Anonymous Identity** | Every user gets a randomly generated alias and avatar that resets each session |
| 💬 **In-App Chat** | Negotiate price and arrange handoff entirely within the platform — no phone numbers exchanged |
| 📦 **Category Listings** | Textbooks, notes, electronics, lab gear, hostel items and more |
| ⚡ **60-Second Listing** | Photo, title, price — your listing is live before your next class |
| 🛡️ **Admin Moderation** | All listings are reviewed before publication |
| 🔒 **Zero Identity Exposure** | Real name, photo, and email are never surfaced to other users |

---

## 🏗️ Tech Stack

```
Frontend    →  Next.js (React)
Backend     →  Firebase (Firestore + Realtime Database)
Auth        →  Firebase Authentication
Hosting     →  Vercel (Edge Network)
```

- **Next.js on Vercel** — serverless-first, auto-scaling, edge-deployed. No idle compute, no config changes needed when traffic spikes at the start of semester.
- **Firebase Auth** — handles all authentication. No passwords are ever stored by the application itself. Short-lived JWT tokens, Firebase-enforced rate limiting.
- **Firestore** — structured listing data with indexed filtering by category, price, and condition.
- **Firebase Realtime Database** — powers in-app chat with sub-second message delivery.

---

## 🔐 Security Assessment

Following initial deployment, a structured penetration test was conducted across the most common web application attack surfaces. Results are documented transparently below.

### Test Results

| Vector | Tool / Method | Result |
|---|---|---|
| Directory & endpoint enumeration | Wordlist scan | ✅ Admin routes return 403 — no file/directory exposure |
| Traffic interception | Burp Suite | ✅ HTTPS-only — no sensitive data in headers or params |
| Credential brute-force | THC-Hydra | ✅ Non-viable — Firebase Auth has no compatible attack surface |
| Cross-site scripting (search) | Manual payload injection | ✅ React output escaping blocks execution |
| Cross-site scripting (login) | Manual payload injection | ✅ Firebase rejects malformed input as `auth/invalid-email` |
| Crawler enumeration | robots.txt probe | ✅ Returns 404 — no route hints exposed |

### Known Limitations & Roadmap

The following hardening measures are actively in progress:

- [ ] Content Security Policy (CSP) headers
- [ ] `HttpOnly` and `SameSite` cookie attribute configuration
- [ ] Rate limiting on listing creation endpoints
- [ ] Formal third-party penetration test prior to wider release

Security is treated as a continuous process, not a deployment milestone.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore, Realtime Database, and Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/RAC0P/Anonymous-Marketplace-for-University-Students-.git
cd Anonymous-Marketplace-for-University-Students-

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Firebase config values in .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

---

## 📁 Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── welcome/          # Landing page
│   ├── marketplace/      # Listings browse page
│   ├── login/            # Authentication
│   ├── dashboard/        # User dashboard
│   └── chat/             # In-app messaging
├── components/           # Reusable UI components
├── lib/                  # Firebase config and utilities
└── public/               # Static assets
```

---

## 🤝 Contributing

Contributions are welcome — whether that's a bug fix, a new feature, a security finding, or a documentation improvement.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Responsible Disclosure

If you discover a security vulnerability, please do not open a public issue. Contact the maintainers directly so it can be addressed before disclosure.



<div align="center">

Built by university students, for university students.

[Live Site](https://campusxchange-dusky.vercel.app/welcome) · [Report a Bug](https://github.com/RAC0P/Anonymous-Marketplace-for-University-Students-/issues) · [Request a Feature](https://github.com/RAC0P/Anonymous-Marketplace-for-University-Students-/issues)

</div>
