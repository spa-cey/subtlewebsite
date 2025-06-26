import React, { useState } from 'react';
import { UserCircle, Mail, Download, Trash2, X, ChevronDown } from 'lucide-react';
import { SubscriptionTier } from '@/types/admin';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string, payload?: any) => void;
  onClear: () => void;
}

export default function BulkActionsBar({ selectedCount, onAction, onClear }: BulkActionsBarProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showTierMenu, setShowTierMenu] = useState(false);

  const handleDelete = () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    onAction('delete');
    setShowConfirmDelete(false);
  };

  const handleChangeTier = (tier: SubscriptionTier) => {
    onAction('change_tier', { tier });
    setShowTierMenu(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-blue-900 font-medium">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAction('activate')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Activate
            </button>
            
            <button
              onClick={() => onAction('deactivate')}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
            >
              Deactivate
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowTierMenu(!showTierMenu)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Change Tier</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showTierMenu && (
                <div className="absolute top-full mt-1 right-0 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => handleChangeTier('free')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleChangeTier('pro')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Pro
                  </button>
                  <button
                    onClick={() => handleChangeTier('enterprise')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Enterprise
                  </button>
                  <button
                    onClick={() => handleChangeTier('custom')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Custom
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onAction('export')}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={() => onAction('email')}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium flex items-center space-x-1"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </button>

            <button
              onClick={handleDelete}
              className={`px-3 py-1.5 ${
                showConfirmDelete ? 'bg-red-700' : 'bg-red-600'
              } text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center space-x-1`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{showConfirmDelete ? 'Click again to confirm' : 'Delete'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            onClear();
            setShowConfirmDelete(false);
            setShowTierMenu(false);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}