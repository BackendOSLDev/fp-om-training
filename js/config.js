/* Site settings. Fill these two from Supabase: Project Settings > API (or API Keys).
   SUPABASE_KEY is the PUBLIC key ("publishable" or "anon public"). It is safe in this file.
   NEVER put the "secret" or "service_role" key here or anywhere in this repo.
   Leave both blank to run in demo mode (nothing is saved online). */
window.FP_CONFIG = {
  SUPABASE_URL: "https://iamkezmmixjjerniwjhi.supabase.co",
  SUPABASE_KEY: "sb_publishable_4sv4wMyXfUJCA9Pl1zmOhQ_zcdFbFpQ",  // paste the publishable key between the quotes
  TIME_LABEL: "EDT",        // label shown next to times
  TIME_ZONE: "Etc/GMT+4"    // fixed UTC-4. Use "America/New_York" for real Eastern time (EDT in summer, EST in winter)
};
