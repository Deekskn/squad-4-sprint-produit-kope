import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rechercher } from '../api.js';
import FormulaireRecherche from '../components/FormulaireRecherche.jsx';
import CarteResultat from '../components/CarteResultat.jsx';

export default function Recherche() {
  const [params, setParams] = useSearchParams();
  const metier = (params.get('metier') || '').trim();
  const zone = (params.get('zone') || '').trim();

  const [resultats, setResultats] = useState([]);
  const [etat, setEtat] = useState('repos'); // repos | chargement | ok | erreur

  useEffect(() => {
    if (!metier && !zone) {
      setResultats([]);
      setEtat('repos');
      return;
    }
    let annule = false;
    setEtat('chargement');
    rechercher({ metier, zone })
      .then((donnees) => { if (!annule) { setResultats(donnees); setEtat('ok'); } })
      .catch(() => { if (!annule) setEtat('erreur'); });
    return () => { annule = true; };
  }, [metier, zone]);

  function chercher(v) {
    const p = {};
    if (v.metier) p.metier = v.metier;
    if (v.zone) p.zone = v.zone;
    setParams(p);
  }

  function elargir() {
    setParams(metier ? { metier } : {});
  }

  return (
    <main className="conteneur grille-recherche">
      <aside className="panneau">
        <span className="onglet">Recherche par mot-clé</span>
        {/* key : le formulaire se réinitialise quand l'URL change */}
        <FormulaireRecherche key={metier + '|' + zone} metierInitial={metier} zoneInitiale={zone} onSubmit={chercher} colonne />
      </aside>

      <section>
        {etat === 'chargement' && <p className="compte">Recherche en cours…</p>}
        {etat === 'erreur' && <p className="erreur">Impossible de charger les résultats. Vérifiez que le serveur est lancé.</p>}
        {etat === 'repos' && (
          <div className="vide"><h2>Que cherchez-vous ?</h2><p>Indiquez un métier, un quartier, ou les deux.</p></div>
        )}
        {etat === 'ok' && (
          <>
            <p className="compte">{resultats.length} professionnel{resultats.length > 1 ? 's' : ''}</p>
            {resultats.length === 0 ? (
              <div className="vide">
                <h2>Aucun professionnel trouvé</h2>
                <p>Aucun profil ne correspond à cette recherche pour le moment.</p>
                {zone && metier && <button className="btn" onClick={elargir}>Élargir à toutes les zones</button>}
              </div>
            ) : (
              <div className="liste">
                {resultats.map((p) => <CarteResultat key={p.id_pro} pro={p} />)}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
