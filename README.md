# KRIES exam practice

A student mock-test portal for Karnataka KRIES Paper 1. It includes email signup and login, 100-question timed papers, a rolling one-year current-affairs bank, saved attempt history and answer explanations. Each new paper awards one mark per correct answer and deducts a quarter mark per wrong answer.

With Node 22.13 or later, run the following from the repository root.

```sh
cd kries
node build.mjs
node verify.mjs
node local.mjs
```

Open http://127.0.0.1:4173. See the [implementation and authoring guide](kries/README.md) and [free-tier deployment plan](kries/DEPLOYMENT.md).
