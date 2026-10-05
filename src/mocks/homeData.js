// Mock/demo content for the HomePage (sample professionals, categories, FAQ).
import { Wrench, Zap, Palette } from 'lucide-react';
import what1 from '@/assets/what1.png';
import what2 from '@/assets/what2.png';
import what3 from '@/assets/what3.png';
import user1 from '@/assets/user1.png';
import User2 from '@/assets/user2.png';




export const CATEGORIES = [
  { id: 'plomberie', image: what1, name: 'Plomberie', sub: 'Fuites & Installations', icon: Wrench, tradeId: 1, prompt: 'a photo of an african plumber working on bathroom sink pipe, professional, bright daylight, waist up, realistic' },
  { id: 'electricite', image: what2, name: 'Électricité', sub: 'Dépannage & Équipements', icon: Zap, tradeId: 2, prompt: 'professional african electrician working on electrical panel with wires, daylight, realistic' },
  { id: 'maconnerie', image: what3, name: 'Maçonnerie', sub: 'Gros œuvre & Finitions', icon: Palette, tradeId: 3, prompt: 'african house painter rolling paint on white wall, professional, daylight, realistic' },
];

export const FEATURED = [
  { id: 'sample-1', image: user1, displayName: 'Julien Morel', trade: 'Plombier', zones: ['Hauts-Pavés', 'Centre-ville'], years: 12, rating: 4.9, count: 12, available: true, prompt: 'portrait of professional african plumber man 35s with tools, crossed arms, friendly smile, workshop background' },
  { id: 'sample-2', image: User2, displayName: 'Thomas Rivière', trade: 'Électricien', zones: ['Camps-Ville', 'Île de Nantes'], years: 9, rating: 4.8, count: 9, available: true, prompt: 'portrait of african electrician man with multimeter, studio shot, confident smile' },
  { id: 'sample-3', image: what3, displayName: 'Sarah Le Goff', trade: 'Maçonne', zones: ['Chantenay', 'Centre-ville'], years: 8, rating: 4.7, count: 6, available: true, prompt: 'portrait of professional african mason woman 30s holding trowel, construction site daylight' },
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
