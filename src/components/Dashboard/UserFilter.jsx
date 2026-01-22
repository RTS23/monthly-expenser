import React from 'react';
import { Users } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const UserFilter = ({ users, selectedUser, onSelectUser }) => {
    const { t } = useSettings();

    return (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            <button
                onClick={() => onSelectUser(null)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
          ${!selectedUser
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }
        `}
            >
                <Users size={16} />
                <span>{t('filters.allUsers')}</span>
            </button>

            {users.map(user => (
                <button
                    key={user}
                    onClick={() => onSelectUser(user)}
                    className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${selectedUser === user
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }
          `}
                >
                    @{user}
                </button>
            ))}
        </div>
    );
};

export default UserFilter;
