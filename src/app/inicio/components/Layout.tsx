'use client'

import { 
  Hero, 
  Benefits, 
  MenuSection, 
  DidYouKnow, 
  Requirements, 
  RegistrationProcess, 
  Footer 
} from '@/app/inicio/components';

export const Layout: React.FC = () => {
  return (
    <main className="min-h-screen w-full overflow-hidden">
      <Hero />
      <Benefits />
      <MenuSection />
      <DidYouKnow />
      <Requirements />
      <RegistrationProcess />
      <Footer />
    </main>
  );
};



























