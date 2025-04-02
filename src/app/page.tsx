'use client';

import HeroSection from '@/components/home/HeroSection';
import Announcements from '@/components/home/Announcements';
import Achievements from '@/components/home/Achievements';
import ContactSection from '@/components/home/ContactSection';
import WhyUsSection from '@/components/WhyUsSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <WhyUsSection />
      <Announcements />
      <Achievements />
      <ContactSection />
    </main>
  );
} 