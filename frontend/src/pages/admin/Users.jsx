import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const ROLE_STYLE = {
  job_seeker: { bg: '#eff6ff', color: '#1d4ed8', label: 'Job Seeker' },
  employer:   { bg: '#faf5ff', color: '#7e22ce', label: 'Employer' },
  admin:      { bg: '#fff1f2', color: '#be123c', label: 'Admin' },
};

const SUB_STYLE = {
  active:   { bg: '#f0fdf4', color: '#15803d', label: 'Premium' },
  inactive: { bg: '#f1f5f9', color: '#64748b', label: 'Free' },
  expired:  { bg: '#fff1f2', color: '#be123c', label: 'Expired' },
};

const NameAvatar = ({ name }) => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0"
    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
    {name?.charAt(0).toUpperCase() || '?'}
  </div>
);

const AdminUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { loadUsers(); }, [search, role, pagination.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search, role, page: pagination.page, limit: 20 });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await adminService.updateUserStatus(id, { isActive: !isActive });
      setUsers(p => p.map(u => u.id === id ? { ...u, is_active: !isActive } : u));
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update'); }
  };

  const toggleVerified = async (id, isVerified) => {
    try {
      await adminService.updateUserStatus(id, { isVerified: !isVerified });
      setUsers(p => p.map(u => u.id === id ? { ...u, is_verified: !isVerified } : u));
      toast.success(`User ${isVerified ? 'unverified' : 'verified'}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Filters */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input pl-9 py-2.5 text-sm"
            style={{ borderRadius: '10px' }} />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)}
          className="input w-full py-2.5 text-sm" style={{ borderRadius: '10px' }}>
          <option value="">All Roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="employer">Employers</option>
        </select>
      </div>

      <div className="px-4 py-4">
        {!loading && (
          <p className="text-xs text-slate-500 mb-3 font-medium">{pagination.total} users</p>
        )}

        {loading ? <SkeletonList count={5} /> : (
          <div className="space-y-3">
            {users.map(user => {
              const rolePill = ROLE_STYLE[user.role]   || ROLE_STYLE.job_seeker;
              const subPill  = SUB_STYLE[user.subscription_status] || SUB_STYLE.inactive;

              return (
                <div key={user.id} className="card-elevated p-4">
                  {/* User info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <NameAvatar name={user.name} />
                      {user.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display font-bold text-slate-900 text-sm truncate">
                          {user.name || 'No name'}
                        </p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: user.is_active ? '#f0fdf4' : '#fff1f2',
                            color: user.is_active ? '#15803d' : '#be123c' }}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{user.mobile}</p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: rolePill.bg, color: rolePill.color }}>
                          {rolePill.label}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: subPill.bg, color: subPill.color }}>
                          {subPill.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(user.id, user.is_active)}
                      className="btn-secondary flex-1 py-2 text-xs" style={{ borderRadius: '8px' }}>
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => toggleVerified(user.id, user.is_verified)}
                      className="btn-secondary flex-1 py-2 text-xs" style={{ borderRadius: '8px' }}>
                      {user.is_verified ? 'Unverify' : 'Verify ✓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <button disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40" style={{ borderRadius: '10px' }}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-slate-500 font-medium">
              {pagination.page} / {pagination.pages}
            </span>
            <button disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40" style={{ borderRadius: '10px' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;