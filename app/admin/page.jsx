'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc, getDoc, collection, getDocs, query, orderBy,
  updateDoc, deleteDoc, serverTimestamp, where, limit, startAfter,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

const fmt = (n) => Number(n || 0).toLocaleString();
const timeAgo = (ts) => {
  if (!ts) return '—';
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const SECTIONS = ['Overview', 'Listings', 'Users', 'Interests'];
function StatCard({ label, value, icon, accent, sub }) {
  return (
    <div style={{
      background: '#111024',
      border: `1px solid ${accent}22`,
      borderRadius: '20px',
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '40px', fontWeight: 800, color: '#f4f2ff', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: '#6b7280' }}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, count, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f4f2ff' }}>
        {title} {count != null && <span style={{ color: '#6b7280', fontSize: '16px' }}>({fmt(count)})</span>}
      </h2>
      {action}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // data
  const [stats, setStats] = useState({ users: 0, listings: 0, interests: 0, deleted: 0 });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [interests, setInterests] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // ui state
  const [activeSection, setActiveSection] = useState('Overview');
  const [listingFilter, setListingFilter] = useState('all');   // all | active | deleted
  const [userSearch, setUserSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);   // { message, onConfirm }


  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }

    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists() && snap.data().isAdmin === true) {
        setIsAdmin(true);
      } else {
        router.replace('/marketplace');
      }
    }).catch(() => router.replace('/marketplace'))
      .finally(() => setChecking(false));
  }, [user, loading, router]);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [usersSnap, listingsSnap, interestsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'interests'), orderBy('createdAt', 'desc'))),
      ]);

      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const listingsData = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const interestsData = interestsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const userMap = Object.fromEntries(usersData.map(u => [u.id, u]));
      const listingMap = Object.fromEntries(listingsData.map(l => [l.id, l]));
      const enrichedInterests = interestsData.map(i => ({
        ...i,
        listingTitle: listingMap[i.listingId]?.title || '—',
        buyerName: userMap[i.buyerId]?.anonName || i.buyerId?.slice(0, 6),
        sellerName: userMap[i.sellerId]?.anonName || i.sellerId?.slice(0, 6),
      }));

      const activeListings = listingsData.filter(l => l.status === 'active').length;
      const deletedListings = listingsData.filter(l => l.isDeleted || l.status === 'deleted').length;

      setUsers(usersData);
      setListings(listingsData);
      setInterests(enrichedInterests);
      setStats({
        users: usersData.length,
        listings: activeListings,
        interests: interestsData.length,
        deleted: deletedListings,
      });
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirm = (message, onConfirm) => setConfirmModal({ message, onConfirm });

  async function adminDeleteListing(id) {
    confirm('Permanently delete this listing? This cannot be undone.', async () => {
      try {
        await updateDoc(doc(db, 'listings', id), {
          isDeleted: true, status: 'deleted', deletedAt: serverTimestamp(),
          deletedBy: 'admin',
        });
        showToast('Listing deleted');
        loadData();
      } catch { showToast('Failed to delete', 'error'); }
    });
  }

  async function adminRestoreListing(id) {
    try {
      await updateDoc(doc(db, 'listings', id), { isDeleted: false, status: 'active', deletedAt: null, deletedBy: null });
      showToast('Listing restored');
      loadData();
    } catch { showToast('Failed to restore', 'error'); }
  }

  async function adminToggleAdmin(uid, current) {
    confirm(`${current ? 'Remove' : 'Grant'} admin access for this user?`, async () => {
      try {
        await updateDoc(doc(db, 'users', uid), { isAdmin: !current });
        showToast(`Admin ${current ? 'revoked' : 'granted'}`);
        loadData();
      } catch { showToast('Failed', 'error'); }
    });
  }

  async function adminDeleteUser(uid) {
    confirm('This will delete the user\'s Firestore data and all their listings. The Firebase Auth account must be removed separately via Firebase Console.', async () => {
      try {
   
        const listingsQ = query(collection(db, 'listings'), where('sellerId', '==', uid));
        const listingsSnap = await getDocs(listingsQ);
        await Promise.all(listingsSnap.docs.map(d => deleteDoc(d.ref)));

        const interestsQ = query(collection(db, 'interests'), where('buyerId', '==', uid));
        const interestsSnap = await getDocs(interestsQ);
        await Promise.all(interestsSnap.docs.map(d => deleteDoc(d.ref)));

       
        const sellerInterestsQ = query(collection(db, 'interests'), where('sellerId', '==', uid));
        const sellerInterestsSnap = await getDocs(sellerInterestsQ);
        await Promise.all(sellerInterestsSnap.docs.map(d => deleteDoc(d.ref)));

        await deleteDoc(doc(db, 'users', uid));

        showToast('User data deleted. Remove Auth account in Firebase Console.');
        loadData();
      } catch (err) {
        console.error('adminDeleteUser error:', err);
        showToast('Failed to delete user data', 'error');
      }
    });
  }
  const filteredListings = listings.filter(l => {
    if (listingFilter === 'active') return l.status === 'active' && !l.isDeleted;
    if (listingFilter === 'deleted') return l.isDeleted || l.status === 'deleted';
    return true;
  });

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.anonName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading || checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0914', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
          <p style={{ color: '#6b7280' }}>Checking admin permissions…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;
  const s = {
    page: { minHeight: '100vh', background: '#0a0914', color: '#fff', display: 'flex' },
    sidebar: {
      width: '220px', flexShrink: 0,
      background: '#0d0b1e',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      padding: '32px 16px',
      position: 'sticky', top: 0, height: '100vh',
    },
    sidebarBrand: { fontSize: '20px', fontWeight: 800, color: '#f4f2ff', marginBottom: '8px', padding: '0 8px' },
    sidebarSub: { fontSize: '11px', color: '#6b7280', padding: '0 8px', marginBottom: '32px' },
    navBtn: (active) => ({
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px', borderRadius: '12px', border: 'none',
      width: '100%', textAlign: 'left', cursor: 'pointer',
      fontWeight: active ? 700 : 500, fontSize: '14px',
      background: active ? 'rgba(124,106,247,0.18)' : 'transparent',
      color: active ? '#a78bfa' : '#9ca3af',
      transition: 'all 0.15s',
      marginBottom: '4px',
    }),
    main: { flex: 1, padding: '40px 48px', overflowY: 'auto' },
    table: {
      width: '100%', borderCollapse: 'separate', borderSpacing: 0,
      fontSize: '13px',
    },
    th: {
      textAlign: 'left', padding: '10px 14px',
      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
      color: '#6b7280', background: '#111024',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    td: {
      padding: '12px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      color: '#d1d5db', verticalAlign: 'middle',
    },
    badge: (color) => ({
      display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700,
      background: `${color}22`, color: color,
      border: `1px solid ${color}44`,
    }),
    actionBtn: (color) => ({
      padding: '4px 10px', borderRadius: '8px', border: 'none',
      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
      background: `${color}22`, color: color,
      transition: 'background 0.15s',
    }),
    filterPill: (active) => ({
      padding: '6px 16px', borderRadius: '999px', border: `1px solid ${active ? '#7c6af7' : 'rgba(255,255,255,0.1)'}`,
      background: active ? 'rgba(124,106,247,0.18)' : 'transparent',
      color: active ? '#a78bfa' : '#6b7280',
      fontSize: '13px', fontWeight: active ? 700 : 500, cursor: 'pointer',
    }),
  };

  const NAV_ICONS = { Overview: '📊', Listings: '🏷️', Users: '👥', Interests: '💬' };

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
          background: toast.type === 'error' ? '#ef4444' : '#10b981', color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{ background: '#111024', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '36px', maxWidth: '400px', width: '90%' }}>
            <p style={{ fontSize: '16px', color: '#f4f2ff', marginBottom: '24px', lineHeight: 1.5 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={{ ...s.actionBtn('#6b7280'), padding: '8px 18px', fontSize: '13px' }} onClick={() => setConfirmModal(null)}>Cancel</button>
              <button style={{ ...s.actionBtn('#ef4444'), padding: '8px 18px', fontSize: '13px', background: '#ef444422' }} onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarBrand}>⚡ Admin</div>
        <div style={s.sidebarSub}>CampusXchange</div>
        <nav>
          {SECTIONS.map(sec => (
            <button key={sec} style={s.navBtn(activeSection === sec)} onClick={() => setActiveSection(sec)}>
              <span>{NAV_ICONS[sec]}</span> {sec}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={{ ...s.navBtn(false), color: '#6b7280' }} onClick={() => router.push('/marketplace')}>
            ← Back to App
          </button>
          {dataLoading && <p style={{ fontSize: '11px', color: '#6b7280', padding: '8px', textAlign: 'center' }}>Refreshing…</p>}
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f4f2ff' }}>{activeSection}</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              {activeSection === 'Overview' && 'Platform at a glance'}
              {activeSection === 'Listings' && 'All marketplace listings'}
              {activeSection === 'Users' && 'Registered users'}
              {activeSection === 'Interests' && 'Buy interest requests'}
            </p>
          </div>
          <button
            onClick={loadData}
            style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {activeSection === 'Overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard label="Users" value={fmt(stats.users)} icon="👥" accent="#a78bfa" sub="Registered accounts" />
              <StatCard label="Active Listings" value={fmt(stats.listings)} icon="🏷️" accent="#34d399" sub="On marketplace" />
              <StatCard label="Interests" value={fmt(stats.interests)} icon="💬" accent="#60a5fa" sub="Buy requests sent" />
              <StatCard label="Deleted" value={fmt(stats.deleted)} icon="🗑️" accent="#f87171" sub="Removed listings" />
            </div>

            {/* Recent listings preview */}
            <SectionHeader title="Recent Listings" action={
              <button style={s.filterPill(false)} onClick={() => setActiveSection('Listings')}>View all →</button>
            } />
            <div style={{ background: '#111024', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Title', 'Category', 'Price', 'Status', 'Created'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {listings.slice(0, 8).map(l => (
                    <tr key={l.id} style={{ transition: 'background 0.1s' }}>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#f4f2ff' }}>{l.title}</span></td>
                      <td style={s.td}>{l.category}</td>
                      <td style={s.td}>৳{fmt(l.price)}</td>
                      <td style={s.td}>
                        <span style={s.badge(l.isDeleted || l.status === 'deleted' ? '#f87171' : '#34d399')}>
                          {l.isDeleted || l.status === 'deleted' ? 'Deleted' : 'Active'}
                        </span>
                      </td>
                      <td style={s.td}>{timeAgo(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── LISTINGS ── */}
        {activeSection === 'Listings' && (
          <>
            <SectionHeader title="Listings" count={filteredListings.length} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['all', 'active', 'deleted'].map(f => (
                <button key={f} style={s.filterPill(listingFilter === f)} onClick={() => setListingFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ background: '#111024', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Title', 'Category', 'Condition', 'Price', 'Status', 'Created', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#6b7280', padding: '40px' }}>No listings found</td></tr>
                  ) : filteredListings.map(l => {
                    const isDeleted = l.isDeleted || l.status === 'deleted';
                    return (
                      <tr key={l.id}>
                        <td style={s.td}>
                          <span style={{ fontWeight: 600, color: isDeleted ? '#6b7280' : '#f4f2ff', textDecoration: isDeleted ? 'line-through' : 'none' }}>
                            {l.title}
                          </span>
                        </td>
                        <td style={s.td}>{l.category}</td>
                        <td style={s.td}>{l.condition}</td>
                        <td style={s.td}>৳{fmt(l.price)}</td>
                        <td style={s.td}>
                          <span style={s.badge(isDeleted ? '#f87171' : '#34d399')}>
                            {isDeleted ? 'Deleted' : 'Active'}
                          </span>
                        </td>
                        <td style={s.td}>{timeAgo(l.createdAt)}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {!isDeleted ? (
                              <button style={s.actionBtn('#f87171')} onClick={() => adminDeleteListing(l.id)}>Delete</button>
                            ) : (
                              <button style={s.actionBtn('#34d399')} onClick={() => adminRestoreListing(l.id)}>Restore</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {activeSection === 'Users' && (
          <>
            <SectionHeader title="Users" count={filteredUsers.length} />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{
                width: '100%', maxWidth: '360px', marginBottom: '20px',
                padding: '10px 16px', borderRadius: '12px',
                background: '#111024', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f4f2ff', fontSize: '14px', outline: 'none',
              }}
            />
            <div style={{ background: '#111024', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Avatar', 'Name', 'Email', 'Role', 'Verified', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#6b7280', padding: '40px' }}>No users found</td></tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}><span style={{ fontSize: '24px' }}>{u.anonAvatar || '🦊'}</span></td>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#f4f2ff' }}>{u.anonName || '—'}</span></td>
                      <td style={s.td}><span style={{ color: '#9ca3af' }}>{u.email || '—'}</span></td>
                      <td style={s.td}>
                        <span style={s.badge(u.isAdmin ? '#f59e0b' : '#6b7280')}>
                          {u.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(u.emailVerified ? '#34d399' : '#f87171')}>
                          {u.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {u.id !== user.uid && (
                            <>
                              <button style={s.actionBtn(u.isAdmin ? '#f59e0b' : '#a78bfa')} onClick={() => adminToggleAdmin(u.id, u.isAdmin)}>
                                {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                              <button style={{...s.actionBtn('#f87171'), fontSize:'11px'}} onClick={() => adminDeleteUser(u.id)} title="Deletes Firestore data only. Remove Auth account in Firebase Console.">Delete data ⚠</button>
                            </>
                          )}
                          {u.id === user.uid && <span style={{ color: '#6b7280', fontSize: '12px' }}>You</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── INTERESTS ── */}
        {activeSection === 'Interests' && (
          <>
            <SectionHeader title="Buy Interests" count={interests.length} />
            <div style={{ background: '#111024', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Listing', 'Buyer', 'Seller', 'Status', 'Sent'].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {interests.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#6b7280', padding: '40px' }}>No interests yet</td></tr>
                  ) : interests.map(i => (
                    <tr key={i.id}>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#f4f2ff' }}>{i.listingTitle}</span></td>
                      <td style={s.td}>{i.buyerName}</td>
                      <td style={s.td}>{i.sellerName}</td>
                      <td style={s.td}>
                        <span style={s.badge(i.status === 'accepted' ? '#34d399' : i.status === 'rejected' ? '#f87171' : '#60a5fa')}>
                          {i.status || 'pending'}
                        </span>
                      </td>
                      <td style={s.td}>{timeAgo(i.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
