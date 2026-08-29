# Permissions Matrix

Status: INITIAL â€” MUST BE REFINED BEFORE SENSITIVE FEATURES

| Capability | Admin | Secretary | Instructor | Finance | Student | Parent | Security/Cleaning |
|---|---:|---:|---:|---:|---:|---:|---:|
| View own profile | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Manage all system settings | Yes | No | No | No | No | No | No |
| Create learner records | Yes | Proposed | No | No | No | No | No |
| Enter grades/assessments | Yes | No | Yes for assigned classes | No | No | No | No |
| View own results | N/A | No | Relevant classes | No | Yes | Child only, if enabled | No |
| Manage financial records | Yes | Unknown | No | Yes | No | No | No |
| Teaching timetable | Yes | View/assist TBD | Assigned classes | No | Own | Child view TBD | No |

"Proposed", "Unknown" and "TBD" are NOT permissions.

Before implementing authorization for a row containing these terms, resolve it
in `docs/UNKNOWN.md`.