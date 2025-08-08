import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n';

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Index'});

  return (
    <main className="p-4">
      <h1>{t('title')}</h1>
    </main>
  );
}
