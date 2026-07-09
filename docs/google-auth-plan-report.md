# Google Authentication Assessment and Plan

## Objective

Add Google sign-in to the Recruitment Application without breaking the current email/password flow, approval workflow, or role-based onboarding.

## Current Authentication Implementation

### Backend

- Auth routes live under `Backend/src/routes/authRoutes.ts`.
- Current login is `POST /api/auth/login`.
- Current registration is `POST /api/auth/register`.
- Email verification uses OTP:
  - `POST /api/auth/verify-email`
  - `POST /api/auth/resend-otp`
- Session handling is cookie-based JWT:
  - JWT is created in `Backend/src/utils/auth/tokenHelper.ts`
  - Cookie is set in `Backend/src/utils/auth/cookieHelper.ts`
  - Cookie is read by `Backend/src/middleware/authenticationMiddleware.ts`
- Login succeeds only when:
  - email exists
  - password matches
  - `isEmailVerified === true`
  - `isApproved === true`

### Frontend

- Login page is email/password only:
  - `frontend/src/features/auth/pages/LoginPage/index.tsx`
  - `frontend/src/features/auth/components/LoginForm/index.tsx`
- Frontend auth API currently exposes:
  - login
  - register
  - verify email
  - resend OTP
  - logout
  - current user
- Current frontend auth routes/constants are in:
  - `frontend/src/features/auth/constants/authConstants.ts`
  - `frontend/src/features/auth/api/authApi.ts`

## Existing Google Integration in the Codebase

Google is already used for calendar/meeting authorization, not for user login.

### What already exists

- Routes:
  - `GET /api/google/oauth/url`
  - `GET /api/google/oauth/callback`
- Files:
  - `Backend/src/routes/googleRoutes.ts`
  - `Backend/src/controllers/googleOAuthController.ts`
  - `Backend/src/services/google/googleOAuthService.ts`

### What it does today

- Generates a Google OAuth URL
- Exchanges auth code for a Google refresh token
- Intended for Google Calendar / Google Meet integration

### What it does not do

- Does not create or authenticate application users
- Does not set the application auth cookie
- Does not link a Google account to a user
- Does not support Google login on the frontend

## Current Database Structure

### User collection

File: `Backend/src/models/userModel.ts`

Current fields:

- `name`
- `email`
- `passwordHash`
- `otpCodeHash`
- `otpExpiryTime`
- `otpAttemptCount`
- `role`
- `profileCompleted`
- `isEmailVerified`
- `isApproved`
- `createdAt`
- `updatedAt`

### Role profile collections

Candidate profile:
- File: `Backend/src/models/candidateProfileModel.ts`
- Fields:
  - `userId`
  - `phone`
  - `resumeUrl`
  - `resumePublicId`
  - `skills`
  - `experienceYears`
  - `currentLocation`

HR profile:
- File: `Backend/src/models/hrProfileModel.ts`
- Fields:
  - `userId`
  - `position`
  - `experienceLevel`
  - `department`

Interviewer profile:
- File: `Backend/src/models/interviewerProfileModel.ts`
- Fields:
  - `userId`
  - `position`
  - `techStack`
  - `experienceLevel`

## Approval and Verification Rules Today

- All users register with a role at signup.
- OTP email verification is required for normal signup.
- Candidates are auto-approved after email verification.
- HR and interviewer users are not auto-approved and stay pending admin approval.
- Login is blocked for unverified or unapproved users.

This is important because Google login must respect the same business rules.

## Gaps for Google Sign-In

The current schema and flow are built for password-based auth only.

### Missing in backend

- No Google sign-in endpoint for app authentication
- No Google callback endpoint dedicated to login
- No Google ID token verification for login
- No account linking logic by email or provider ID
- No user creation flow for Google-authenticated users
- No provider metadata on the user record

### Missing in database

- No way to track auth provider
- No place to store Google subject ID (`sub`)
- `passwordHash` is required, which is a problem for Google-only accounts

### Missing in frontend

- No "Continue with Google" button
- No Google login redirect/callback page
- No handling for Google login success/error states

## Recommended Industry-Standard Approach

### Core principle

Use Google OAuth 2.0 / OpenID Connect only for identity verification, then continue using the app's own JWT cookie session.

This matches the current architecture and keeps authorization logic inside the application.

### Recommended user model changes

Add these fields to `User`:

- `authProvider`: `'local' | 'google' | 'hybrid'`
- `googleId`: string, optional, unique when present
- `avatarUrl`: string, optional
- `lastLoginAt`: Date, optional

Recommended change:

- Make `passwordHash` optional instead of required

Why:

- `local`: email/password users
- `google`: Google-only users
- `hybrid`: local user later linked with Google, or Google user later given password login

### Recommended backend flow

#### Option A: Redirect-based OAuth login

1. Frontend opens backend endpoint like `GET /api/auth/google`
2. Backend redirects user to Google consent screen
3. Google redirects back to backend callback
4. Backend verifies Google identity
5. Backend finds or creates local user
6. Backend enforces app rules:
   - candidate can be auto-approved
   - HR/interviewer may remain pending approval
7. Backend sets the same auth cookie used today
8. Backend redirects user to frontend dashboard or onboarding page

This is the best fit for this application.

#### Option B: Frontend gets credential, backend verifies ID token

1. Frontend uses Google Identity Services
2. Frontend sends ID token to backend
3. Backend verifies token with Google
4. Backend finds or creates local user
5. Backend sets app auth cookie

This also works, but option A is simpler to keep secure and consistent in a cookie-based backend.

## Recommended Business Rules for This App

### Candidate

- Allow Google sign-up/login
- Mark `isEmailVerified = true` because Google email is verified identity
- Auto-approve candidate to match current OTP-based behavior
- Create candidate profile automatically

### HR

- Allow Google sign-up/login
- Mark `isEmailVerified = true`
- Keep `isApproved = false` until admin approval
- Create HR profile automatically
- Show "approval pending" UI after first login/signup

### Interviewer

- Allow Google sign-up/login
- Mark `isEmailVerified = true`
- Keep `isApproved = false` until admin approval
- Create interviewer profile automatically
- Show "approval pending" UI after first login/signup

### Existing local account with same email

Recommended rule:

- If a local user exists with same email and no linked Google account, allow secure linking after verifying Google callback.
- Do not create duplicate user records for the same email.

This is important because email is already unique.

## Database Changes Needed

### Minimum required changes

In `User` model:

- Make `passwordHash` optional
- Add `authProvider`
- Add `googleId`

### Strongly recommended additions

- Add `avatarUrl`
- Add `lastLoginAt`

### Example target shape

```ts
{
  name: string;
  email: string;
  passwordHash?: string;
  role: 'hr' | 'candidate' | 'interviewer';
  authProvider: 'local' | 'google' | 'hybrid';
  googleId?: string;
  avatarUrl?: string;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
  lastLoginAt?: Date;
}
```

## API Changes Needed

### New backend endpoints

Recommended:

- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Optional supporting endpoint:

- `POST /api/auth/google/link`

### New frontend routes/pages

Recommended:

- Google login button on login/register page
- Optional callback/processing route:
  - `/auth/google/callback`

## Service Changes Needed

### Backend

Add or refactor:

- `authGoogleService.ts`
  - build Google auth URL
  - verify callback identity
  - find/create/link user
  - create role profile if needed
  - enforce approval rules
  - return authenticated user/session data

Likely updates needed in:

- `Backend/src/models/userModel.ts`
- `Backend/src/routes/authRoutes.ts`
- `Backend/src/controllers/authController.ts`
- `Backend/src/services/auth/authRegistrationService.ts`
- `Backend/src/services/auth/authLoginService.ts`
- `Backend/src/utils/types/authTypes.ts`
- `Backend/src/configuration/env.ts`

### Frontend

Likely updates needed in:

- `frontend/src/features/auth/components/LoginForm/index.tsx`
- `frontend/src/features/auth/pages/LoginPage/index.tsx`
- `frontend/src/features/auth/constants/authConstants.ts`
- `frontend/src/features/auth/api/authApi.ts`
- `frontend/src/routes/AppRoutes.tsx`

## Security and Industry Practices

### Recommended

- Verify Google tokens server-side only
- Use state parameter to protect OAuth flow
- Keep app session in secure HTTP-only cookie
- Never trust email/provider data from frontend without backend verification
- Keep provider ID unique when present
- Prevent duplicate accounts for same email
- Log auth provider and last login timestamp
- Rate limit auth endpoints
- Return safe, generic auth errors

### Avoid

- Storing raw Google access tokens in user collection for login
- Replacing app authorization with Google tokens
- Creating separate duplicate users for same email
- Forcing HR/interviewer auto-approval just because Google login succeeded

## Risks to Plan For

### Data migration risk

If `passwordHash` becomes optional, local login code must handle missing password safely. Google-only users must not be allowed through password login unless a password is explicitly set later.

### Account linking risk

If linking is handled poorly, one email may accidentally create duplicate users or unsafe merges.

### Approval workflow risk

If Google login bypasses `isApproved`, HR/interviewer approval controls will break.

### UX risk

If Google login is added without onboarding logic, new users may log in successfully but land in incomplete profile states.

## Recommended Implementation Plan

### Phase 1: Design and schema

1. Extend `User` model with provider fields
2. Make `passwordHash` optional
3. Decide linking rules for existing local accounts
4. Add env variables for Google auth dedicated to sign-in

### Phase 2: Backend auth flow

1. Add Google login endpoints under `/api/auth`
2. Implement OAuth state handling
3. Verify Google callback identity
4. Find or create user by email/provider
5. Create role profile automatically for new users
6. Enforce approval rules
7. Set existing auth cookie

### Phase 3: Frontend UX

1. Add "Continue with Google" button
2. Add loading and failure handling for OAuth callback
3. Refresh current user after Google login
4. Reuse existing modal/pending approval messaging

### Phase 4: Testing

1. Unit tests for Google user creation/linking
2. Tests for candidate auto-approval behavior
3. Tests for HR/interviewer pending approval behavior
4. Tests for duplicate email handling
5. Tests for Google-only user blocked from password login

## Suggested Final Implementation Decision

Best path for this project:

- Keep current email/password login
- Add Google sign-in as an additional auth method
- Reuse existing cookie session and authorization middleware
- Add provider fields to the `User` model
- Auto-verify Google email
- Keep current approval rules by role
- Link by unique email instead of creating duplicate users

## Work Estimate

### Moderate scope

- Backend schema and auth flow changes: medium
- Frontend auth UI changes: small to medium
- Testing and edge-case handling: medium

Overall:

- Roughly 2 to 4 focused implementation sessions if done carefully with tests

## Recommended Next Decisions Before Coding

These should be finalized first:

1. Should Google sign-up be allowed for all roles or only candidates first?
2. Should existing local users with same email be auto-linked to Google?
3. Should Google login live under `/api/auth/google/*` and replace the current standalone `/api/google/*` auth naming for user login?
4. Do you want redirect-based OAuth or frontend Google Identity Services?

## My Recommendation

Start with this first release:

1. Add Google sign-in for candidates only
2. Keep HR and interviewer on current flow initially
3. Reuse app cookie-based session
4. Link by email for existing candidate accounts
5. After this stabilizes, expand to HR/interviewer with approval-safe onboarding

This reduces risk and fits industry practice for phased rollout.
