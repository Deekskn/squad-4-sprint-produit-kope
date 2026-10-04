export function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Je m\'inscris',
      body: 'Client ou professionnel : la création de compte prend moins d\'une minute avec votre numéro de téléphone.',
    },
    {
      num: '02',
      title: 'Je cherche un artisan',
      body: 'Sélectionnez un métier et une zone de Brazzaville. Les résultats affichent uniquement les profils publiés et complétés.',
    },
    {
      num: '03',
      title: 'Je contacte directement',
      body: 'Le numéro de téléphone et le lien WhatsApp de l\'artisan sont visibles sur sa fiche publique. Appelez ou écrivez pour convenir d\'un rendez-vous.',
    },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Comment ça marche ?
      </h1>
      <p className="mt-3 text-gray-600">
        KÔPE simplifie la mise en relation entre les particuliers et les artisans du bâtiment au Congo.
      </p>
      <ol className="mt-8 space-y-5">
        {steps.map((s) => (
          <li
            key={s.num}
            className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg font-extrabold text-primary-700 ring-1 ring-primary-100">
              {s.num}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
              <p className="mt-1 text-gray-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
