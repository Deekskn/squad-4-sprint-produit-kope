import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

/** Avatar utilisateur */
export function UserAvatar({
  user,
  name,
  className = 'h-8 w-8',
  fallbackClassName = 'bg-primary-100 text-primary-800',
  src,
  iconSize = 16,
}) {
  const [failed, setFailed] = useState(false);
  const label = name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.displayName || 'Profil';

  const photoUrl = src ?? user?.avatarUrl;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <span className={`${className} inline-flex items-center justify-center rounded-full font-semibold ${fallbackClassName}`}>
      <User size={iconSize} aria-hidden />
    </span>
  );
}
