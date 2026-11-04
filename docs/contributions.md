# Team contributions

The repository is private on GitHub's free organisation plan, which doesn't
show Insights graphs for private repositories. This page gives the same view
from the git history. Regenerate the numbers with the commands at the end.

Counts are from all branches as of 4 November 2026. Merge commits are
excluded. Lines leave out lock files, images, database files and the Ajiya
plan, which inflate the numbers without being written by hand.

| Member | Commits | First to last | Main areas (lines added / removed) |
|---|---|---|---|
| Aliyu Yahaya (ST10440112) | 129 | 11 Sep to 4 Nov 2026 | frontend +5,485 / -4,494; backend +3,998 / -461; voice-bridge +3,091 / -281; docs +2,212 / -36; ai-agent +924 / -158; deploy +787 / -81 |
| Nikita Correia Freire (ST10279031) | 18 | 16 Sep to 29 Oct 2026 | voice-bridge +545 / -152; backend +234 / -8 |
| Adam Benting | 14 | 2 Oct to 1 Nov 2026 | backend +768 / -212; CI workflow +113 / -7 |
| Yaseera (ST10456786) | 9 | 26 Sep to 27 Oct 2026 | frontend +5,100 / -1,061 |
| Demira Harry (ST10443785) | 7 | 17 Sep to 3 Nov 2026 | backend +1,219 / -230 |

What each member built (team to confirm):

- **Aliyu Yahaya:** voice pipeline (Twilio, voice-bridge, AI agent), hosting on
  AWS, CI/CD, security hardening, integration and merges.
- **Nikita Correia Freire:** SMS and email quote notifications and the
  notification log.
- **Adam Benting:** authentication, login rate limiting, CI.
- **Yaseera:** the dashboard frontend.
- **Demira Harry:** backend API refactor into routers, repositories and
  Alembic migrations.

Commit counts measure activity, not effort or quality, and one person's
commits can include integrating or finishing others' work. Read them with the
pull requests and the Ajiya plan (`ajiya/`), which records who closed each
ticket.

## Regenerating

```sh
git fetch --all
git shortlog -sne --all --no-merges
git log --all --no-merges --author="<name>" --numstat --format= \
  | awk '$3 !~ /package-lock|\.db$|\.png|\.jpg|ajiya\// {split($3,p,"/"); a[p[1]]+=$1; d[p[1]]+=$2}
         END {for (k in a) print k, "+" a[k], "-" d[k]}'
```
