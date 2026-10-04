import { useNavigate, Link } from 'react-router-dom';
import FormulaireRecherche from '../components/FormulaireRecherche.jsx';

export default function Accueil() {
  const navigate = useNavigate();

  function chercher({ metier, zone }) {
    const p = new URLSearchParams();
    if (metier) p.set('metier', metier);
    if (zone) p.set('zone', zone);
    navigate('/recherche?' + p.toString());
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-in">
          <h1>Le bon artisan. Tout près de vous.</h1>
          <p>Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux.</p>
          <div className="boite-recherche">
            <span className="onglet">Recherche par mot-clé</span>
            <FormulaireRecherche onSubmit={chercher} />
          </div>
        </div>
      </section>

      <section className="section" id="comment">
        <div className="hero-in">
          <h2>Comment ça marche</h2>
          <div className="etapes">
            <div className="etape"><strong>Cherchez</strong><span>Choisissez un métier et un quartier.</span></div>
            <div className="etape"><strong>Consultez</strong><span>Ouvrez le profil : description, zones, réalisations.</span></div>
            <div className="etape"><strong>Contactez</strong><span>Cliquez sur « Contacter » pour obtenir ses coordonnées.</span></div>
          </div>
          <div style={{ marginTop: 36 }}>
            <details><summary>Comment obtenir ses coordonnées ?</summary><p>Ouvrez le profil du professionnel puis cliquez sur « Contacter ». Vous devez être connecté.</p></details>
            <details><summary>Qui apparaît dans la recherche ?</summary><p>Les professionnels dont le profil est complet : description, photos et zones d'intervention.</p></details>
          </div>
        </div>
      </section>

      <section className="appel">
        <h2>Un projet en tête ? Le quartier a du talent.</h2>
        <Link className="btn" to="/recherche">Trouver un professionnel</Link>
      </section>
    </main>
  );
}
