'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '../../../components/auth/AuthGuard';
import Navbar from '../../../components/ui/Navbar';
import { useAuth } from '../../../hooks/useAuth';
import { createListing } from '../../../lib/listings';

const CATEGORIES = [
  { value: 'books',       label: 'Books',       emoji: '📚' },
  { value: 'notes',       label: 'Notes',       emoji: '📝' },
  { value: 'electronics', label: 'Electronics', emoji: '💻' },
  { value: 'lab',         label: 'Lab Materials', emoji: '🔬' },
  { value: 'hostel',      label: 'Hostel Items', emoji: '🛋️' },
  { value: 'other',       label: 'Other',        emoji: '📦' },
];

const CONDITIONS = [
  { value: 'new',  label: 'New',  desc: 'Unused, sealed' },
  { value: 'good', label: 'Good', desc: 'Minor wear, works great' },
  { value: 'fair', label: 'Fair', desc: 'Visible use, fully functional' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear, still usable' },
];

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [category, setCategory] = useState('books');
  const [images, setImages] = useState([]); // Stores raw File objects for upload
  const [previews, setPreviews] = useState([]); // Stores client URLs for browser visualization
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle local image selection and map blob preview links
  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Filter to allow only image files
    const validImages = files.filter((file) => file.type.startsWith('image/'));

    if (validImages.length !== files.length) {
      setError('Only image files (JPEG, PNG, etc.) are allowed.');
    }

    setImages((prev) => [...prev, ...validImages]);

    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all fields.');
      return;
    }
    if (Number(price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await createListing(
        {
          sellerId: user.uid,
          sellerEmail: user.email,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition,
          category,
        },
        images
      );
      previews.forEach((url) => URL.revokeObjectURL(url));
      
      router.push('/marketplace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--brand-paper)' }}>
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm mb-8 text-[var(--brand-muted)] hover:text-white"
          >
            ← Back to Marketplace
          </Link>

          <h1 className="text-5xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)', color: '#f4f2ff' }}>
            Create Listing
          </h1>
          <p className="text-lg text-[var(--brand-muted)] mb-10">
            Your anonymous identity will be shown
          </p>

          <div className="rounded-3xl p-10" style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}>
            <form onSubmit={handleSubmit} className="space-y-10">

              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Mathematics - 3rd Semester"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full text-lg py-4"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Description</label>
                <textarea
                  placeholder="Describe your item..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="input-field w-full resize-y"
                  maxLength={500}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-4 text-white">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className="flex flex-col items-center gap-3 py-6 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: category === cat.value ? 'var(--brand-accent)' : 'var(--brand-border)',
                        background: category === cat.value ? 'var(--brand-surface2)' : 'transparent',
                      }}
                    >
                      <span className="text-5xl">{cat.emoji}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold mb-4 text-white">Condition</label>
                <div className="grid grid-cols-2 gap-4">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCondition(c.value)}
                      className="p-6 rounded-2xl border-2 text-left transition-all"
                      style={{
                        borderColor: condition === c.value ? 'var(--brand-accent)' : 'var(--brand-border)',
                        background: condition === c.value ? 'var(--brand-surface2)' : 'transparent',
                      }}
                    >
                      <div className="font-semibold text-xl mb-1">{c.label}</div>
                      <div className="text-sm text-[var(--brand-muted)]">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload Block */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Item Images</label>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Preview Thumbnails */}
                  {previews.map((src, index) => (
                    <div key={src} className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--brand-border)] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={src} 
                        alt="Preview structural thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Upload Interactive Shell Trigger */}
                  <label 
                    className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed cursor-pointer hover:bg-white/5 transition-all"
                    style={{ borderColor: 'var(--brand-border)' }}
                  >
                    <span className="text-3xl mb-1 text-[var(--brand-muted)]">+</span>
                    <span className="text-xs font-medium text-[var(--brand-muted)]">Upload</span>
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-[var(--brand-muted)]">You can select multiple photos showing different angles.</p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Price (৳)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-[var(--brand-muted)]">৳</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field w-full pl-14 text-3xl font-semibold py-6"
                  />
                </div>
              </div>

              {error && <div className="text-red-400 bg-red-950/50 p-4 rounded-2xl">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 text-xl font-semibold rounded-2xl btn-primary"
              >
                {loading ? 'Uploading Images & Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
