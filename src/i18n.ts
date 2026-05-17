import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Xác định chính xác file ngôn ngữ dựa trên locale
  const targetLocale = locale === 'en' ? 'en' : 'vi';

  return {
    locale: targetLocale,
    messages: (await import(`./messages/${targetLocale}.json`)).default
  };
});
