
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import DashboardClientLayout from './layout-client';
import OnboardingSelector from './components/OnboardingSelector';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  // 1. Verify Session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // 2. Strict Onboarding Check (Direct DB Call)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(`
        id,
        address,
        latitude,
        longitude,
        logo_url,
        cover_image_url,
        business_hours (count),
        restaurant_images (count)
      `)
    .eq('owner_id', session.user.id)
    .maybeSingle();

  // 3. Status Calculation (No Redirects)
  const status = {
    restaurant: !!restaurant,
    location: !!(restaurant?.address && restaurant?.latitude && restaurant?.longitude),
    hours: (restaurant?.business_hours?.[0]?.count || 0) > 0,
    images: ((restaurant?.restaurant_images?.[0]?.count || 0) > 0) || !!restaurant?.logo_url
  };

  const isComplete = status.restaurant && status.location && status.hours && status.images;

  if (!isComplete) {
    console.log(`[DASHBOARD] Usuario: ${session.user.id} -> Onboarding incompleto. Redirigiendo a /config-restaurante`);
    redirect('/config-restaurante');
  }

  console.log(`[DASHBOARD] Usuario: ${session.user.id} -> Acceso Permitido.`);

  // Onboarding Complete - Render Dashboard
  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
