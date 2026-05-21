# CampusXchange 🦊

> An anonymous marketplace built for university students to buy, sell, and connect safely.

🌐 Live Demo: https://campus-x-change-zeta.vercel.app

Built with **Next.js 14 (App Router)** + **Firebase Authentication** + **Cloud Firestore**.

---

# ✨ Overview

CampusXchange is a lightweight anonymous marketplace designed specifically for university communities.

Students can:
- create listings
- browse items
- express interest
- chat in real-time

—all without exposing their real identities.

Every user receives:
- a randomly generated anonymous username
- an emoji avatar
- a university-verified account

This project was built as a hobby project to explore:
- real-time systems
- authentication & authorization
- Firestore architecture
- anonymous social interaction
- modern UI/UX design

---

# 🚀 Features

| Feature | Description |
|---|---|
| **Anonymous Identity System** | Users receive generated names like `CosmicOtter847` with emoji avatars |
| **University Email Restriction** | Only approved university domains can register |
| **Marketplace Feed** | Browse listings in real-time |
| **Search & Category Filters** | Quickly find relevant items |
| **Create Listings** | Post items with title, description, category, price, and condition |
| **Interest Requests** | Buyers can send interest requests to sellers |
| **Seller Dashboard** | Sellers can manage incoming requests |
| **Accept & Chat Flow** | Accepting a request automatically opens a private chat |
| **Real-Time Messaging** | Firestore-powered live chat system |
| **Protected Routes** | Unauthorized users are redirected to login |
| **Responsive UI** | Optimized for desktop and mobile |
| **Serverless Architecture** | No backend server required |

---

# 🛠️ Tech Stack

## Frontend
- Next.js 14
- React
- Tailwind CSS

## Backend & Database
- Firebase Authentication
- Cloud Firestore

## Deployment
- Vercel

---

# 📂 Project Structure

```bash
app/
  login/              # Authentication page
  marketplace/        # Marketplace feed
  marketplace/new/    # Create listing page
  marketplace/[id]/   # Listing details
  dashboard/          # Seller dashboard
  chat/               # Chat list
  chat/[chatId]/      # Real-time chat room

components/
  auth/
  listings/
  ui/

hooks/
  useAuth
  useListings
  useRequests

lib/
  firebase.js
  auth.js
  listings.js
  interests.js
  anonName.js
```

---

# 🔄 Marketplace Flow

```text
User signs up with university email
        ↓
Anonymous identity is generated
        ↓
User creates a listing
        ↓
Another user clicks "Interested"
        ↓
Seller receives request in dashboard
        ↓
Seller accepts request
        ↓
Private real-time chat is created
```

---

# 🔒 Security & Privacy

CampusXchange was designed around anonymity and controlled access.

### Security Features
- Authenticated access only
- Firestore security rules
- University email verification
- Chat access restricted to participants
- Seller-only listing management
- Buyer identity hidden publicly

### Privacy Design
- No real names displayed
- No public user profiles
- Anonymous usernames only
- Minimal personal data stored

---

# ⚡ Local Development

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd campusxchange
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Run development server

```bash
npm run dev
```

Visit:

```bash
http://localhost:3000
```

---

# ☁️ Deployment

The project is deployed on Vercel:

https://campus-x-change-zeta.vercel.app

To deploy your own version:

```bash
npm install -g vercel
vercel
```

Add Firebase environment variables inside the Vercel dashboard.

---

# 📈 Future Improvements

- Image uploads with Firebase Storage
- Listing bookmarking
- Push/email notifications
- AI-powered scam/spam detection
- Advanced filtering & sorting
- User reputation system
- Dark mode
- PWA support

---

# 🧠 What I Learned

This project helped me explore:
- real-time application architecture
- Firebase authentication & Firestore
- protected route systems
- scalable frontend structure
- state management with hooks
- anonymous user interaction design
- deploying production apps with Vercel

---

# 🐛 Common Issues

### Firestore Index Errors
Firestore may require compound indexes.  
The Firebase console usually provides a direct link to create them.

### Chat Not Syncing
Ensure:
- Firestore rules are applied correctly
- required indexes exist
- users are authenticated

### University Email Rejected
Update the allowed domain inside:

```bash
app/login/page.js
```

---
# 📜 License

This project is open-source and licensed under the Apache License 2.0.

See the `LICENSE` file for more details.

---

Made with ❤️ as a hobby project and learning experience.
