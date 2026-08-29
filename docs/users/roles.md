# Roles

## Core principle

Employment role, teaching role and system permission are separate concepts.

Do not model:

`staff == teacher`

Instead, a person can be:
- staff;
- instructor;
- administrator;
- finance staff;
- secretary;
- security staff;
- cleaner;
- technical staff;
- management;
or combinations explicitly granted by policy.

## External user roles

Potential external roles:
- learner/student;
- parent/guardian.

## Authorization rule

Permissions should be granted explicitly by role/capability.

Never give administrative access merely because a user is a staff member.