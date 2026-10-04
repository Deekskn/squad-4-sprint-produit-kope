import { useState } from 'react';
import { Link } from 'react-router-dom';
import { urlPhoto, initiales } from '../api.js';

export default function CarteResultat({ pro }) {
  const [photoCassee, setPhotoCassee] = useState(false);
  const meta = [pro.annees_experience, (pro.zones || []).join(', ')].filter(Boolean).join(' · ');

  return (
    <article className="carte">
      <div className="avatar">
        {pro.miniature && !photoCassee
          ? <img src={urlPhoto(pro.miniature)} alt="" onError={() => setPhotoCassee(true)} />
          : initiales(pro)}
      </div>
      <div className="carte-corps">
        <h3>{pro.prenom} {pro.nom}</h3>
        <div className="metier">{pro.metier}</div>
        <div className="meta">{meta}</div>
      </div>
      <Link className="btn" to={`/professionnel/${pro.id_pro}`}>Voir le profil</Link>
    </article>
  );
}
