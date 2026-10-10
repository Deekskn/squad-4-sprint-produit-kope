import { ChevronRight, Star } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { cn } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/lib/constants.js';
import { mockImage } from '@/shared/mocks/images.js';

function fallbackPortrait(seed, prompt) {
  if (prompt) 
    return mockImage(prompt, 'portrait_4_3');
  
  const hash = String(seed || 'kop').split('').reduce((a, c) => a + ((c.charCodeAt(0) * 13) % 7), 3);
  const palettes = [
    ['#eaf3ec', '#2d5c4a'], ['#f6efe0', '#8b6b2f'], ['#fbeae3', '#a45e3a'], ['#e6ecff', '#3e4c8a'],
  ];
  const [bg, fg] = palettes[hash % palettes.length];
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='320'><rect width='100%' height='100%' fill='${bg}'/><circle cx='210' cy='130' r='60' fill='${fg}' opacity='0.85'/><rect x='105' y='200' width='210' height='120' rx='60' fill='${fg}' opacity='0.8'/></svg>`,
  )}`;
}

function coverImage(item) {
  return item.avatarUrl || item.image || item.coverUrl || item.photoUrl || fallbackPortrait(item.id, item.featuredPrompt);
}

function Availability({ isAvailable }) {
  if (isAvailable === false) return <Badge variant="warning">Indisponible</Badge>;
  return <Badge variant="success">Disponible</Badge>;
}

/** Photo de profil : une seule image, ratio identique sur toutes les cards. */
function ProfileMedia({ item }) {
  return (
    <div className="aspect-[4/5] w-full shrink-0 self-start overflow-hidden bg-gray-100 sm:w-[170px]">
      <UserAvatar
        src={item.avatarUrl || item.image || null}
        name={item.displayName}
        rounded="rounded-none"
        iconSize={40}
        className="h-full w-full"
        fallbackClassName="h-full w-full bg-gray-100 text-gray-300"
      />
    </div>
  );
}

export function ProfessionalCard({ item, mode = 'list', featuredPrompt }) {
  const avg = Number(item.rating?.average ?? 0);
  const cnt = Number(item.rating?.count ?? 0);
  const coverSrc = coverImage({ ...item, featuredPrompt });

  if (mode === 'grid')
    return (
      <Link to={ROUTES.PROFESSIONAL(item.id)} className="group block h-full">
        <Card className="border-[#BDC0C8]! flex h-full cursor-pointer flex-col overflow-hidden relative aspect-4/5.5 ">
          <img
            src={coverSrc}
            alt={item.displayName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />

          <div className="absolute right-2 left-2 bottom-2  rounded-sm bg-white/92 backdrop-blur-sm  p-4  space-y-2">

            <div className=" flex flex-wrap justify-between gap-1.5">
              <Badge variant="primary">{item.trade}</Badge>
              <Availability isAvailable={item.isAvailable}  variant="outline" />
            </div>
            <p className="font-extrabold tracking-tight text-gray-900 text-lg leading-tight">{item.displayName}</p>
            <p className="text-[12px] text-gray-500">
              {(item.zones || []).slice(0, 2).join(' · ') || 'Zone à venir'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-700">
                {cnt > 0 ? (
                  <span className="font-semibold text-gray-900">
                    <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden /> {avg.toFixed(1)} · {cnt} avis
                  </span>
                ) : (
                  <>
                  <StarRating value={avg} size="sm" />
                  <span className="text-gray-400">Nouveau</span>
                  </>
                )}
              </div>
              <span className="text-[12px] font-bold text-primary-500 rounded p-1 -mr-1">
                Voir le profil <ChevronRight size={14} className="inline" aria-hidden />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    );
  

  return (
    <li>
      <Link to={ROUTES.PROFESSIONAL(item.id)} className="group block h-full">
        <Card className={cn(
          'flex h-full cursor-pointer flex-col overflow-hidden gap-0 border border-gray-200 bg-white transition hover:border-primary-200 hover:shadow-sm sm:flex-row',
        )}>
        <ProfileMedia item={item} />
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="text-[20px] font-extrabold tracking-tight text-gray-900">
                {item.displayName}
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-primary-700">{item.trade}</span>
                {(item.zones || []).length > 0 && (
                  <> · <span>{(item.zones || []).slice(0, 2).join(' · ')}</span></>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
                {item.yearsExperience != null && (
                  <span>{item.yearsExperience} an{item.yearsExperience > 1 ? 's' : ''} d'expérience</span>
                )}
                {cnt > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                    <StarRating value={avg} size="sm" />
                    {avg.toFixed(1)} ({cnt} avis)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-1">
            <Availability isAvailable={item.isAvailable} />
            <span className="inline-flex items-center justify-center rounded-[10px] border border-[#dfe5e2] bg-[#f5f7f6] px-4 py-2.5 text-sm font-bold text-gray-900 transition group-hover:bg-white">
              Afficher le profil
            </span>
          </div>
        </div>
      </Card>
      </Link>
    </li>
  );
}
