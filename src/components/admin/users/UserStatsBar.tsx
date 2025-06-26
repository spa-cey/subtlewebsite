import React from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';

interface UserStatsBarProps {
  stats: {
    total: number;
    activeToday: number;
    newThisWeek: number;
  };
}

export default function UserStatsBar({ stats }: UserStatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {stats.total.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Today
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {stats.activeToday.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  New This Week
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {stats.newThisWeek.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}