"use client";

import Link from 'next/link';
import {useLocale} from 'next-intl';
import {usePathname} from 'next/navigation';
import type {Locale} from '@/i18n';

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const otherLocale: Locale = locale === 'ko' ? 'en' : 'ko';

  const pathWithoutLocale = pathname.replace(/^\/(ko|en)/, '');
  const href = `/${otherLocale}${pathWithoutLocale}`;

  return (
    <Link href={href} className="underline">
      {otherLocale === 'ko' ? '한국어' : 'English'}
    </Link>
  );
}
