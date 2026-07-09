# Google Sign-In Role Analysis Report

## Summary

Current Google sign-in behavior is safe for candidates, but incomplete for HR and interviewer onboarding.

- If a Google user is created without a role in the OAuth start request, the backend defaults the account to `candidate`.
- If the role is explicitly passed as `hr` or `interviewer`, the backend can create that role correctly.
- Only `candidate` is auto-approved after Google sign-in.
- `hr` and `interviewer` remain pending approval, which is the correct safety behavior.

## Current Implementation

### Role assignment

In [authGoogleService.ts](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/Backend/src/services/auth/authGoogleService.ts#L73):

- `resolveNewUserRole(role)` returns the provided role.
- If no role is provided, it falls back to `candidate`.

This means:

- Login page Google button without role selection creates candidate users by default.
- Registration flow can support Google for `hr`, `candidate`, and `interviewer` if the selected role is passed into `/api/auth/google?role=...`.

### Approval behavior

In [authGoogleService.ts](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/Backend/src/services/auth/authGoogleService.ts#L124):

- `candidate` gets `isApproved = true`
- `hr` and `interviewer` get `isApproved = false`

This is a good control because HR/interviewer accounts should not become active just because Google verified email ownership.

### Existing-user behavior

When an existing local user signs in with Google:

- The system links the Google identity to the existing email-matched account.
- If the existing role is `candidate`, approval is auto-restored to `true`.
- Existing `hr` and `interviewer` accounts are not auto-approved by Google login.

## Main Problem

The current UX makes Google sign-in feel like a candidate-only flow because the common entry point is the login page, and that button does not ask for or preserve a role.

So in practice:

- Candidate onboarding works.
- HR/interviewer onboarding is not clearly guided.
- New HR/interviewer users may accidentally create candidate accounts if they start from the generic login page.

## Risk Analysis

### If we keep current behavior unchanged

Pros:

- Safe for candidate onboarding
- No accidental HR/interviewer auto-approval

Cons:

- Confusing for HR/interviewer users
- Wrong-role account creation is likely
- Admin cleanup may be needed for mis-registered users

### If we auto-approve HR/interviewer through Google

This is not recommended.

Risks:

- Anyone with a Google account could gain privileged access if role selection is abused
- HR approval workflow would be bypassed
- Interview scheduling and staff-only features could become exposed incorrectly

## Recommended Options

### Option 1: Candidate-only Google sign-up for now

Best if you want the safest short-term rollout.

Behavior:

- Keep Google button on login and candidate registration only
- Hide or disable Google sign-up for HR/interviewer registration
- Keep HR/interviewer on email/password + admin approval flow

Pros:

- Lowest risk
- Simple UX
- Matches current implementation closely

Cons:

- HR/interviewer do not get Google onboarding yet

### Option 2: Allow Google sign-up for all roles, but preserve approval gates

Best if you want full role coverage without weakening security.

Behavior:

- Add Google sign-up buttons on role-aware registration screens
- Pass selected role into `/api/auth/google?role=hr` or `/api/auth/google?role=interviewer`
- Create the correct role-specific profile record
- Keep `isApproved = false` for HR/interviewer
- After Google callback, redirect pending HR/interviewer users back to login with approval-pending messaging

Pros:

- Supports all roles
- Keeps approval security intact
- Fits current backend design

Cons:

- Needs clearer frontend messaging
- Needs protection against starting from the wrong screen

### Option 3: Invitation-based Google onboarding for HR/interviewer

Best if HR/interviewer creation should be tightly controlled.

Behavior:

- Only candidates can self-register with Google
- HR/interviewer must be invited by admin or pre-created by admin
- Google can only link to an existing approved/pending staff account by matching email

Pros:

- Strongest control
- Prevents unauthorized staff self-registration
- Good for enterprise-style workflows

Cons:

- More implementation work
- Less flexible for open onboarding

## Best Recommendation

Recommended path: **Option 2 with guardrails**, or **Option 1 if you want a phased rollout**.

Practical recommendation:

1. Keep candidate Google onboarding active now.
2. Add Google buttons to registration only, not generic login, for new HR/interviewer creation.
3. Pass the selected role through the OAuth start route.
4. Keep HR/interviewer pending admin approval after Google sign-in.
5. Show a clear message like: "Your account was created and is waiting for admin approval."

If your organization wants tighter control over staff creation, use Option 3 instead.

## Suggested UX Rules

- Login page Google button:
  Use for existing users only, or treat no-role login as candidate-safe only.
- Registration page Google button:
  Use selected role from the form.
- HR/interviewer Google registration:
  Show a notice before redirect: "Google verifies your email, but admin approval is still required."
- If a user tries to log in with Google and the account is pending:
  Show approval-pending modal, not a generic login error.

## Suggested Technical Changes

### Frontend

- Add Google sign-up button to register flow with selected role.
- Ensure the selected role is passed to `buildGoogleAuthUrl(role)`.
- Consider hiding Google sign-up for HR/interviewer if you choose Option 1.

### Backend

- Keep current approval logic for HR/interviewer.
- Optionally reject unsupported Google self-registration roles if you choose candidate-only rollout.
- Consider adding an explicit config flag such as:
  - `GOOGLE_SELF_SIGNUP_ALLOWED_ROLES=candidate`
  - or `GOOGLE_SELF_SIGNUP_ALLOWED_ROLES=candidate,hr,interviewer`

### Admin workflow

- Keep pending approvals page as the source of truth for staff approval.
- Consider adding a filter to identify Google-created HR/interviewer accounts quickly.

## Conclusion

The current system does not fundamentally force Google users to be candidates. It defaults to `candidate` only when no role is provided.

So the real issue is not backend capability, but onboarding design:

- candidate is fully supported
- HR/interviewer are technically possible
- the UX and policy around staff sign-up need to be defined clearly

## Files Reviewed

- [authGoogleService.ts](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/Backend/src/services/auth/authGoogleService.ts)
- [authController.ts](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/Backend/src/controllers/authController.ts)
- [GoogleSignInButton](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/frontend/src/features/auth/components/GoogleSignInButton/index.tsx)
- [googleAuth.ts](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/frontend/src/features/auth/utils/googleAuth.ts)
- [google-auth-plan-report.md](/c:/Users/rahul.chouhan/OneDrive%20-%20InTimeTec%20Visionsoft%20Pvt.%20Ltd.,/Desktop/RecruitmentApllication/RecruitmentApplication/docs/google-auth-plan-report.md)
