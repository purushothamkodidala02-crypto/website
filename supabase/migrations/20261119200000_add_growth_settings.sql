-- Migration: 20261119200000_add_growth_settings.sql
-- Purpose: Add JSONB value column to site_settings for extensible site configuration,
--          and seed default configuration for the 'Help Us to Grow' pop-up.

alter table if exists public.site_settings
  add column if not exists value jsonb default '{}'::jsonb;

insert into public.site_settings (key, enabled, value)
values (
  'growth_popup',
  true,
  '{
    "minCompletedTests": 5,
    "cooldownDays": 7,
    "maxAppearances": 3,
    "displayDelaySeconds": 2.5,
    "targetRoutes": {
      "dashboard": true,
      "home": false,
      "mockTests": true
    },
    "headline": "Support the Mission to Keep Quality Mock Tests Open & Free",
    "message": "We do not ask for money from new users or casual visitors. Every candidate is encouraged to explore, read syllabi, and practice freely. As a committed candidate who has been using our platform for a long time, you have experienced first-hand the academic and technical standard of Varadhi Prep. We bear monthly server, database, and content verification costs to keep all tests open, fast, and 100% ad-free.",
    "primaryButtonText": "Support Varadhi",
    "secondaryButtonText": "Maybe Later",
    "suggestedAmounts": [50, 100, 250, 500],
    "upiId": "support@varadhiprep.in",
    "upiName": "Varadhi Prep"
  }'::jsonb
)
on conflict (key) do nothing;

notify pgrst, 'reload schema';
