import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { AppProvider } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const links = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/hakkimizda/', label: 'Hakkımızda' },
  { href: '/ogretmenlerimiz/', label: 'Öğretmenlerimiz' },
  { href: '/etkinlikler/', label: 'Etkinlikler' },
  { href: '/yemek-listesi/', label: 'Yemek Listesi' },
  { href: '/iletisim/', label: 'İletişim' },
];

export const metadata: Metadata = {
  title: "Adil Dursun Okulları - Kaliteli Eğitimin Adresi",
  description: "Adil Dursun Okulları, öğrencilerin akademik ve sosyal gelişimlerini destekleyen, geleceğe hazırlayan bir eğitim kurumudur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="bg-white">
        <AppProvider>
          <div className="flex flex-col min-h-screen relative">
            {/* Arka planda şeffaf logo - ana logo */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="opacity-[0.06] w-full h-full max-w-4xl max-h-4xl flex items-center justify-center">
                <Image 
                  src="/images/logo/logo.jpeg" 
                  alt="Adil Dursun Okulları Logo" 
                  width={800} 
                  height={800} 
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Sol taraftaki küçük logolar */}
            <div className="hidden lg:block fixed left-0 top-0 h-full pointer-events-none z-0">
              <div className="flex flex-col justify-around h-full py-20">
                <div className="opacity-[0.04] w-24 h-24 ml-4">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={100} 
                    height={100} 
                    className="object-contain"
                  />
                </div>
                <div className="opacity-[0.04] w-16 h-16 ml-8">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={70} 
                    height={70} 
                    className="object-contain"
                  />
                </div>
                <div className="opacity-[0.04] w-20 h-20 ml-6">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={80} 
                    height={80} 
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Sağ taraftaki küçük logolar */}
            <div className="hidden lg:block fixed right-0 top-0 h-full pointer-events-none z-0">
              <div className="flex flex-col justify-around h-full py-20">
                <div className="opacity-[0.04] w-16 h-16 mr-8">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={70} 
                    height={70} 
                    className="object-contain"
                  />
                </div>
                <div className="opacity-[0.04] w-24 h-24 mr-4">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={100} 
                    height={100} 
                    className="object-contain"
                  />
                </div>
                <div className="opacity-[0.04] w-20 h-20 mr-6">
                  <Image 
                    src="/images/logo/logo.jpeg" 
                    alt="Adil Dursun Okulları Logo" 
                    width={80} 
                    height={80} 
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            
            <Header />
            <main className="flex-grow pt-20 bg-white">{children}</main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
