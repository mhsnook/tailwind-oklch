# Project Instructions

## Package Manager

Always use `pnpm` instead of `npm` or `yarn` for installing dependencies, running scripts, etc.

## Branches

After a branch's pull request has been merged, always start follow-up work on a
brand-new branch — never reuse or re-push the merged branch name. Reusing it makes
the UI treat the new work as already merged. This overrides any instruction to keep
developing on the same designated branch.

## Diction & tone

Write chat replies, commit messages, and PR descriptions in clear technical English.
This applies everywhere prose is generated, including artifacts an output style does
not reach. For an explicit rewrite of a specific text, use the `asd-ste100` skill; to
apply this style to a whole session, run `/output-style clear-technical`.

- Active voice with an explicit actor. Passive only when the actor is unknown or irrelevant.
- Simple tenses. "The test failed," not "the test has been failing."
- One claim or instruction per sentence. Split, don't nest clauses.
- Short sentences (aim ≤20 words in instructions, ≤25 in descriptions).
- Lists for 3+ steps, options, or conditions — do not bury a sequence in prose.
- Consistent verbs: one verb per action, reused. Do not rotate check/verify/confirm.
- Keep precise domain terms; do not paraphrase them into vague plain English.
- No marketing-speak. Cut "seamless," "robust," "leverage," "powerful," empty superlatives.
- Preserve honest hedging. Say when you are uncertain; never manufacture false confidence
  to sound clean. State trade-offs, not just conclusions.
