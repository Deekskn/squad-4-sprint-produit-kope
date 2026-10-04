import { useState } from 'react';
import { ZONES, METIERS } from '../api.js';

// Formulaire partagé par l'accueil et la page de recherche
export default function FormulaireRecherche({ metierInitial = '', zoneInitiale = '', onSubmit, colonne = false }) {
  const [metier, setMetier] = useState(metierInitial);
  const [zone, setZone] = useState(zoneInitiale);

  function soumettre(e) {
    e.preventDefault();
    onSubmit({ metier: metier.trim(), zone });
  }

  return (
    <form className={'champs' + (colonne ? ' col' : '')} onSubmit={soumettre}>
      <input
        list="metiers"
        placeholder="Quel métier ?"
        aria-label="Métier"
        value={metier}
        onChange={(e) => setMetier(e.target.value)}
      />
      <datalist id="metiers">
        {METIERS.map((m) => <option key={m} value={m} />)}
      </datalist>
      <select aria-label="Quartier" value={zone} onChange={(e) => setZone(e.target.value)}>
        <option value="">Quel quartier ?</option>
        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
      </select>
      <button className="btn" type="submit">Rechercher</button>
    </form>
  );
}
