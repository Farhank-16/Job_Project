import React, { useState, useEffect } from 'react';
import { Search, MapPin, Eye, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/Skeleton';

const AdminJobs = () => {
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, pagination.page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllJobs({
        search,
        status: statusFilter,
        page:   pagination.page,
        limit:  10,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
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
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="px-4 py-4">
        {!loading && (
          <p className="text-sm text-gray-500 mb-3">{pagination.total} jobs found</p>
        )}

        {loading ? (
          <SkeletonList count={5} />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.employer_name}</p>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.city}
                    </p>
                  </div>
                  <Badge variant={job.is_active ? 'success' : 'default'}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {job.applications_count || 0}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {job.views_count || 0}
                  </span>
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>

                {job.skill_name && (
                  <Badge variant="primary" size="xs" className="mt-2">
                    {job.skill_name}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;