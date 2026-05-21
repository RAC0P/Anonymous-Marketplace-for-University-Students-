'use client';

import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[var(--brand-paper)] flex items-center justify-center p-6">
      <div className="max-w-4xl text-center">
        <div className="mb-12">
          <span className="text-7xl mb-6 block">🦊</span>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Campus<span className="text-[var(--brand-accent)]">X</span>change
          </h1>
          <p className="text-2xl text-[var(--brand-muted)]">Anonymous Campus Marketplace</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { emoji: "🔒", title: "100% Anonymous", desc: "Use fun alias & avatar. Never reveal your real identity." },
            { emoji: "💬", title: "Safe Private Chat", desc: "Negotiate directly with buyers/sellers inside the app." },
            { emoji: "📚", title: "Campus Focused", desc: "Textbooks, notes, electronics, hostel items & more." },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-10 rounded-3xl">
              <div className="text-6xl mb-6">{feature.emoji}</div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--brand-muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/marketplace"
          className="btn-primary text-2xl px-16 py-7 inline-block"
        >
          Enter the Marketplace →
        </Link>

        <p className="mt-8 text-sm text-[var(--brand-muted)]">
          Anyone with a Gmail can join right now
        </p>
      </div>
    </div>
  );
}
