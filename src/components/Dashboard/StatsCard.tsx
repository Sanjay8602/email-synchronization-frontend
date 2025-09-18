'use client';

import React from 'react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
}) => {
  return (
    <div className={cn('bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-200', className)}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && <Icon className="h-8 w-8 text-blue-500" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-semibold text-gray-600 truncate uppercase tracking-wide">
                {title}
              </dt>
              <dd className="flex items-baseline mt-2">
                <div className="text-3xl font-bold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div
                    className={cn(
                      'ml-3 flex items-baseline text-sm font-semibold px-2 py-1 rounded-full',
                      change.type === 'increase' && 'text-green-700 bg-green-100',
                      change.type === 'decrease' && 'text-red-700 bg-red-100',
                      change.type === 'neutral' && 'text-gray-600 bg-gray-100'
                    )}
                  >
                    {change.type === 'increase' && '+'}
                    {change.value}
                    {change.type === 'increase' && '%'}
                    {change.type === 'decrease' && '%'}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
