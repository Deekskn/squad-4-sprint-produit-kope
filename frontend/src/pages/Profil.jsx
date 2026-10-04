import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfil, getContact, urlPhoto, initiales } from '../api.js';

function Photo({ photo }) {
  const [cassee, setCassee] = useState(false);
  if (cassee) return null;
  return (
    <figure>
      <img src={urlPhoto(photo.fichier)} alt={photo.legende || ''} onError={() => setCassee(true)} />
      {photo.legende && <figcaption>{photo.legende}</figcaption>}
    </figure>
  );
}

export default function Profil() {
  const { id } = useParams();
  const [profil, setProfil] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [contact, setContact] = useState(null);
  const [erreurContact, setErreurContact] = useState(null);

  useEffect(() => {
    let annule = false;
    setProfil(null); setErreur(null); setContact(null); setErreurContact(null);
    getProfil(id)
      .then((p) => { if (!annule) { setProfil(p); document.title = `${p.prenom} ${p.nom} – KOP`; } })
      .catch((e) => { if (!annule) setErreur(e.status || 500); });
    return () => { annule = true; };
  }, [id]);

  async function contacter() {
    setErreurContact(null);
    try {
      setContact(await getContact(id));
    } catch (e) {
      setErreurContact(e.status === 401 || e.status === 403
        ? 'Connectez-vous pour voir les coordonnées.'
        : 'Impossible de récupérer les coordonnées.');
    }
  }

  if (erreur) {
    const msg = erreur === 401 ? 'Connectez-vous pour consulter ce profil.'
      : erreur === 404 || erreur === 400 ? 'Ce profil est introuvable.'
      : 'Impossible de charger le profil.';
    return (
      <main className="conteneur">
        <div className="vide"><h2>{msg}</h2><Link className="btn" to="/recherche">Retour à la recherche</Link></div>
      </main>
    );
  }
  if (!profil) return <main className="conteneur"><p className="meta">Chargement…</p></main>;

  const wa = (contact?.whatsapp || '').replace(/\D/g, '');

  return (
    <main className="conteneur">
      <div className="grille-profil">
        <div>
          <p className="meta"><Link to="/recherche">← Retour à la recherche</Link></p><br />
          <div className="profil-tete">
            <div className="avatar">{initiales(profil)}</div>
            <div>
              <h1>{profil.prenom} {profil.nom}</h1>
              <div className="metier">{profil.metier}</div>
              {profil.annees_experience && <div className="meta">{profil.annees_experience} d'expérience</div>}
            </div>
          </div>
          <p>{profil.descript}</p>
          <div className="etiquettes">
            {profil.zones.map((z) => <span className="etiquette" key={z}>{z}</span>)}
          </div>
          {profil.photos.length > 0 && (
            <>
              <h2>Quelques réalisations</h2>
              <div className="galerie">
                {profil.photos.map((ph) => <Photo key={ph.id_photo} photo={ph} />)}
              </div>
            </>
          )}
        </div>

        <aside className="contact">
          <h2>Parlons de votre besoin.</h2>
          <p>Obtenez ses coordonnées et échangez directement avec {profil.prenom}.</p>
          <button className="btn btn-bloc" onClick={contacter}>Contacter {profil.prenom}</button>
          {erreurContact && <p className="erreur" style={{ marginTop: 12 }}>{erreurContact}</p>}
          {contact && (
            <div className="coords">
              <span>Téléphone : <a href={`tel:${contact.telephone}`}>{contact.telephone}</a></span>
              {wa && <span>WhatsApp : <a href={`https://wa.me/242${wa}`} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a></span>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
