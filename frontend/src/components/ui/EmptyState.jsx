import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search or filters',
  action,
  actionLabel = 'Clear Filters',
}) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-slate-400" />
    </div>
    <h3 className="font-display font-bold text-slate-800 text-base mb-1">{title}</h3>
    <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
    {action && (
      <Button variant="secondary" onClick={action}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;