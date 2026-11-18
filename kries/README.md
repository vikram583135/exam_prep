# KRIES student practice portal

## Run on this computer

Use Node 22.13 or later. From this directory run `node build.mjs`, then `node local.mjs`. Open http://127.0.0.1:4173. Students register and sign in with an email address and password. The local server persists accounts, hashed credentials, sessions and attempts in `.practice/portal.sqlite`. Registering in a browser with its original local student cookie attaches that browser's earlier attempts to the account. The Worker uses the same account flow with shared D1 storage. Run `node verify.mjs` after building for the in-memory exam workflow checks.

## Paper 1 implementation

The supplied syllabus defines 100 questions, 100 marks, 120 minutes and 15 topic categories. English is the initial practice medium. New papers use +1 for correct, −0.25 for wrong, and 0 for skipped. Earlier papers retain their original rule. The penalty is the portal owner’s practice rule. Official per-topic quotas are unspecified in the screenshot. The topic targets in `src/topics.mjs` can be revised when official details become available.

Only the General Paper I degree-standard booklet, code 277, PDF pages 1–45 of the user-supplied 2017 compilation, informed the style analysis. Kannada and English pages repeat the same questions. The ten list matches occur at questions 23, 28, 34, 55, 70, 73, 75, 80, 84 and 90. The opening questions emphasize dated events, and reasoning spans several passages of the paper. The mix includes direct recall, combined statements, list matches, numerical and visual reasoning. The bank includes applied subject scenarios, six multistep numerical or reasoning items per paper and dated current-affairs questions with primary sources. Only events after the previous calendar-year anniversary and through the current date in India qualify. Cached papers age out of new assignments when their oldest event expires. Archived papers retain their original content. Difficulty has not been calibrated against candidate scores. The 2017 timing, marking, subject-specific Paper II booklets and original question text are excluded.

A new paper selects a fixed count per syllabus category and assigns question formats, distractors and option order. The initial bank generates ten list matches per paper. A unique fingerprint uses the sorted item IDs so rearranging the same set cannot count as a new paper. One active attempt per student and exam allows safe resume. An immutable paper snapshot is shared across students. Completed and expired papers remain in each student's history. Topics and facts recur in later papers.

## Expand the bank with AI

Use the offline authoring command with a server-side `OPENAI_API_KEY` and optionally `KRIES_AI_MODEL`. On this Windows installation, use `./draft-local.ps1 0 notes.txt current-affairs.draft.json` to load the encrypted current-user credential outside the repository. On other hosts, supply the environment variable securely. For current affairs include event dates and primary-source URLs in the notes. Put verified source notes for one topic in a text file, then run `node draft.mjs 0 notes.txt current-affairs.draft.json` for eight original drafts. Topic IDs run from zero through fourteen in syllabus order. Check facts, date, clarity and distractors, then merge accepted entries into `approved.json` and rebuild. Index zero in each authored choices array holds the correct answer before shuffling. Source notes and drafts can stay outside the project. Student requests never call an AI API. Reusing a paper and generating a new set from approved content both cost zero inference tokens.

## Five-day rollout plan

1. Compare the practice medium and penalty with the current admission or recruitment notice. Verify that the intended exam is this General Paper I.
2. Check representative paper content with a subject expert. Compare recall, multistep reasoning, current-affairs recency, diagram coverage and typical time against the relevant historical booklet. Prioritise Kannada and diagram items if students need them.
3. Enrich the weakest topic banks using short source-based batches. Reuse the stored questions and sample new ones for ambiguity before release.
4. Pilot on student phones, test interruptions and deadline submission, and collect completion times and per-item accuracy. Adjust the next blueprint using those results.
5. Release the verified edition to students, retaining previous snapshots and scores. Add a student question-report action and targeted wrong-answer practice next.

See [the free-tier deployment plan](DEPLOYMENT.md) for Cloudflare Workers and D1 setup, limits and release checks.
