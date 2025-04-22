import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Doto, Noto_Sans_KR, Roboto } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { GA_TRACKING_ID, pageview } from '@/lib/gtag';
import { ThemeProvider } from '@/components/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.sass';

const Noto = Noto_Sans_KR({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['cyrillic'],
});

const Mono = Doto({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--doto',
});

const Rbto = Roboto({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--rbto',
});

const Square = localFont({
  src: './fonts/NanumSquareNeoVF.woff2',
  style: 'normal',
  variable: '--square',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <ThemeProvider>
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <style jsx global>
        {`
          body,
          pre,
          input,
          button,
          select,
          textarea {
            font-family: ${Noto.style.fontFamily}, sans-serif;
            font-weight: 400;
          }
        `}
      </style>
      <div className={`${Square.variable} ${Mono.variable} ${Rbto.variable}`}>
        <a href="#header" className="sr-only">
          메뉴영역 바로가기
        </a>
        <a href="#content" className="sr-only">
          본문영역 바로가기
        </a>
        <hr id="header" />
        <Header />
        <hr id="content" />
        <Component {...pageProps} />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
