# Installing the NyrAtlas skill

The skill is a folder: `SKILL.md`, `references/`, `scripts/`. Every agent that reads the
SKILL.md format takes the same folder. The canonical copy is at
https://nyratlas.com/skill/ (each file at its path under that), and the same folder is
mirrored on GitHub so it can be cloned.

Whatever the agent, two things are always true:

- The agent needs a browser tool that runs JavaScript in the tab where the person is signed
  in to NyrAtlas. A chat-only assistant cannot open the project; it can still write a plan
  for the person to paste (see `references/import-plan.md`).
- The skill grants no access. It uses the person's own signed-in session and their own
  permissions. There is nothing to configure and no key to paste.

## Claude

- **Claude Code.** Copy the folder to `~/.claude/skills/nyratlas/` (for every project) or to
  `.claude/skills/nyratlas/` inside a project. It is picked up on the next session and
  triggers on NyrAtlas tasks. Drive the signed-in tab through Claude in Chrome or the desktop
  app's browser.
- **Claude in Chrome, Claude desktop browser.** No install is needed: the agent is already in
  the signed-in tab, and `/agents.md` and `/skill/SKILL.md` are one fetch away on the same
  site. Installing the skill as well gives it the procedure before it starts.
- **claude.ai.** Where your plan offers custom skills, upload the folder as a zip under
  Settings, Capabilities.

## OpenClaw

Copy the folder to the skills directory your OpenClaw reads: `skills/nyratlas/` in the
workspace, or the user-level skills folder (`~/.openclaw/skills/nyratlas/` on a default
install). OpenClaw reads the `SKILL.md` frontmatter and loads the skill when a task matches
its description. The agent needs a browser it can run scripts in; the browser profile should
be one where the person is signed in to NyrAtlas.

## Codex and ChatGPT

- **Codex (CLI or IDE).** Codex reads `SKILL.md` skills from its skills folder. Put this
  folder there under `nyratlas/` (check the skills location for your Codex version), or
  reference the procedure from your `AGENTS.md`. Codex needs a browser tool to act in the
  signed-in tab; without one it can only write plans.
- **ChatGPT.** A chat-only session cannot operate the project. Paste `SKILL.md` and
  `references/import-plan.md` into the project or custom instructions and it will write
  plans in the right shape for the Import page, and read back a project's state when the
  person pastes it. An agent mode with a browser follows the same procedure as any other.

## Other agents

Any agent that understands the SKILL.md convention takes the folder as is. One that does not
can still be pointed at https://nyratlas.com/agents.md (the contract) and
https://nyratlas.com/skill/SKILL.md (the procedure) as plain text.

## Keeping it current

`metadata.version` in `SKILL.md` and `CHANGELOG.md` move together. The live copy on
nyratlas.com always matches the server it sits on; a copy installed months ago may name a
field that has since changed, which is why the first step of the procedure is to read
`/agents.md` from the site and prefer it.
