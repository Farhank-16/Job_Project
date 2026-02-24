import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search or filters',
  action,
  actionLabel = 'Take action'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;