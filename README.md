# NyrAtlas agent skill

The official skill for working inside a [NyrAtlas](https://nyratlas.com) outside-plant fiber
project with an AI agent: Claude (Claude Code, Claude in Chrome, the desktop app), OpenClaw,
Codex, ChatGPT agent mode, and any other agent that reads the `SKILL.md` convention.

The agent works as the person, in the browser tab where they are already signed in, with the
permissions they have and no others. There is no API key, no token to paste, and nothing to
configure. The server decides what the agent may do, exactly as it does for the person.

## What is in the folder

- `SKILL.md`: the procedure. Establish the session, preflight the project, read, plan and ask
  before anything destructive, write one enclosure per save, rebase once on a conflict, settle
  and verify on screen, report.
- `references/`: the preflight block, the enclosure document and the rules the server holds it
  to, every status code and its recovery, the on-screen check, and the plan file for bringing a
  project in from another tool.
- `scripts/`: four small JavaScript files for the tab's console. They leave helpers on
  `window.nyr`. Only `save-state.js` writes, and only when `window.nyr.save` is called.
- `INSTALL.md`: where the folder goes for each agent.
- `CHANGELOG.md`: what changed in each version.

## Install

See [INSTALL.md](INSTALL.md). In short: copy this folder to the skills directory your agent
reads, named `nyratlas`. Claude Code reads `~/.claude/skills/nyratlas/`; OpenClaw reads
`skills/nyratlas/` in its workspace; Codex reads its own skills folder.

## Source of truth

The canonical copy of this folder is served from https://nyratlas.com/skill/ by the same server
that runs the product, so it always matches that server. This repository mirrors it so the
skill can be cloned, read and reviewed. The contract an agent must follow is the live page at
https://nyratlas.com/agents.md, which is checked against the running server on every deploy.
The first step of the procedure is to read it and prefer it over anything installed.

## Scope

Outside-plant projects (`type: "ospmap"`) only. Data center projects are not covered yet.

## Issues

Open an issue here for anything in the skill that is wrong or unclear. For the product itself,
use Help inside NyrAtlas.

## License

Proprietary. Free to install and use with NyrAtlas. Copyright Nyraven LLC.
