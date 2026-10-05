import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Select } from '../src/components/ui/Select.jsx';
import { Table, TableRow, TableEmpty } from '../src/components/ui/Table.jsx';
import { Skeleton } from '../src/components/ui/Skeleton.jsx';
import { FloatingCaption } from '../src/components/ui/FloatingCaption.jsx';

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
