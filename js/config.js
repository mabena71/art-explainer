// Zugang zu Supabase. Vorerst im Projekt "bena-fit" (gleiche Konten wie BENA Fit, eigene Tabellen "art_…").
// Solange beide Werte leer sind, läuft die App nur als Demo.
// Der "anon key" ist für den Browser gedacht und darf hier stehen; den geheimen
// "service_role key" und den Anthropic-Schlüssel niemals hier eintragen.
export const SUPABASE_URL = 'https://slvrawfomzgmyytzdnfx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdnJhd2ZvbXpnbXl5dHpkbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODQ1ODYsImV4cCI6MjEwNzg2MDU4Nn0.6gjonj0VKiW2O1h-TG4oq08_-vaSfCtzkXDD-65g-lA';

// Adresse (Slug) der Edge Function mit dem Code aus supabase/functions/art/index.ts.
// Im Dashboard heisst sie «Art Explainer», die Adresse wurde beim Anlegen automatisch vergeben.
export const ART_FUNCTION = 'smooth-api';

export const cloudConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
