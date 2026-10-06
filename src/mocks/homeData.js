import { Wrench, Zap, Palette } from 'lucide-react';
import what1 from '@/assets/what1.png';
import what2 from '@/assets/what2.png';
import what3 from '@/assets/what3.png';
import user1 from '@/assets/user1.png';
import User2 from '@/assets/user2.png';




export const CATEGORIES = [
  { id: 'plomberie', image: what1, name: 'Plomberie', sub: 'Fuites & Installations', icon: Wrench, tradeId: 1 },
  { id: 'electricite', image: what2, name: 'Électricité', sub: 'Dépannage & Équipements', icon: Zap, tradeId: 2 },
  { id: 'maconnerie', image: what3, name: 'Maçonnerie', sub: 'Gros œuvre & Finitions', icon: Palette, tradeId: 3 },
];

export const FEATURED = [
  { id: 'sample-1', image: user1, displayName: 'Julien Mganga', trade: 'Plombier', zones: ['Brazzaville', 'Poto-Poto'], years: 12, rating: 4.9, count: 12, available: true },
  { id: 'sample-2', image: User2, displayName: 'Thomas Poaty', trade: 'Électricien', zones: ['Brazzaville', 'Moungalie'], years: 9, rating: 4.8, count: 9, available: true },
  { id: 'sample-3', image: what3, displayName: 'Sarah Ondze', trade: 'Maçonne', zones: ['Brazzaville', 'Moukondo'], years: 8, rating: 4.7, count: 6, available: true },
];

export const STEPS = [
  { n: '01', title: 'Cherchez près de chez vous', body: 'Choisissez un métier et votre quartier. Les professionnels disponibles apparaissent en premier.', tone: 'bg-kop-mint' },
  { n: '02', title: 'Découvrez les profils', body: 'Consultez les réalisations, l\'expérience et les avis pour vous faire une idée.', tone: 'bg-kop-cream' },
  { n: '03', title: 'Échangez directement', body: 'Accédez au téléphone et au WhatsApp du professionnel sur sa fiche publique pour discuter de votre projet.', tone: 'bg-kop-rose' },
];

export const FAQ = [
  { q: 'Faut-il un compte pour chercher ?', a: 'Non. La recherche et les fiches publiques sont accessibles à tous. Un compte est nécessaire pour laisser un avis.' },
  { q: 'Comment joindre un professionnel ?', a: 'Son numéro de téléphone et son lien WhatsApp sont visibles directement sur sa fiche publique.' },
  { q: 'Comment laisser un avis ?', a: 'Connectez-vous en tant que client, ouvrez la fiche du professionnel et remplissez le formulaire "Donner mon avis".' },
  { q: 'À portée gère-t-il les interventions ?', a: 'Non. KOP met en relation : vous discutez librement des tarifs, dates et conditions avec le professionnel.' },
];
