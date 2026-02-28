import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { SkeletonList } from '../../components/ui/Skeleton';

const STATUS_STYLE = {
  completed: { bg: '#f0fdf4', color: '#15803d', label: 'Completed' },
  pending:   { bg: '#fefce8', color: '#92400e', label: 'Pending' },
  failed:    { bg: '#fff1f2', color: '#be123c', label: 'Failed' },
  created:   { bg: '#f1f5f9', color: '#475569', label: 'Created' },
};

const TYPE_STYLE = {
  subscription:   { bg: '#faf5ff', color: '#7e22ce', label: 'Subscription' },
  skill_exam:     { bg: '#fffbeb', color: '#92400e', label: 'Exam' },
  verified_badge: { bg: '#eff6ff', color: '#1d4ed8', label: 'Badge' },
};

const Pill = ({ styles, label }) => (
  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
    style={{ background: styles?.bg || '#f1f5f9', color: styles?.color || '#475569' }}>
    {styles?.label || label}
  </span>
);

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');
  const [type, setType]         = useState('');

  useEffect(() => { loadPayments(); }, [status, type]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments({ status, type });
      setPayments(data.payments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const total = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Filters */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="flex gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="input flex-1 py-2.5 text-sm" style={{ borderRadius: '10px' }}>
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select value={type} onChange={e => setType(e.target.value)}
            className="input flex-1 py-2.5 text-sm" style={{ borderRadius: '10px' }}>
            <option value="">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="skill_exam">Exam</option>
            <option value="verified_badge">Badge</option>
          </select>
        </div>
      </div>

      <div className="px-4 py-4">

        {/* Revenue summary */}
        {!loading && (
          <div className="card-elevated p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Showing Revenue</p>
              <p className="font-display text-xl font-extrabold text-slate-900 mt-0.5">
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
            <span className="text-xs text-slate-400">{payments.length} transactions</span>
          </div>
        )}

        {loading ? <SkeletonList count={8} /> : (
          <div className="space-y-3">
            {payments.map(payment => (
              <div key={payment.id} className="card-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-slate-900 text-sm">
                      {payment.user_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{payment.user_mobile}</p>
                  </div>
                  <p className="font-display font-extrabold text-slate-900 flex-shrink-0">
                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Pill styles={TYPE_STYLE[payment.payment_type]} />
                  <Pill styles={STATUS_STYLE[payment.status]} />
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(payment.created_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                {payment.razorpay_payment_id && (
                  <p className="text-xs text-slate-300 mt-2 font-mono truncate">
                    {payment.razorpay_payment_id}
                  </p>
                )}
              </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-12">
                <p className="font-display font-bold text-slate-700">No payments found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;