import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Adil Dursun Okulları',
    template: '%s | Adil Dursun Okulları',
  },
  description: 'Adil Dursun Okulları, öğrencilerin akademik ve sosyal gelişimlerini destekleyen, geleceğe hazırlayan bir eğitim kurumudur.',
  keywords: ['okul', 'eğitim', 'özel okul', 'adil dursun', 'istanbul'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
} 