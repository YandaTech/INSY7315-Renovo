# Team contributions

This page shows each member's share of the code from the git history: the
dates of their first and last commit and the lines they changed in each part
of the repository. The commit counts are in one place only: the table in
section 10 of the final report (`docs/final-report.md`). To regenerate the
numbers, run the commands at the end.

Everything here uses the same method as section 10: commits on `main`,
merge commits excluded, as of 4 November 2026 (`main` at `a4801a7`). The
line counts leave out lock files, images, compressed files, database files,
the Ajiya plan and its guide (`ajiya/`, `.ajiya/`) and the raw scanner
output in `docs/security/baseline/`, `docs/security/retest/` and
`docs/security/supply-chain/`. Those files are not written by hand and would
inflate the numbers.

| Member | Title | First to last commit | Main areas (lines added / removed) |
|---|---|---|---|
| Aliyu Yahaya Haliru (ST10440112) | Tech Lead | 11 Sep to 4 Nov 2026 | frontend +5,756 / -4,513; backend +4,920 / -492; docs +3,910 / -394; voice-bridge +2,464 / -262; deploy +944 / -196; ai-agent +910 / -157 |
| Nikita Correia Freire (ST10279031) | Backend Developer | 16 Sep to 29 Oct 2026 | voice-bridge +545 / -152; backend +234 / -8 |
| Adam Benting (ST10440722) | DevOps Engineer | 2 Oct to 1 Nov 2026 | backend +768 / -212; CI workflow +113 / -7 |
| Yaseera Khan (ST10456786) | Frontend Developer | 26 Sep to 27 Oct 2026 | frontend +5,100 / -1,061 |
| Demira Yashwant Harry (ST10443785) | Backend Developer | 17 Sep to 3 Nov 2026 | backend +1,219 / -230 |

What each member built:

- **Aliyu Yahaya Haliru:** voice pipeline (Twilio, voice-bridge, AI agent), hosting on
  AWS, CI/CD and the automatic deploy, security hardening, integration and merges.
- **Nikita Correia Freire:** the first voice-bridge service (webhook,
  WebSocket stream, call state, saving calls), the notification log, and the
  SMS and email sending functions.
- **Adam Benting:** authentication, login rate limiting, CI.
- **Yaseera Khan:** the dashboard frontend.
- **Demira Yashwant Harry:** backend API refactor into routers, repositories and
  Alembic migrations.

Line counts measure activity, not effort or quality. One person's commits
can also include integrating or finishing someone else's work. Read them
together with the pull requests and the Ajiya plan (`ajiya/`), which records
who closed each ticket.

## Regenerating

```sh
git fetch origin
# commits on main, merges excluded (section 10 of the final report)
git rev-list --count --no-merges origin/main --author="<author name>"
# first and last commit
git log origin/main --no-merges --author="<author name>" --format=%ad --date=short
# lines per top-level folder
git log origin/main --no-merges --author="<author name>" --numstat --format= \
  | awk '$3 !~ /package-lock|\.db$|\.png|\.jpg|\.webp|\.gz|^\.?ajiya\/|docs\/security\/(baseline|retest|supply-chain)\// {split($3,p,"/"); a[p[1]]+=$1; d[p[1]]+=$2}
         END {for (k in a) print k, "+" a[k], "-" d[k]}'
```
