import { ChevronRight, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { StarRating } from '@/components/ui/StarRating.jsx';
import { cn } from '@/lib/utils.js';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants.js';
import { mockImage } from '@/mocks/images.js';

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
  return item.image || item.coverUrl || item.photoUrl || item.avatarUrl || fallbackPortrait(item.id, item.featuredPrompt);
}

function Availability({ isAvailable }) {
  if (isAvailable === false) return <Badge variant="warning">Indisponible</Badge>;
  return <Badge variant="neutral">Disponible</Badge>;
}

export function ProfessionalCard({ item, mode = 'list', featuredPrompt }) {
  const imgSrc = coverImage({ ...item, featuredPrompt });
  const avg = Number(item.rating?.average ?? 0);
  const cnt = Number(item.rating?.count ?? 0);

  if (mode === 'grid') 
    return (
      <Card className="group border-[#BDC0C8]! flex h-full flex-col overflow-hidden relative aspect-4/5.5 ">
          <img
            src={imgSrc}
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
              <Link
                to={ROUTES.PROFESSIONAL(item.id)}
                className="text-[12px] font-bold text-primary-500 rounded p-1 -mr-1"
              >
                Voir le profil <ChevronRight size={14} className="inline" aria-hidden />
              </Link>
            </div>
          </div>
      </Card>
    );
  

  return (
    <li>
      <Card className={cn(
        'group flex h-full flex-col sm:flex-row overflow-hidden gap-0 !rounded-[28px] !border-gray-200 hover:!border-primary-200 hover:shadow-[0_14px_36px_-20px_rgba(45,92,74,0.3)] transition',
      )}>
        <div className="relative block sm:w-[200px] shrink-0 aspect-[5/4] sm:aspect-auto overflow-hidden bg-gray-100">
          <img
            src={imgSrc}
            alt={item.displayName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          {item.coverBadge && (
            <div className="absolute left-3 bottom-3 rounded-[10px] bg-white/95 px-3 py-1 text-[10px] font-bold text-gray-700 ring-1 ring-black/5 backdrop-blur">
              {item.coverBadge}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col p-5 sm:p-6 gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="text-xl font-extrabold tracking-tight text-gray-900 -ml-1 pl-1">
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
            <div className="flex flex-col items-end gap-2">
              <Availability isAvailable={item.isAvailable} />
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-2">
            <Link
              to={ROUTES.PROFESSIONAL(item.id)}
              className="inline-flex items-center justify-center rounded-[14px] border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 transition"
            >
              Afficher le profil
            </Link>
          </div>
        </div>
      </Card>
    </li>
  );
}
