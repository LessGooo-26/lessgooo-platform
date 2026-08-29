# Testing Strategy

Tests should protect both technical behavior and confirmed LESSGOOO business
rules.

Important regression examples:

- cleaner/security staff must not automatically receive teacher permissions;
- a missing program price must not create an invented price;
- unknown accreditation must not render as accredited;
- a partner relationship must not imply government approval;
- protected user data must not be exposed by public routes.

Do not delete a legitimate failing test merely to obtain a green build.