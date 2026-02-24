import React, { useState, useEffect } from 'react';
import { Search, User, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, pagination.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search,
        role: roleFilter,
        page: pagination.page,
        limit: 20,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await adminService.updateUserStatus(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: !isActive } : u
      ));
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleToggleVerified = async (userId, isVerified) => {
    try {
      await adminService.updateUserStatus(userId, { isVerified: !isVerified });
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_verified: !isVerified } : u
      ));
      toast.success(`User ${isVerified ? 'unverified' : 'verified'}`);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search & Filter */}
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="employer">Employers</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="px-4 py-4">
        {loading ? (
          <SkeletonList count={5} />
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{user.name || 'No name'}</h3>
                        {user.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-sm text-gray-500">{user.mobile}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge size="xs">{user.role}</Badge>
                        <Badge 
                          size="xs" 
                          variant={user.subscription_status === 'active' ? 'success' : 'default'}
                        >
                          {user.subscription_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    fullWidth
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    fullWidth
                    onClick={() => handleToggleVerified(user.id, user.is_verified)}
                  >
                    {user.is_verified ? 'Remove Verify' : 'Verify'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;