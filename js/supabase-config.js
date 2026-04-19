/*
 * Supabase client setup for the shop page.
 * Replace these placeholders with your Supabase project URL and anon key.
 */
(function () {
    const SUPABASE_URL = 'https://pnpxdedywltjqxmcqvzp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucHhkZWR5d2x0anF4bWNxdnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTEyNjksImV4cCI6MjA5MjE2NzI2OX0.Y65C6XebgmHfxmXVzOb-mYWiVOKUeBT1SQcKtWR9uaA';

    if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR-PROJECT-ID')) {
        window.supabaseClient = null;
        return;
    }

    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
