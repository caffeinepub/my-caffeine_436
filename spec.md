# কুইজ গেম

## Current State
Login/Register uses username + password (localStorage). No profile page. AdminPanel shows username/password.

## Requested Changes (Diff)

### Add
- Email OR phone login support
- Profile modal: name, phone, bKash number editable
- Admin panel shows all user fields

### Modify
- auth.ts: UserAccount now has email, phone, name, bkash, password fields
- LoginScreen: email/phone + password login, email + password register
- AdminPanel: show all user registration details

### Remove
- Username-only login

## Implementation Plan
1. Update lib/auth.ts with new UserAccount shape
2. Update LoginScreen.tsx UI
3. Create ProfileModal.tsx
4. Update App.tsx to wire profile modal
5. Update HomeScreen.tsx to open profile on name click
6. Update AdminPanel.tsx user list
