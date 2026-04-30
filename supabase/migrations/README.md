# Supabase migrations

The current audit says the repo schema is incomplete compared with the tables used by the code.

Do not manually guess the production schema.

Use:

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db pull
```

Then review and commit the generated migration files.
