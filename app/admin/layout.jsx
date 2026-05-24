export const metadata = {
  title: 'CampusXchange Admin',
  description: 'Admin Panel',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0a0914] text-white">
      {/* Sidebar will be handled inside page.jsx for now */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
