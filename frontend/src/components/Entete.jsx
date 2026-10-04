import { Link } from 'react-router-dom';

export default function Entete() {
  return (
    <header className="entete">
      <Link className="logo" to="/">KOP</Link>
      <nav className="nav">
        <Link to="/recherche">Trouver un professionnel</Link>
        <Link to="/#comment">Comment ça marche</Link>
        <a href="#">Devenir prestataire</a>
        <a className="btn btn-clair" href="#">Se connecter</a>
        <a className="btn" href="#">S'inscrire</a>
      </nav>
    </header>
  );
}
