import { Input } from './Input.jsx';
import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';

export function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} />
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
        type="button"
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setShow(!show)}
      >
        {show ? (
          <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
        ) : (
          <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
        )}
      </button>
    </div>
  );
}
