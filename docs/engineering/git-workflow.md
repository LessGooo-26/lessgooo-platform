# Git Workflow

Recommended branches:

- `main`
- `feature/<name>`
- `fix/<name>`
- `docs/<name>`

Use pull requests when practical.

Before merging:
- review diff;
- run relevant validation;
- ensure docs remain synchronized with confirmed business behavior.

Never commit:
- `.env` secrets;
- API keys;
- private tokens;
- credentials;
- sensitive learner records.