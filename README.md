# CampusXchange 🦊

> The anonymous buy/sell/exchange marketplace for university students.

Built with **Next.js 14 (App Router)** + **Firebase** (Auth + Firestore).  
No database server to manage — Firestore IS the database.

---

## ✨ Features

| Feature | How it works |
|---|---|
| **Anonymous identities** | Every user gets a generated name (e.g. `CosmicOtter847`) and emoji avatar on signup — real name never shown |
| **University-only access** | Signup restricted to `@iem.edu.in` emails (change in `login/page.js`) |
| **Marketplace** | Browse, search, and filter listings by category |
| **Create listings** | Title, description, price, category, condition |
| **Interest requests** | Buyers tap "Interested" → seller sees a request in their dashboard |
| **Seller dashboard** | Accept or decline requests; accepting auto-creates a private chat |
| **Real-time chat** | Messages sync live via Firestore; grouped by date; auto-scroll |
| **No storage costs** | Firebase Spark (free tier) — no image uploads needed |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

You already have a Firebase project (`campusxchange-20e4c`).  
In the Firebase Console:

**a) Enable Authentication**
- Go to Authentication → Sign-in method
- Enable **Email/Password**

**b) Set up Firestore**
- Go to Firestore Database → Create database
- Start in **production mode**
- Paste the contents of `firestore.rules` into the Rules tab

**c) Create Firestore indexes**

These compound indexes are required (Firestore will show an error link if missing):

| Collection | Fields | Order |
|---|---|---|
| `listings` | `status` ASC, `createdAt` DESC |
| `interests` | `sellerId` ASC, `createdAt` DESC |

You can create them via the Firebase Console → Firestore → Indexes.

### 3. (Optional) Use environment variables

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Add `.env.local` to `.gitignore` before pushing to GitHub.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
app/
  login/            — Signup & login page
  marketplace/      — Browse all listings
  marketplace/new/  — Create a listing
  marketplace/[id]/ — Listing detail + "I'm interested" button
  dashboard/        — Seller's request inbox
  chat/             — List of active chats
  chat/[chatId]/    — Real-time chat room

components/
  auth/AuthGuard    — Redirects to login if not authenticated
  ui/Navbar         — Sticky nav with anon identity chip
  listings/ListingCard — Listing grid card

hooks/
  useAuth           — Firebase auth state listener
  useListings       — Real-time active listings
  useRequests       — Real-time interest requests for seller

lib/
  firebase.js       — Firebase app init
  auth.js           — signup / login / logout
  listings.js       — createListing
  interests.js      — createInterest
  anonName.js       — generateAnonName / generateAnonAvatar
```

---

## 🔄 How the flow works

```
Buyer sees listing → clicks "I'm Interested"
  → creates an `interest` doc (status: pending)

Seller sees it in Dashboard → clicks "Accept & Chat"
  → interest status → "accepted"
  → a `chat` doc is created with both participants

Both can now open /chat/[chatId] and message in real-time
(only their anonymous name and avatar are ever shown)
```

---

## 🔒 Firestore Security Rules

Paste `firestore.rules` into Firebase Console → Firestore → Rules.

Key protections:
- Only authenticated users can read/write
- Sellers can only edit their own listings
- Only chat participants can read messages
- Buyers can't send messages as someone else

---

## 🌐 Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Add your Firebase env vars in the Vercel dashboard under Settings → Environment Variables.

---

## 🗓️ 3-Month Roadmap (Suggestion)

### Month 1 — Polish & test
- [ ] Add Firestore indexes (watch console for links)
- [ ] Test the full flow: signup → list → interest → chat
- [ ] Add university domain for your actual institution
- [ ] Deploy to Vercel

### Month 2 — Features
- [ ] "Mark as sold" button for sellers
- [ ] Filter by price range
- [ ] Profile page showing user's own listings
- [ ] Email notification when interest is accepted (Firebase Functions or Resend)

### Month 3 — Polish
- [ ] Responsive tweaks & mobile testing
- [ ] Add loading skeletons everywhere
- [ ] Write your project report / documentation
- [ ] Optional: image uploads via Firebase Storage (upgrade to Blaze if needed)

---

## 🐛 Common Issues

**"Missing index" error in console**  
→ Firestore needs compound indexes. Click the link in the error — it takes you straight to create it.

**Messages not loading / chat not working**  
→ Check `firestore.rules` is applied. Make sure the `orderBy('createdAt', 'asc')` index exists on the messages subcollection.

**Can't sign up — email rejected**  
→ Change `UNIVERSITY_DOMAIN` in `app/login/page.js` to your actual uni domain.

---

Made with ❤️ for Software Development 1.
