'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LISTINGS = [
  { cat: 'Books', emoji: '📚', title: 'Calculus 9th Ed.', price: '৳320', condition: 'Good', accent: '#60a5fa' },
  { cat: 'Electronics', emoji: '💻', title: 'Xiaomi Earbuds', price: '৳850', condition: 'New', accent: '#34d399' },
  { cat: 'Notes', emoji: '📝', title: 'Physics Notes Yr2', price: '৳150', condition: 'Good', accent: '#a78bfa' },
  { cat: 'Hostel', emoji: '🛋️', title: 'Study Lamp', price: '৳200', condition: 'Fair', accent: '#fb923c' },
  { cat: 'Lab', emoji: '🔬', title: 'Lab Coat (M)', price: '৳400', condition: 'New', accent: '#f472b6' },
  { cat: 'Books', emoji: '📗', title: 'Organic Chem', price: '৳280', condition: 'Fair', accent: '#60a5fa' },
];

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🦋', '🐸'];
const NAMES   = ['SilentFox', 'CoolPanda', 'NightOwl', 'QuietLion', 'SwiftWolf', 'LuckyBear'];

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const activeAvatar = AVATARS[tick % AVATARS.length];
  const activeName   = NAMES[tick % NAMES.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .wp { min-height:100vh; background:#07060e; color:#f4f2ff; font-family:'DM Sans',sans-serif; position:relative; overflow-x:hidden; }

        /* grain */
        .wp::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.5;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }

        /* blobs */
        .blob { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .blob-1 { width:600px; height:600px; top:-200px; left:-150px; background:radial-gradient(circle, rgba(124,106,247,.18), transparent 70%); animation:drift1 18s ease-in-out infinite alternate; }
        .blob-2 { width:500px; height:500px; bottom:-100px; right:-100px; background:radial-gradient(circle, rgba(232,78,124,.14), transparent 70%); animation:drift2 22s ease-in-out infinite alternate; }
        .blob-3 { width:350px; height:350px; top:40%; left:50%; background:radial-gradient(circle, rgba(52,211,153,.1), transparent 70%); animation:drift1 26s ease-in-out infinite alternate-reverse; }
        @keyframes drift1 { to { transform:translate(40px, 60px) scale(1.1); } }
        @keyframes drift2 { to { transform:translate(-40px, -50px) scale(1.08); } }

        .wp-inner { position:relative; z-index:1; max-width:1100px; margin:0 auto; padding:80px 24px 100px; }

        /* ── HERO ── */
        .hero { text-align:center; margin-bottom:100px; }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-size:11px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
          color:#7c6af7; margin-bottom:28px;
          padding:6px 16px; border-radius:999px;
          border:1px solid rgba(124,106,247,.3);
          background:rgba(124,106,247,.08);
        }
        .hero-eyebrow span { width:6px; height:6px; border-radius:50%; background:#7c6af7; box-shadow:0 0 8px rgba(124,106,247,1); display:inline-block; animation:pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }

        .hero-h1 {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:clamp(56px,8vw,110px);
          line-height:.9; letter-spacing:-.05em;
          margin-bottom:32px;
        }
        .hero-h1 em { font-style:normal; color:transparent; -webkit-text-stroke:2px rgba(255,255,255,.25); }
        .hero-h1 .acc { color:#7c6af7; }

        .hero-sub { font-size:clamp(16px,2vw,20px); font-weight:300; color:rgba(255,255,255,.4); max-width:480px; margin:0 auto 48px; line-height:1.7; }

        .hero-cta {
          display:inline-flex; align-items:center; gap:12px;
          padding:20px 40px; border-radius:999px;
          background:#7c6af7; color:#fff;
          font-family:'Syne',sans-serif; font-size:18px; font-weight:700;
          text-decoration:none; position:relative; overflow:hidden;
          box-shadow:0 8px 40px rgba(124,106,247,.45);
          transition:transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
        }
        .hero-cta::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.15),transparent 60%); pointer-events:none; }
        .hero-cta:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 16px 50px rgba(124,106,247,.55); }
        .hero-cta-arrow { font-size:20px; transition:transform .2s ease; }
        .hero-cta:hover .hero-cta-arrow { transform:translateX(4px); }

        .hero-note { margin-top:20px; font-size:13px; color:rgba(255,255,255,.2); }

        /* ── FLOATING CARDS PREVIEW ── */
        .preview-wrap {
          position:relative; height:320px; margin-bottom:120px;
          display:flex; align-items:center; justify-content:center;
        }
        .preview-card {
          position:absolute;
          background:#111024; border:1px solid rgba(255,255,255,.08); border-radius:20px;
          padding:18px 20px; width:200px;
          box-shadow:0 20px 60px rgba(0,0,0,.5);
          transition:transform .6s cubic-bezier(.34,1.56,.64,1);
        }
        .pc-cat { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:6px; }
        .pc-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f4f2ff; margin-bottom:10px; }
        .pc-bottom { display:flex; justify-content:space-between; align-items:center; }
        .pc-price { font-size:18px; font-weight:800; font-family:'Syne',sans-serif; }
        .pc-badge { font-size:10px; padding:3px 9px; border-radius:999px; background:rgba(255,255,255,.07); color:rgba(255,255,255,.45); }

        /* ── IDENTITY CARD ── */
        .identity-section { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; margin-bottom:120px; }
        @media(max-width:700px){ .identity-section{ grid-template-columns:1fr; } }

        .id-card {
          background:#111024; border:1px solid rgba(255,255,255,.08); border-radius:28px;
          padding:40px; position:relative; overflow:hidden;
        }
        .id-card::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(124,106,247,.15),transparent 70%); }
        .id-avatar { font-size:64px; margin-bottom:16px; display:block; transition:all .5s cubic-bezier(.34,1.56,.64,1); }
        .id-name { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; margin-bottom:6px; transition:all .4s ease; }
        .id-tag { font-size:12px; color:rgba(255,255,255,.3); margin-bottom:24px; }
        .id-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; border:1px solid rgba(124,106,247,.3); background:rgba(124,106,247,.1); font-size:12px; font-weight:500; color:#a78bfa; }
        .id-pill-dot { width:5px; height:5px; border-radius:50%; background:#7c6af7; box-shadow:0 0 6px rgba(124,106,247,1); }

        .id-text h2 { font-family:'Syne',sans-serif; font-size:clamp(32px,4vw,48px); font-weight:800; line-height:.95; letter-spacing:-.04em; margin-bottom:20px; }
        .id-text h2 em { font-style:normal; color:#7c6af7; }
        .id-text p { font-size:16px; font-weight:300; color:rgba(255,255,255,.4); line-height:1.7; }

        /* ── FEATURES ── */
        .features { margin-bottom:120px; }
        .features-label { font-size:11px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:rgba(255,255,255,.25); margin-bottom:48px; text-align:center; }
        .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
        .feat-card {
          background:#111024; border:1px solid rgba(255,255,255,.06); border-radius:24px;
          padding:36px; position:relative; overflow:hidden;
          transition:border-color .2s ease, transform .2s ease;
        }
        .feat-card:hover { border-color:rgba(255,255,255,.14); transform:translateY(-4px); }
        .feat-icon { font-size:36px; margin-bottom:20px; display:block; }
        .feat-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; margin-bottom:10px; }
        .feat-desc { font-size:14px; font-weight:300; color:rgba(255,255,255,.4); line-height:1.65; }
        .feat-accent { position:absolute; bottom:0; left:0; right:0; height:2px; border-radius:0 0 24px 24px; }

        /* ── CATEGORIES ── */
        .cats { margin-bottom:120px; text-align:center; }
        .cats h2 { font-family:'Syne',sans-serif; font-size:clamp(28px,4vw,44px); font-weight:800; letter-spacing:-.04em; margin-bottom:40px; }
        .cats-row { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
        .cat-pill {
          display:flex; align-items:center; gap:10px;
          padding:14px 24px; border-radius:999px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.03);
          font-size:15px; font-weight:500; color:rgba(255,255,255,.6);
          transition:all .2s ease;
        }
        .cat-pill:hover { border-color:rgba(255,255,255,.18); color:#f4f2ff; background:rgba(255,255,255,.06); transform:translateY(-2px); }

        /* ── BOTTOM CTA ── */
        .bottom-cta { text-align:center; }
        .bottom-cta h2 { font-family:'Syne',sans-serif; font-size:clamp(40px,6vw,80px); font-weight:800; line-height:.93; letter-spacing:-.05em; margin-bottom:32px; }
        .bottom-cta h2 em { font-style:normal; color:transparent; -webkit-text-stroke:2px rgba(255,255,255,.22); }

        /* mount */
        .mount { opacity:0; transform:translateY(20px); animation:mountIn .6s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes mountIn { to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="wp">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="wp-inner">

          {/* ── HERO ── */}
          <div className="hero mount" style={{ animationDelay: '0s' }}>
            <div className="hero-eyebrow">
              <span /> Anonymous campus marketplace
            </div>
            <h1 className="hero-h1">
              Trade stuff.<br />
              Stay <em>hidden.</em><br />
              <span className="acc">Save money.</span>
            </h1>
            <p className="hero-sub">
              The anonymous marketplace built for university students. Buy, sell, and chat — without revealing who you are.
            </p>
            <Link href="/marketplace" className="hero-cta">
              Enter the Marketplace
              <span className="hero-cta-arrow">→</span>
            </Link>
            <p className="hero-note">No real name needed. Ever.</p>
          </div>

          {/* ── FLOATING LISTING CARDS ── */}
          <div className="preview-wrap mount" style={{ animationDelay: '0.1s' }}>
            {LISTINGS.map((l, i) => {
              const angles  = [-18, -8, 0, 8, 18, 26];
              const offsets = [-220, -120, 0, 120, 220, 310];
              const tops    = [30, -20, 10, -10, 20, -30];
              return (
                <div
                  key={l.title}
                  className="preview-card"
                  style={{
                    transform: `rotate(${angles[i]}deg) translateX(${offsets[i]}px) translateY(${tops[i]}px)`,
                    zIndex: i === 2 ? 10 : 6 - Math.abs(i - 2),
                    opacity: i === 2 ? 1 : i === 1 || i === 3 ? 0.85 : 0.55,
                  }}
                >
                  <p className="pc-cat" style={{ color: l.accent }}>{l.cat}</p>
                  <p className="pc-title">{l.emoji} {l.title}</p>
                  <div className="pc-bottom">
                    <span className="pc-price" style={{ color: l.accent }}>{l.price}</span>
                    <span className="pc-badge">{l.condition}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ANONYMOUS IDENTITY ── */}
          <div className="identity-section mount" style={{ animationDelay: '0.15s' }}>
            <div className="id-card">
              <span className="id-avatar" key={activeAvatar}>{activeAvatar}</span>
              <p className="id-name" key={activeName}>{activeName}</p>
              <p className="id-tag">Your anonymous identity on CampusXchange</p>
              <div className="id-pill">
                <div className="id-pill-dot" />
                Identity changes every session
              </div>
            </div>
            <div className="id-text">
              <h2>You're just<br /><em>a nickname.</em></h2>
              <p>
                Every account gets a random avatar and alias. Your real name, photo, and email stay private. Buyers and sellers only ever see who you choose to be.
              </p>
            </div>
          </div>

          {/* ── FEATURES ── */}
          <div className="features mount" style={{ animationDelay: '0.2s' }}>
            <p className="features-label">Why CampusXchange</p>
            <div className="features-grid">
              {[
                { icon: '🔒', title: 'Zero identity exposure', desc: 'Random alias, random avatar. No one knows it\'s you unless you tell them.', accent: 'linear-gradient(90deg,#7c6af7,transparent)' },
                { icon: '💬', title: 'Private in-app chat', desc: 'Negotiate price, arrange handoff — all inside the app. No phone numbers exchanged.', accent: 'linear-gradient(90deg,#34d399,transparent)' },
                { icon: '📦', title: 'Everything campus needs', desc: 'Textbooks, notes, lab gear, electronics, hostel items. If students need it, it\'s here.', accent: 'linear-gradient(90deg,#60a5fa,transparent)' },
                { icon: '⚡', title: 'List in 60 seconds', desc: 'Photo, title, price, done. Your listing is live before your next class starts.', accent: 'linear-gradient(90deg,#f59e0b,transparent)' },
                { icon: '🛡️', title: 'Admin moderated', desc: 'Listings are monitored. Anything sketchy gets taken down fast.', accent: 'linear-gradient(90deg,#f472b6,transparent)' },
                { icon: '🎓', title: 'Students only', desc: 'Built for university life. Every feature exists because a student needed it.', accent: 'linear-gradient(90deg,#a78bfa,transparent)' },
              ].map(f => (
                <div key={f.title} className="feat-card">
                  <span className="feat-icon">{f.icon}</span>
                  <p className="feat-title">{f.title}</p>
                  <p className="feat-desc">{f.desc}</p>
                  <div className="feat-accent" style={{ background: f.accent }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── CATEGORIES ── */}
          <div className="cats mount" style={{ animationDelay: '0.25s' }}>
            <h2>What's being sold<br />right now</h2>
            <div className="cats-row">
              {[
                { e: '📚', l: 'Textbooks' },
                { e: '📝', l: 'Notes & Guides' },
                { e: '💻', l: 'Electronics' },
                { e: '🔬', l: 'Lab Equipment' },
                { e: '🛋️', l: 'Hostel Items' },
                { e: '📦', l: 'Other Stuff' },
              ].map(c => (
                <div key={c.l} className="cat-pill">
                  <span>{c.e}</span> {c.l}
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM CTA ── */}
          <div className="bottom-cta mount" style={{ animationDelay: '0.3s' }}>
            <h2>
              Your campus.<br />
              Your <em>marketplace.</em>
            </h2>
            <Link href="/marketplace" className="hero-cta">
              Start browsing →
            </Link>
            <p className="hero-note" style={{ marginTop: '20px' }}>
              Already have an account?{' '}
              <Link href="/marketplace" style={{ color: '#a78bfa', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Go to marketplace
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
