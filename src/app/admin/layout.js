import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminRootLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D3250] to-[#232946] text-white">
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
} 