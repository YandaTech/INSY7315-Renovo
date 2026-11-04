# Team contributions

The repository is private on GitHub's free organisation plan. That plan
doesn't show Insights graphs for private repositories, so this page builds the
same view from the git history. To regenerate the numbers, run the commands at
the end.

The counts cover all branches as of 4 November 2026, without merge commits.
The line counts leave out lock files, images, database files and the Ajiya
plan. Those files are not written by hand and would inflate the numbers.

| Member | Commits | First to last | Main areas (lines added / removed) |
|---|---|---|---|
| Aliyu Yahaya Haliru (ST10440112) | 129 | 11 Sep to 4 Nov 2026 | frontend +5,485 / -4,494; backend +3,998 / -461; voice-bridge +3,091 / -281; docs +2,212 / -36; ai-agent +924 / -158; deploy +787 / -81 |
| Nikita Correia Freire (ST10279031) | 18 | 16 Sep to 29 Oct 2026 | voice-bridge +545 / -152; backend +234 / -8 |
| Adam Benting (ST10440722) | 14 | 2 Oct to 1 Nov 2026 | backend +768 / -212; CI workflow +113 / -7 |
| Yaseera Khan (ST10456786) | 9 | 26 Sep to 27 Oct 2026 | frontend +5,100 / -1,061 |
| Demira Yashwant Harry (ST10443785) | 7 | 17 Sep to 3 Nov 2026 | backend +1,219 / -230 |

What each member built:

- **Aliyu Yahaya Haliru:** voice pipeline (Twilio, voice-bridge, AI agent), hosting on
  AWS, CI/CD, security hardening, integration and merges.
- **Nikita Correia Freire:** the first voice-bridge service (webhook,
  WebSocket stream, call state, saving calls), the notification log, and the
  SMS and email sending functions.
- **Adam Benting:** authentication, login rate limiting, CI.
- **Yaseera Khan:** the dashboard frontend.
- **Demira Yashwant Harry:** backend API refactor into routers, repositories and
  Alembic migrations.

Commit counts measure activity, not effort or quality. One person's commits
can also include integrating or finishing someone else's work. Read the counts
together with the pull requests and the Ajiya plan (`ajiya/`), which records
who closed each ticket.

## Regenerating

```sh
git fetch --all
git shortlog -sne --all --no-merges
git log --all --no-merges --author="<name>" --numstat --format= \
  | awk '$3 !~ /package-lock|\.db$|\.png|\.jpg|ajiya\// {split($3,p,"/"); a[p[1]]+=$1; d[p[1]]+=$2}
         END {for (k in a) print k, "+" a[k], "-" d[k]}'
```
