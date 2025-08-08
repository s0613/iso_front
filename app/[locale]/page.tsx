import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Index');
  return (
    <main className="p-4">
      <h1>{t('title')}</h1>
    </main>
  );
}
