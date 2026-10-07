import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { initials } from '@/shared/utils';

/** Avatar utilisateur */
export function UserAvatar({ user, name, className = 'h-8 w-8', fallbackClassName = 'bg-primary-100 text-primary-800', src }) {
  const [failed, setFailed] = useState(false);
  const label = name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.displayName || 'Profil';
  const initialsValue = (() => {
    const fromUser = initials(user?.firstName, user?.lastName);
    if (fromUser) return fromUser;
    const dn = (user?.displayName || name || '').trim();
    const parts = dn.split(/\s+/);
    return initials(parts[0] || '', parts.slice(1).join(' ') || '') || null;
  })();

  const photoUrl = src ?? user?.avatarUrl;

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  if (photoUrl && !failed) 
    return (
      <img
        src={photoUrl}
        alt={label}
        className={`${className} rounded-full object-cover`}
        onError={() => setFailed(true)}
      />
    );
  
  return (
    <span className={`${className} inline-flex items-center justify-center rounded-full text-sm font-semibold ${fallbackClassName}`}>
      {initialsValue || <User size={16} aria-hidden />}
    </span>
  );
}
