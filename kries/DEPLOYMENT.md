# Free-tier deployment plan

Use one Cloudflare Workers Free application on a workers.dev subdomain and one D1 database. The Worker serves the website, handles accounts and grades attempts. D1 persists student accounts, sessions, saved papers and answers. AI authoring runs separately on the operator's computer. Hosting a student attempt has no model charge. OpenAI authoring uses the operator's API balance.

## Prepare the deployment

1. Sign in to a Cloudflare account on the Free plan. Use Node 22.13+ and Wrangler v4. Work from the repository's `kries` directory.
2. Run the commands below. Copy the returned D1 database ID into the local `wrangler.jsonc`. The example is tracked, and the local configuration is ignored.

```powershell
node build.mjs
node verify.mjs
Copy-Item wrangler.example.jsonc wrangler.jsonc
npx wrangler@4 login
npx wrangler@4 d1 create kries-practice
```

3. Apply migrations on a local preview database, then exercise signup, login, resume, expiry and result review. Wrangler reads numbered SQL files in the configured migrations directory.

```powershell
npx wrangler@4 d1 migrations apply kries-practice --local
npx wrangler@4 dev
```

4. For the initial launch, create the remote tables before serving requests. For subsequent releases, export a backup before applying new migrations. Store exports outside Git.

```powershell
npx wrangler@4 d1 migrations apply kries-practice --remote
npx wrangler@4 deploy
```

5. Open the HTTPS URL printed by Wrangler. Pilot two accounts. Verify that each account has private attempt history and that one correct, one wrong and 98 skips gives 0.75 marks. Check Worker CPU usage for signup, login and first-paper generation, D1 rows read/written, and school-network sign-in limits before inviting a full class.

## Free capacity and operation

Workers Free includes 100,000 requests a day and a 10 ms CPU allowance per HTTP request. An illustrative 250 requests per completed test leaves room for roughly 400 tests per day before accounting for other traffic. Navigation and answer changes autosave, so measure actual usage in the pilot. [Worker limits](https://developers.cloudflare.com/workers/platform/limits/)

D1 Free includes 5 million rows read and 100,000 rows written per day, with 5 GB total account storage and 500 MB per database. Check the D1 Metrics view during the five-day revision period. If a quota is reached, requests can fail until the allowance resets. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)

Keep the API credential on the authoring computer. On Windows the supplied launcher decrypts it for the current user only. Rotate the key shared in chat before broader use. Review AI drafts and commit only accepted content. Check the dated bank before each release: each new paper needs at least 12 eligible current-affairs items. A saved paper with expired content remains available in its student's history.

Use Worker version rollback for an application regression. Existing student data is in D1, so check that the target Worker understands the current schema; if needed, restore the pre-migration export into a separate database and verify it before switching the binding.
