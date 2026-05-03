# Database Integration

The site now supports an optional Supabase database while keeping the existing browser `localStorage` fallback.

## What Gets Stored

- Contact form enquiries go into `leads`.
- Chatbot enquiries go into `leads` with source `chatbot`.
- Optional client login profiles go into `customer_profiles` and also create a lead with source `client_login`.
- Visitor history goes into `visitors`.
- The admin dashboard reads database leads/visitors and merges them with local browser data.
- Admin status changes and single-lead deletes sync back to Supabase when database keys are configured.

## Setup Steps

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run the SQL from `SUPABASE_SETUP.sql`.
4. Open `database.js`.
5. Paste your values:

```js
var SUPABASE_URL = 'https://your-project.supabase.co';
var SUPABASE_ANON_KEY = 'your-public-anon-key';
```

6. Upload/deploy the updated website files.

## Important Note

This setup is designed for a static website. The public website can insert records, and the static admin page can read them using the Supabase anon key.

Before a serious production launch, move admin reads, updates, and deletes behind a protected backend or Supabase Edge Function. That keeps private lead/visitor data from being readable or editable through a public browser key.
