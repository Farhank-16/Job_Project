import React, { useState, useEffect } from 'react';
import { CreditCard, Filter } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadPayments();
  }, [statusFilter, typeFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments({
        status: statusFilter,
        type: typeFilter,
      });
      setPayments(data.payments);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { variant: 'success', label: 'Completed' },
      pending: { variant: 'warning', label: 'Pending' },
      failed: { variant: 'danger', label: 'Failed' },
      created: { variant: 'default', label: 'Created' },
    };
    const c = config[status] || { variant: 'default', label: status };
    return <Badge variant={c.variant} size="xs">{c.label}</Badge>;
  };

  const getTypeBadge = (type) => {
    const config = {
      subscription: { variant: 'primary', label: 'Subscription' },
      skill_exam: { variant: 'info', label: 'Exam' },
      verified_badge: { variant: 'success', label: 'Badge' },
    };
    const c = config[type] || { variant: 'default', label: type };
    return <Badge variant={c.variant} size="xs">{c.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3 space-y-3">
        <h2 className="font-semibold text-gray-900">Payments</h2>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="skill_exam">Exam</option>
            <option value="verified_badge">Badge</option>
          </select>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <SkeletonList count={10} />
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{payment.user_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{payment.user_mobile}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{payment.amount}</p>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  {getTypeBadge(payment.payment_type)}
                  {getStatusBadge(payment.status)}
                  <span className="text-xs text-gray-400">
                    {new Date(payment.created_at).toLocaleString()}
                  </span>
                </div>

                {payment.razorpay_payment_id && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    ID: {payment.razorpay_payment_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;