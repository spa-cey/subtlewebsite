import React, { useState } from 'react';
import { UserFilters, SubscriptionTier, UserRole } from '@/types/admin';
import { Search, Filter, Download, X } from 'lucide-react';

interface UserFiltersBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onExport: () => void;
}

export default function UserFiltersBar({ filters, onFiltersChange, onExport }: UserFiltersBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof UserFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      role: 'all',
      subscription: 'all',
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key as keyof UserFilters] && filters[key as keyof UserFilters] !== 'all'
  ).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email, name, or user ID..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            data-search-input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 relative"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Filter Users</h3>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Subscription Tier Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Tier
                  </label>
                  <select
                    value={filters.subscription || 'all'}
                    onChange={(e) => handleFilterChange('subscription', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={filters.role || 'all'}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="user">User</option>
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDateRange = { ...filters.dateRange };
                        newDateRange.from = e.target.value ? new Date(e.target.value) : null;
                        onFiltersChange({ ...filters, dateRange: newDateRange });
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const newDateRange = { ...filters.dateRange };
                        newDateRange.to = e.target.value ? new Date(e.target.value) : null;
                        onFiltersChange({ ...filters, dateRange: newDateRange });
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>


                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          <div className="flex items-center space-x-2">
            {filters.status && filters.status !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => clearFilter('status')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.subscription && filters.subscription !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tier: {filters.subscription}
                <button
                  onClick={() => clearFilter('subscription')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.role && filters.role !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Role: {filters.role}
                <button
                  onClick={() => clearFilter('role')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}