# Changelog

## 0.1.1

- An agent that has NyrAtlas as an MCP server is told to use it: the server's tools, the
  `read-docs` tool or `/mcp.md` for the contract, no signed-in tab needed and none to wait
  for. The browser procedure is for working without a token. An agent holding both had read
  the old text as "the tab or nothing" and stopped.

## 0.1.0

First version. Outside-plant projects only.

- The procedure: establish, preflight, read, plan and ask, write one enclosure at a time,
  rebase once on a 409, settle and verify on screen, report.
- References: the `readOnly` preflight block, the enclosure document and the rules the server
  holds it to, every answer code and its recovery, the on-screen check, the plan file in brief.
- Scripts for the tab's console: `session.js`, `read-state.js`, `save-state.js`,
  `verify-enclosure.js`.
- Install notes for the agents people use.
- `LICENSE.md`: proprietary, free to copy and use with NyrAtlas and nothing else.
- `.claude-plugin/`: the folder is a Claude Code plugin and its own marketplace, so
  `claude plugin install nyratlas --marketplace Nyraven/nyratlas-skill` works; INSTALL.md gains
  the one-command `npx skills add Nyraven/nyratlas-skill` and the exact Codex paths.
