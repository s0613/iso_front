import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {Toaster} from '@/components/ui/sonner';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Totaro',
  description: 'Totaro Application',
  icons: {
    icon: '/Totaro_logo.svg',
    shortcut: '/Totaro_logo.svg',
    apple: '/Totaro_logo.svg',
  },
};

export function generateStaticParams() {
  return [{locale: 'ko'}, {locale: 'en'}];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="flex items-center gap-4 p-4 border-b">
            <Nav locale={locale} />
            <LocaleSwitcher />
          </header>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function Nav({locale}: {locale: Locale}) {
  const t = await getTranslations({locale, namespace: 'Nav'});
  return (
    <nav className="flex gap-4">
      <Link href={`/${locale}`}>{t('home')}</Link>
      <Link href={`/${locale}/about`}>{t('about')}</Link>
      <Link href={`/${locale}/contact`}>{t('contact')}</Link>
    </nav>
  );
}
