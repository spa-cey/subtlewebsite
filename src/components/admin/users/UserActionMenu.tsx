'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, ROLE_PERMISSIONS } from '@/types/admin';
import { MoreVertical, Eye, Edit, Key, UserCheck, Ban, Trash2, FileText, LogIn } from 'lucide-react';
import { useImpersonateUser, useResetPassword, useUpdateUser } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface UserActionMenuProps {
  user: User;
  onDelete: (userId: string) => void;
}

export default function UserActionMenu({ user, onDelete }: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const impersonateUser = useImpersonateUser();
  const resetPassword = useResetPassword();
  const updateUser = useUpdateUser();

  // Get current admin's role to check permissions
  const [currentUserRole, setCurrentUserRole] = React.useState<string>('admin');
  
  React.useEffect(() => {
    apiClient.getCurrentUser().then((user) => {
      if (user) {
        // Set role based on subscription tier or actual role field
        setCurrentUserRole(user.subscriptionTier === 'admin' ? 'admin' : 'viewer');
      }
    }).catch(() => {
      setCurrentUserRole('viewer'); // Default fallback
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const permissions = ROLE_PERMISSIONS[currentUserRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.admin;

  const handleImpersonate = async () => {
    if (!permissions.includes('impersonate_users')) {
      alert('You do not have permission to impersonate users');
      return;
    }

    try {
      await impersonateUser.mutateAsync(user.id);
      alert('Impersonation session started in new tab');
    } catch (error) {
      alert('Failed to impersonate user');
    }
    setIsOpen(false);
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(user.email);
      alert('Password reset email sent');
    } catch (error) {
      alert('Failed to send password reset email');
    }
    setIsOpen(false);
  };

  const handleToggleStatus = async () => {
    if (!permissions.includes('edit_users')) {
      alert('You do not have permission to edit users');
      return;
    }

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        updates: { status: user.status === 'active' ? 'suspended' : 'active' }
      });
      alert(`User ${user.status === 'active' ? 'suspended' : 'activated'}`);
    } catch (error) {
      alert('Failed to update user status');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <button
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              <Eye className="w-4 h-4" />
              <span>View Profile</span>
            </button>

            {permissions.includes('edit_users') && (
              <button
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleResetPassword}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              <Key className="w-4 h-4" />
              <span>Reset Password</span>
            </button>

            {permissions.includes('impersonate_users') && (
              <button
                onClick={handleImpersonate}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
              >
                <LogIn className="w-4 h-4" />
                <span>Impersonate User</span>
              </button>
            )}

            <div className="border-t border-gray-100"></div>

            <button
              onClick={handleToggleStatus}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              {user.status === 'active' ? (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Suspend Account</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Activate Account</span>
                </>
              )}
            </button>

            <button
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              <FileText className="w-4 h-4" />
              <span>Add Note</span>
            </button>

            {permissions.includes('delete_users') && (
              <>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    onDelete(user.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete User</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}