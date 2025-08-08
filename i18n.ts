import {getRequestConfig} from 'next-intl/server';

export const locales = ['ko', 'en'] as const;
export const defaultLocale = 'ko';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => ({
  locale,
  messages: (await import(`./messages/${locale}.json`)).default
}));
