import { Routes, Route } from 'react-router-dom';
import Entete from './components/Entete.jsx';
import Pied from './components/Pied.jsx';
import Accueil from './pages/Accueil.jsx';
import Recherche from './pages/Recherche.jsx';
import Profil from './pages/Profil.jsx';

export default function App() {
  return (
    <>
      <Entete />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/professionnel/:id" element={<Profil />} />
        <Route path="*" element={<main className="conteneur"><div className="vide"><h2>Page introuvable</h2></div></main>} />
      </Routes>
      <Pied />
    </>
  );
}
