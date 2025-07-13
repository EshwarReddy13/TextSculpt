'use client';

import React from 'react';
import { User, Plus } from 'phosphor-react';
import { EditorUser } from '../types';

interface UserPresenceProps {
  users: EditorUser[];
  onInvite: () => void;
}

const UserAvatar = ({ user, index }: { user: EditorUser; index: number }) => {
  // A simple color hashing function for demonstration purposes
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[hash % colors.length];
  };

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      key={user.id}
      className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full ring-2 ring-white dark:ring-gray-800 ${getAvatarColor(user.id)}`}
      style={{ zIndex: 10 - index, marginLeft: index > 0 ? '-16px' : '0' }}
      title={user.name}
    >
      <span className="font-medium text-white">{nameInitial}</span>
    </div>
  );
};


export const UserPresence = ({ users, onInvite }: UserPresenceProps) => {
  const displayedUsers = users.slice(0, 3); // Show max 3 avatars
  const remainingCount = users.length > 3 ? users.length - 3 : 0;

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {displayedUsers.map((user, index) => (
          <UserAvatar key={user.id} user={user} index={index} />
        ))}

        {remainingCount > 0 && (
          <div 
            className="relative flex items-center justify-center w-10 h-10 text-xs font-bold text-gray-800 bg-gray-200 border-2 border-white rounded-full -ml-4 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
            style={{ zIndex: 1 }}
            title={`${remainingCount} more user(s)`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      <button
        onClick={onInvite}
        className="ml-4 flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        aria-label="Invite users"
        title="Invite users"
      >
        <Plus size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}; 