'use client';
import './NewListing.css';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { createListing } from '../../../lib/listings';

// Config constants
const CAT_EMOJIS = { books: '📚', notes: '📝', electronics: '💻', lab: '🧪', hostel: '🛋️', other: '✨' };
const CAT_LABELS = { books: 'Books', notes: 'Notes', electronics: 'Electronics', lab: 'Lab', hostel: 'Hostel', other: 'Other' };
const COND_INFO = {
  new: { dot: '#22c55e', label: 'New' },
  good: { dot: '#3b82f6', label: 'Good' },
  fair: { dot: '#f59e0b', label: 'Fair' },
  poor: { dot: '#ef4444', label: 'Poor' },
};

export default function NewListing() {
  const { user } = useAuth();
  const router = useRouter();

  // State management
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [selCat, setSelCat] = useState('books');
  const [selCond, setSelCond] = useState('good');
  
  // Restored actual file and preview state layers
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [submitState, setSubmitState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const errorBarRef = useRef(null);

  // Dynamic Multi-step Progress Calculation (now checking actual images length)
  const steps = [!!title.trim(), !!desc.trim(), price !== '' && Number(price) >= 0, images.length > 0];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Enforce max 6 images threshold safely
    const availableSlots = 6 - images.length;
    const filesToProcess = files.slice(0, availableSlots);

    if (filesToProcess.length === 0) return;

    // Generate object URLs for layout image tags
    const newPreviews = filesToProcess.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...filesToProcess]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImg = (index, e) => {
    e.stopPropagation();
    
    // Revoke URL to prevent browser context memory leaks
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to create a listing.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please add a title.');
      return;
    }

    if (!desc.trim()) {
      setErrorMsg('Please add a description.');
      return;
    }

    if (price === '' || Number(price) < 0) {
      setErrorMsg('Please enter a valid price.');
      return;
    }

    try {
      setSubmitState('loading');

      // Executing the real backend creation payload
      await createListing(
        {
          sellerId: user.uid,
          sellerEmail: user.email,
          title: title.trim(),
          description: desc.trim(),
          price: Number(price),
          category: selCat,
          condition: selCond,
        },
        images // Passing real binary data files to Firebase pipeline
      );

      setSubmitState('success');

      // Complete reset configuration
      setTitle('');
      setDesc('');
      setPrice('');
      setImages([]);
      setPreviews([]);
      setSelCat('books');
      setSelCond('good');

      setTimeout(() => {
        router.push('/marketplace');
      }, 1200);

    } catch (err) {
      console.error(err);
      setSubmitState('idle');
      setErrorMsg(err.message || 'Failed to publish listing.');
    }
  };

  // Scroll error bar into view if active
  useEffect(() => {
    if (errorMsg && errorBarRef.current) {
      errorBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [errorMsg]);

  // Cleanup object URLs when component unmounts to prevent memory degradation
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="page">
      {/* FontAwesome integration for Next.js */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      {/* ═══ LEFT PANEL ═══ */}
      <div className="left">
        <button type="button" className="back-btn" onClick={() => router.push('/marketplace')}>
          <i className="fa-solid fa-arrow-left"></i> Back to Marketplace
        </button>

        <p className="eyebrow">New Listing</p>
        <h1>Sell something<br /><em>amazing.</em></h1>
        <p className="subtitle">Fill in the details below — your anonymous identity stays hidden from buyers at all times.</p>

        {/* Progress Strip */}
        <div className="step-strip">
          {steps.map((done, i) => {
            const isActive = !done && steps.slice(0, i).every(Boolean);
            const pillClassName = `step-pill ${done ? 'done' : isActive ? 'active' : ''}`;
            return <div key={i} className={pillClassName} />;
          })}
        </div>

        {/* Title */}
        <div className="field">
          <div className="field-header">
            <label className="field-label" htmlFor="inp-title">
              Title <span style={{ color: 'var(--pink)' }}>*</span>
            </label>
            <span className="char-count">{title.length} / 80</span>
          </div>
          <input
            id="inp-title"
            className="input-field"
            type="text"
            maxLength={80}
            placeholder="e.g. Engineering Mathematics Vol. II"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="field">
          <div className="field-header">
            <label className="field-label" htmlFor="inp-desc">
              Description <span style={{ color: 'var(--pink)' }}>*</span>
            </label>
            <span className="char-count">{desc.length} / 500</span>
          </div>
          <textarea
            id="inp-desc"
            className="input-field"
            maxLength={500}
            placeholder="Describe the item, included accessories, any defects…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>

        <div className="divider"></div>

        {/* Category Grid */}
        <p className="section-label">Category</p>
        <div className="cat-grid">
          {Object.keys(CAT_LABELS).map((cat) => (
            <button
              type="button"
              key={cat}
              className={`cat-btn ${selCat === cat ? 'active' : ''}`}
              onClick={() => setSelCat(cat)}
            >
              <span className="cat-icon">{CAT_EMOJIS[cat]}</span>
              <span className="cat-name">{CAT_LABELS[cat]}</span>
            </button>
          ))}
        </div>

        <div className="divider"></div>

        {/* Condition Grid */}
        <p className="section-label">Condition</p>
        <div className="cond-grid">
          {Object.entries(COND_INFO).map(([key, info]) => {
            const isActive = selCond === key;
            return (
              <button
                type="button"
                key={key}
                className={`cond-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelCond(key)}
                style={
                  isActive
                    ? { borderColor: info.dot, boxShadow: `0 0 0 3px ${info.dot}22, 0 8px 20px ${info.dot}18` }
                    : {}
                }
              >
                <span className="cond-dot" style={{ background: info.dot }}></span>
                <span className="cond-name">{info.label}</span>
              </button>
            );
          })}
        </div>

        <div className="divider"></div>

        {/* Photos Upload Grid */}
        <p className="section-label">Photos</p>
        <div className="img-grid">
          <label className="img-slot" style={{ cursor: images.length >= 6 ? 'not-allowed' : 'pointer', opacity: images.length >= 6 ? 0.5 : 1 }}>
            <i className="fa-regular fa-image"></i>
            <span className="upload-label">Upload</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
              disabled={images.length >= 6}
            />
          </label>

          {/* Render real filled slots with actual preview object blobs */}
          {previews.slice(0, 5).map((src, i) => (
            <div key={`filled-${i}`} className="img-slot filled" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <span className="img-num">{i + 1}</span>
              <div className="img-badge" onClick={(e) => removeImg(i, e)}>
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>
          ))}

          {/* Render empty placeholders dynamically mapped to image arrays */}
          {Array.from({ length: Math.max(0, 3 - Math.min(images.length, 5)) }).map((_, i) => {
            const visualIndex = Math.min(images.length, 5) + i + 1;
            return (
              <div
                key={`empty-${i}`}
                className="img-slot"
                style={{ cursor: 'default', opacity: Math.max(0.07, 0.35 - visualIndex * 0.08) }}
              >
                <i className="fa-regular fa-image"></i>
              </div>
            );
          })}
        </div>
        <p className="img-hint">
          <i className="fa-solid fa-circle-info" style={{ marginRight: '5px', color: 'var(--accent)', opacity: 0.6 }}></i>
          PNG, JPG or WEBP · Max 6 images · First image is your cover
        </p>

        <div className="divider"></div>

        {/* Price Input */}
        <p className="section-label">Price</p>
        <div className="price-wrap">
          <span className="price-sym">৳</span>
          <input
            id="inp-price"
            className="price-input"
            type="number"
            min="0"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <p className="img-hint" style={{ marginTop: '8px' }}>Set to 0 for free giveaway</p>

        {/* Dynamic Error Status */}
        {errorMsg && (
          <div ref={errorBarRef} className="error-bar" style={{ display: 'flex' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Actions */}
        <button
          type="button"
          className={`submit-btn ${submitState === 'success' ? 'success' : ''}`}
          disabled={submitState !== 'idle'}
          onClick={handleSubmit}
        >
          {submitState === 'idle' && (
            <>
              <i className="fa-solid fa-rocket" style={{ marginRight: '9px' }}></i>Publish Listing
            </>
          )}
          {submitState === 'loading' && (
            <>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '9px' }}></i>Publishing…
            </>
          )}
          {submitState === 'success' && (
            <>
              <i className="fa-solid fa-check" style={{ marginRight: '9px' }}></i>Listing Published!
            </>
          )}
        </button>
      </div>

      {/* ═══ RIGHT PANEL (LIVE PREVIEW) ═══ */}
      <div className="right">
        <div className="preview-top">
          <span className="preview-label">Live Preview</span>
          <span className="preview-badge">Preview</span>
        </div>

        <div className="anon-badge">
          <div className="anon-avatar">∞</div>
          <div className="anon-text">
            <p>Anonymous Seller</p>
            <p>Your real identity is hidden from all buyers</p>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="card-preview">
          <div className="card-img-row">
            {/* Slot 1 Cover Image Preview logic */}
            <div className="card-img-block b1" style={previews[0] ? { backgroundImage: `url(${previews[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 } : {}}>
              {!previews[0] && (CAT_EMOJIS[selCat] || '📦')}
            </div>
            
            {/* Slot 2 Preview */}
            <div className="card-img-block b2" style={previews[1] ? { backgroundImage: `url(${previews[1]})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 } : {}}>
              {!previews[1] && '📦'}
            </div>
            
            {/* Slot 3 Preview */}
            <div className="card-img-block b3" style={previews[2] ? { backgroundImage: `url(${previews[2]})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 } : {}}>
              {!previews[2] && '✨'}
            </div>
          </div>

          <div className="card-meta">
            <span className={`card-cat-pill cat-pill-${selCat}`}>
              {CAT_EMOJIS[selCat]} {CAT_LABELS[selCat]}
            </span>
            <span className="card-cond-pill">
              <span className="card-cond-dot" style={{ background: COND_INFO[selCond].dot }}></span>
              {COND_INFO[selCond].label}
            </span>
          </div>

          <div className="card-title" style={{ color: title ? 'var(--text)' : 'var(--text-muted)' }}>
            {title.trim() || 'Your listing title…'}
          </div>
          <div className="card-desc" style={{ color: desc ? 'var(--text-sub)' : 'var(--text-muted)' }}>
            {desc.trim() || 'Description will appear here in real time.'}
          </div>

          <div className="card-price-row">
            {price !== '' && Number(price) >= 0 ? (
              <div className="card-price">
                <span className="currency">৳</span>
                {Number(price).toLocaleString('en-BD')}
              </div>
            ) : (
              <div className="card-price-empty">৳ —</div>
            )}
            <button type="button" className="card-action-btn">Contact</button>
          </div>
        </div>

        <div className="tips">
          <div className="tip-item">
            <i className="fa-solid fa-camera-retro"></i>
            <p>Clear photos from multiple angles increase buyer interest by 3×</p>
          </div>
          <div className="tip-item">
            <i className="fa-solid fa-tag"></i>
            <p>Price 10–20% below new value and items sell 2× faster</p>
          </div>
          <div className="tip-item">
            <i className="fa-solid fa-align-left"></i>
            <p>Mention edition, year, and included extras in your description</p>
          </div>
          <div className="tip-item">
            <i className="fa-solid fa-shield-halved"></i>
            <p>Your email stays hidden — buyers reach you through our encrypted system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
