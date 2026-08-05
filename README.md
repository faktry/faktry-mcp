<p align="center">
  <a href="https://faktry.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/logo_white.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/logo_black.png">
      <img alt="faktry" src="assets/logo_black.png" width="240">
    </picture>
  </a>
</p>

<h1 align="center">faktry MCP</h1>

<p align="center">
  <strong>Bring the whole faktry media stack into the tools you already use.</strong><br>
  Generate and edit images, video, audio, and PDFs from any MCP-compatible client.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-1f9dff.svg"></a>
  <a href="https://faktry.ai/mcp"><img alt="Docs" src="https://img.shields.io/badge/Docs-faktry.ai%2Fmcp-1f9dff"></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#tools">Tools</a> ·
  <a href="#example-prompts">Examples</a> ·
  <a href="#troubleshooting">Troubleshooting</a>
</p>

<p align="center">
  <img src="assets/platform.png" alt="faktry platform" width="100%">
</p>

---

The **faktry MCP server** exposes the full faktry toolkit — over 70 tools spanning image, video, audio, PDF, and 3D generation and editing — to any client that speaks the [Model Context Protocol](https://modelcontextprotocol.io). Generate a product shot, cut it into a UGC-style video with a voiceover, subtitle it, and export a thumbnail sheet, all without leaving the chat.

- <img src="assets/icon_black.png" width="14" align="top"> **Hosted, remote.** Connect to `https://faktry.ai/api/mcp` — no local server to run.
- **OAuth or API key, your choice.** One-click connect from Claude.ai, Claude Desktop, Cursor, and Hermes, or drop a static API key into any config-based client.
- **Async by default.** Long-running jobs (video, some image/audio) return a `job_id` immediately; poll `faktry_job_status` until it's ready.
- **A library that remembers.** Save any result with `faktry_library_save` and pull it back into a later session with `faktry_library_list`.
- **You pay through your faktry account.** Usage draws down your existing credit balance — check it anytime with `faktry_credits`.

---

## Install

### One-click / OAuth

These clients handle authentication for you — paste the URL, sign in, approve.

**MCP Server URL:**

```
https://faktry.ai/api/mcp
```

<details open>
<summary><strong>Claude.ai</strong></summary>

1. Open Claude.ai → **Settings → Integrations**.
2. Click **Add MCP Server** and paste the URL above.
3. Claude.ai redirects you to faktry — sign in and click **Approve**.
4. Done — Claude.ai stores the token automatically.

</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

1. Open Claude Desktop → **Settings → Developer → MCP Servers**.
2. Click **Add Server** and paste the URL above.
3. A browser window opens — sign in to faktry and click **Approve**.
4. Restart Claude Desktop if tools don't appear immediately.

</details>

<details>
<summary><strong>Cursor</strong></summary>

1. Open Cursor → **Settings → AI → MCP Servers**.
2. Click **Add MCP Server** and paste the URL above.
3. Cursor detects OAuth and opens a browser login window.
4. Sign in to faktry, approve access, and return to Cursor.

</details>

<details>
<summary><strong>Hermes Agent</strong></summary>

1. Open Hermes Agent → **Settings → MCP Servers**.
2. Click **+** and paste the URL above.
3. Hermes opens a browser login — sign in to faktry and approve.
4. Toggle the server on — tools appear immediately.

</details>

<details>
<summary><strong>ChatGPT Desktop</strong> <sub>(Business / Enterprise / Edu only)</sub></summary>

1. Enable **Developer Mode** in Settings → Beta Features.
2. Go to **Settings → MCP Servers → Add Server**.
3. Paste the URL above and follow the browser OAuth flow.

</details>

### Config file / API key

Create an API key at [faktry.ai/api/keys](https://faktry.ai/api/keys) first, then add faktry to your client's config. Replace `YOUR_API_KEY_HERE` with your real key — it's only shown once when created.

<details>
<summary><strong>Claude Code</strong></summary>

Add to `.mcp.json` (project) or `~/.claude.json` (user):

```json
{
  "mcpServers": {
    "faktry": {
      "type": "http",
      "url": "https://faktry.ai/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY_HERE" }
    }
  }
}
```

Picked up automatically — no restart needed.

</details>

<details>
<summary><strong>VS Code (Copilot)</strong></summary>

Add to `.vscode/mcp.json` (workspace) or via **Settings → MCP Servers**:

```json
{
  "servers": {
    "faktry": {
      "type": "http",
      "url": "https://faktry.ai/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY_HERE" }
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Edit `~/.codeium/windsurf/mcp_config.json` (`%USERPROFILE%\.codeium\windsurf\mcp_config.json` on Windows) — note Windsurf uses `serverUrl`, not `url`:

```json
{
  "mcpServers": {
    "faktry": {
      "serverUrl": "https://faktry.ai/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY_HERE" }
    }
  }
}
```

Restart Windsurf to activate the tools.

</details>

<details>
<summary><strong>Continue.dev</strong></summary>

Add to `~/.continue/config.yaml`:

```yaml
mcpServers:
  faktry:
    type: http
    url: https://faktry.ai/api/mcp
    requestOptions:
      headers:
        Authorization: "Bearer YOUR_API_KEY_HERE"
```

Continue.dev reloads automatically.

</details>

<details>
<summary><strong>Codex CLI</strong></summary>

Add to `~/.codex/config.toml`:

```toml
[mcp.servers.faktry]
type = "http"
url = "https://faktry.ai/api/mcp"

[mcp.servers.faktry.headers]
Authorization = "Bearer YOUR_API_KEY_HERE"
```

Verify with `codex mcp list`.

</details>

<details>
<summary><strong>Zed</strong></summary>

Zed only speaks stdio natively, so this bridges through <code>mcp-remote</code>:

```bash
npm install -g mcp-remote
```

Add to your Zed `settings.json` (`%APPDATA%\Zed\settings.json` on Windows):

```json
{
  "context_servers": {
    "faktry": {
      "source": "custom",
      "command": "npx",
      "args": ["mcp-remote", "https://faktry.ai/api/mcp", "--header", "Authorization: Bearer YOUR_API_KEY_HERE"]
    }
  }
}
```

</details>

<details>
<summary><strong>Kilo Code</strong></summary>

1. Open the Kilo Code extension settings → **MCP Servers**.
2. Add a new server using the same JSON snippet as Claude Code above.
3. Replace `YOUR_API_KEY_HERE` with your actual key.

</details>

<details>
<summary><strong>Other MCP clients</strong></summary>

Add a remote HTTP server pointing at `https://faktry.ai/api/mcp` with header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

Full per-client snippets and paths are also generated at [faktry.ai/mcp](https://faktry.ai/mcp).

</details>

---

## Tools

Your client picks which tool to call based on your prompt — you don't need to invoke them by name. faktry exposes 70+ tools across five categories:

| Category | Examples | What it covers |
| --- | --- | --- |
| `faktry_image_*` | `generate`, `edit`, `inpaint`, `outpaint`, `upscale`, `removebackground`, `effects`, `collage`, `watermark`, `smartcrop` | Text-to-image, editing, upscaling, background removal, compositing |
| `faktry_video_*` | `text2video`, `image2video`, `avatar`, `motioncontrol`, `subtitle`, `reframe`, `stabilize`, `upscale`, `scenedetect` | Generation, editing, avatars, motion control, subtitles, reframing |
| `faktry_audio_*` | `generatespeech`, `clonevoice`, `generatemusic`, `generatesound`, `mix`, `transcribe`, `trim` | Speech synthesis, voice cloning, music/SFX generation, mixing |
| `faktry_pdf_*` | `create`, `merge`, `split`, `compress`, `extract`, `mdconvert` | PDF creation and manipulation |
| `faktry_3d_*` | `image23d`, `text23d` | 3D asset generation from images or text |

Plus utility tools:

| Tool | What it does |
| --- | --- |
| `faktry_job_status` | Poll an async job by `job_id` until it's `completed`, returning `result_url` |
| `faktry_credits` | Check credit balance and current-month usage |
| `faktry_library_list` | Browse previously saved media assets |
| `faktry_library_save` | Save a result URL to the library for reuse across sessions |

### The async job pattern

Most generation tools (video, some image/audio) are async:

1. Call the generation tool → receive a `job_id`.
2. Poll `faktry_job_status` with that `job_id` every few seconds.
3. When status is `completed`, the response contains `result_url`.
4. Optionally persist it with `faktry_library_save`.

---

## Example prompts

Try these once faktry is connected:

```
Generate a studio product shot of a matte black wireless speaker on a
white background, then upscale it to 4K.
```

```
Turn this product image into a 9:16 UGC-style video with a voiceover
reading the description, and add subtitles.
```

```
Remove the background from this photo, then composite it onto a
gradient backdrop.
```

```
Clone this voice sample and generate a 30-second narration reading
this script.
```

```
Check my faktry credits, then show me what's in my library.
```

---

## Troubleshooting

<details>
<summary><strong>Tools don't appear after connecting</strong></summary>

- **Claude.ai / Desktop:** Settings → Integrations (or Developer → MCP Servers), confirm faktry shows as connected. Remove and re-add if it failed silently — make sure pop-ups aren't blocked so the OAuth window can open.
- **Claude Code:** `claude mcp list` should show the server.
- **Codex:** `codex mcp list` should show `faktry`. Start a new session after adding.
- Quick smoke test: ask your client *"check my faktry credits"*.

</details>

<details>
<summary><strong>Authentication or API key errors</strong></summary>

- For config-file clients, confirm `YOUR_API_KEY_HERE` was replaced with a real, active key from [faktry.ai/api/keys](https://faktry.ai/api/keys) — keys are shown only once at creation.
- For OAuth clients, disconnect and reconnect the connector to redo the flow.

</details>

<details>
<summary><strong>A generation keeps loading</strong></summary>

Video renders and some audio/image jobs take longer than a plain image generation. The tool returns a pending `job_id` immediately — keep polling `faktry_job_status` until it reports `completed`.

</details>

---

## Links

- **MCP setup UI** — [faktry.ai/mcp](https://faktry.ai/mcp)
- **API keys** — [faktry.ai/api/keys](https://faktry.ai/api/keys)
- **faktry** — [faktry.ai](https://faktry.ai)

---

## License

[MIT](./LICENSE) © faktry
