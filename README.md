# Adil Dursun Okulları Tanıtım Sitesi

Bu proje, Adil Dursun Okulları için geliştirilmiş bir tanıtım sitesidir. Next.js, React, Tailwind CSS, Firebase ve Cloudinary teknolojileri kullanılarak oluşturulmuştur.

## Özellikler

- Okul hakkında genel bilgiler
- Öğretmen kadrosu tanıtımı
- Fiyat bilgileri
- Duyurular ve etkinlikler
- Yemek listesi
- Misyon, vizyon ve amaç bilgileri
- Responsive tasarım (mobil, tablet, masaüstü uyumlu)
- Karanlık/aydınlık tema desteği
- Admin paneli (içerik yönetimi)

## Teknolojiler

- **Frontend**: Next.js, React
- **Stil**: Tailwind CSS
- **Backend/Veritabanı**: Firebase (Firestore, Authentication, Storage)
- **Medya Depolama**: Cloudinary
- **Hosting**: Firebase Hosting

## Başlangıç

### Gereksinimler

- Node.js 18.0.0 veya üzeri
- npm veya yarn
- Firebase hesabı
- Cloudinary hesabı

### Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullanici-adi/okul-tanitim-sitesi.git
   cd okul-tanitim-sitesi
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. `.env.local.example` dosyasını `.env.local` olarak kopyalayın ve kendi API anahtarlarınızla doldurun:
   ```bash
   cp .env.local.example .env.local
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Klasör Yapısı

```
okul-tanitim-sitesi/
├── public/
│   ├── images/ (Okul logosu, etkinlik fotoğrafları vb.)
│   └── favicon.ico
├── src/
│   ├── components/ (Tüm React bileşenleri)
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── TeacherCard.jsx (Öğretmen bilgileri için)
│   │   └── EventCard.jsx (Etkinlik kartları için)
│   ├── pages/
│   │   ├── index.js (Ana Sayfa)
│   │   ├── ogretmen-kadrosu.js (Öğretmen Kadrosu Sayfası)
│   │   ├── fiyatlar.js (Fiyat Bilgisi Sayfası)
│   │   ├── duyurular.js (Duyurular Sayfası)
│   │   ├── etkinlikler.js (Etkinlikler Sayfası)
│   │   ├── yemek-listesi.js (Yemek Listesi Sayfası)
│   │   ├── neden-adil-dursun.js (Neden Adil Dursun Sayfası)
│   │   ├── misyon-vizyon.js (Misyon ve Vizyon Sayfası)
│   │   └── amacimiz.js (Amaç Sayfası)
│   ├── styles/
│   │   ├── globals.css (Global CSS)
│   │   └── Home.module.css (Ana Sayfa için CSS)
│   ├── firebase/ (Firebase konfigürasyonu)
│   │   └── firebaseConfig.js
│   ├── utils/ (Yardımcı fonksiyonlar)
│   │   └── fetchData.js (Firebase'den veri çekmek için)
│   └── context/ (Context API için)
│       └── AppContext.js
├── tailwind.config.js (Tailwind CSS konfigürasyonu)
├── postcss.config.js (PostCSS konfigürasyonu)
├── .env.local (Firebase ve Cloudinary API anahtarları)
└── README.md
```

## Dağıtım

Firebase Hosting'e dağıtmak için:

```bash
npm run build
firebase deploy
```

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Sorularınız veya geri bildirimleriniz için [email@example.com](mailto:email@example.com) adresine e-posta gönderebilirsiniz.
