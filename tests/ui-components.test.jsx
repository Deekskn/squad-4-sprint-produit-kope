import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { User, Star } from 'lucide-react';
import { Select } from '../src/shared/components/ui/Select.jsx';
import { Table, TableRow, TableEmpty } from '../src/shared/components/ui/Table.jsx';
import { Skeleton } from '../src/shared/components/ui/Skeleton.jsx';
import { FloatingCaption } from '../src/shared/components/ui/FloatingCaption.jsx';
import { BottomNav } from '../src/shared/components/ui/BottomNav.jsx';
import { Tooltip } from '../src/shared/components/ui/Tooltip.jsx';

describe('Select', () => {
  it('a une bordure par défaut', () => {
    const html = renderToStaticMarkup(<Select><option>a</option></Select>);
    expect(html).toContain('border');
    expect(html).toContain('bg-white');
  });

  it('peut retirer la bordure (searchbar home)', () => {
    const html = renderToStaticMarkup(<Select bordered={false}><option>a</option></Select>);
    expect(html).toContain('border-0');
    expect(html).not.toContain('border-gray-200');
  });

  it('utilise le même rayon que les inputs (rounded-sm)', () => {
    const html = renderToStaticMarkup(<Select><option>a</option></Select>);
    expect(html).toContain('rounded-sm');
  });
});

describe('Table', () => {
  it('rend une cellule vide avec colSpan', () => {
    const html = renderToStaticMarkup(
      <Table>
        <tbody>
          <TableRow>
            <TableEmpty colSpan={5}>Aucun résultat.</TableEmpty>
          </TableRow>
        </tbody>
      </Table>,
    );
    // TableEmpty rend déjà un <tr><td colSpan>, on teste sa sortie directe
    const empty = renderToStaticMarkup(<table><tbody><TableEmpty colSpan={5}>Vide</TableEmpty></tbody></table>);
    expect(empty).toMatch(/colspan="5"|colSpan="5"/);
    expect(empty).toContain('Vide');
    expect(html).toContain('<table');
  });
});

describe('Skeleton', () => {
  it('a l animation pulse', () => {
    const html = renderToStaticMarkup(<Skeleton className="h-10 w-full" />);
    expect(html).toContain('animate-pulse');
  });
});

describe('FloatingCaption', () => {
  it('affiche titre et sous-titre', () => {
    const html = renderToStaticMarkup(<FloatingCaption title="Titre" subtitle="Sous-titre" />);
    expect(html).toContain('Titre');
    expect(html).toContain('Sous-titre');
    expect(html).toContain('bg-white/92');
  });

  it('aligne à droite quand align=right', () => {
    const html = renderToStaticMarkup(<FloatingCaption title="T" align="right" />);
    expect(html).toContain('right-2');
  });
});

describe('BottomNav', () => {
  const items = [
    { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: User },
    { id: 'avis', label: 'Mes avis', icon: Star },
  ];

  it('est fixée en bas et masquée en desktop', () => {
    const html = renderToStaticMarkup(
      <BottomNav items={items} active="profil" onChange={() => {}} ariaLabel="Navigation" />,
    );
    expect(html).toContain('fixed');
    expect(html).toContain('bottom-0');
    expect(html).toContain('lg:hidden');
    expect(html).toContain('aria-label="Navigation"');
  });

  it('utilise le libellé court pour les petits écrans', () => {
    const html = renderToStaticMarkup(
      <BottomNav items={items} active="profil" onChange={() => {}} />,
    );
    expect(html).toContain('Profil');
    expect(html).not.toContain('Mon profil');
    expect(html).toContain('Mes avis');
  });

  it('marque l onglet actif via aria-selected', () => {
    const html = renderToStaticMarkup(
      <BottomNav items={items} active="avis" onChange={() => {}} />,
    );
    const parts = html.split('aria-selected=');
    expect(parts[1]?.startsWith('"false"')).toBe(true);
    expect(parts[2]?.startsWith('"true"')).toBe(true);
  });
});

describe('Tooltip', () => {
  it('affiche le contenu avec role tooltip', () => {
    const html = renderToStaticMarkup(
      <Tooltip content="Voir la fiche">
        <button type="button">Fiche</button>
      </Tooltip>,
    );
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('Voir la fiche');
    expect(html).toContain('group/tooltip');
  });

  it('rend uniquement les enfants si pas de contenu', () => {
    const html = renderToStaticMarkup(
      <Tooltip content="">
        <button type="button">Action</button>
      </Tooltip>,
    );
    expect(html).not.toContain('role="tooltip"');
    expect(html).toContain('Action');
  });

  it('positionne selon side', () => {
    const html = renderToStaticMarkup(
      <Tooltip content="X" side="bottom">
        <span>a</span>
      </Tooltip>,
    );
    expect(html).toContain('top-full');
  });
});
