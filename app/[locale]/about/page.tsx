import {useTranslations} from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('About');
  return (
    <main className="p-4">
      <h1>{t('title')}</h1>
    </main>
  );
}
