# TOOLS.md - Local Notes

## Git Rules — NON-NEGOTIABLE

**Atomic commits only.** One logical change per commit. List every path explicitly.

```bash
# Tracked files:
git commit -m "<scoped message>" -- path/to/file1 path/to/file2

# New (untracked) files:
git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2
```

- Never `git add .` or `git add -A`
- Never bundle unrelated files in one commit
- Scoped message format: `type(scope): description` e.g. `feat(lab): add character consistency article`
- Types: feat / fix / docs / chore / refactor / content

---

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
