
const { createClient } = require('@supabase/supabase-js');

// Keys from seed script
const supabaseUrl = 'https://lwwmmufsdtbetgieoefo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d21tdWZzZHRiZXRnaWVvZWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM4MjE1NiwiZXhwIjoyMDY4OTU4MTU2fQ.ZBCKGjaoxyW8aXnArO4uS5LgC3HjHt21VI3cegj0hLQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables...');

    // Check business_hours
    const { data: hours, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .limit(1);

    if (hoursError) {
        console.log('❌ business_hours table error:', hoursError.message);
    } else {
        console.log('✅ business_hours table exists.');
    }

    // Check restaurant_images
    const { data: images, error: imagesError } = await supabase
        .from('restaurant_images')
        .select('*')
        .limit(1);

    if (imagesError) {
        console.log('❌ restaurant_images table error:', imagesError.message);
    } else {
        console.log('✅ restaurant_images table exists.');
    }

    // Check restaurants columns
    const { data: rest, error: restError } = await supabase
        .from('restaurants')
        .select('opening_hours, logo_url, image_url')
        .limit(1);

    if (restError) {
        console.log('❌ restaurants table error:', restError.message);
    } else {
        console.log('✅ restaurants table columns check:', rest ? Object.keys(rest[0] || {}) : 'No rows');
    }
}

checkTables();
