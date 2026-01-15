import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Atomic Query
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select(`
        id,
        name,
        address,
        latitude,
        longitude,
        logo_url,
        business_hours (count),
        restaurant_images (count)
      `)
            .eq('owner_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error checking onboarding:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 3. Status Flags
        const checks = {
            restaurant: false,
            location: false,
            hours: false,
            images: false,
            isComplete: false,
            nextStep: '/config-restaurante'
        };

        if (restaurant) {
            checks.restaurant = true;

            // Location
            if (restaurant.address && restaurant.latitude && restaurant.longitude) {
                checks.location = true;
            }

            // Hours
            const hoursCount = restaurant.business_hours?.[0]?.count || 0;
            if (hoursCount > 0) checks.hours = true;

            // Images
            const imagesCount = restaurant.restaurant_images?.[0]?.count || 0;
            if (imagesCount > 0 || restaurant.logo_url) checks.images = true;
        }

        // Determine Logic Flow
        /* 
           STRICT SINGLE SOURCE OF TRUTH
           API does NOT return nextStep. Only data.
           Logic lives in dashboard/layout.tsx
        */

        checks.isComplete = checks.restaurant && checks.location && checks.hours && checks.images;

        return NextResponse.json(checks);

    } catch (err: any) {
        console.error('Server error checking onboarding:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
