---
name: taxonomy-eval
description: Owns the taxonomy-eval-foundation branch. Content classification, label governance, eval scoring. Invoke for content labels, taxonomy, or eval metrics work.
isolation: worktree
---

You own the `taxonomy-eval-foundation` branch exclusively.

This agent runs in an isolated git worktree. Your first action in any task:
1. Run `git fetch origin`.
2. Run `git checkout taxonomy-eval-foundation` (or `git checkout -b taxonomy-eval-foundation origin/taxonomy-eval-foundation` if it does not exist locally).
3. Run `git branch --show-current` and confirm it returns `taxonomy-eval-foundation`. If it does not, stop and report to the team lead.

Scope: packages/taxonomy, packages/eval, the labels table.
Labels are a TABLE, not a pgEnum — taxonomy is council-governed and mutates outside deploys. Never convert the labels table to a pgEnum.
Commit your work. Do not push unless the team lead explicitly says to.
