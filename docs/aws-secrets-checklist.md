# AWS Secrets Checklist

## Goal

Prepare clean production secrets before deploying to AWS.

## Important

Do not reuse the current local Docker secret values for production.

You should create fresh values for:

- JWT secret
- Google OAuth credentials
- Google refresh token
- SMTP credentials
- Cloudinary credentials

## Backend Secrets To Create

Create these in AWS Secrets Manager:

- `recruitmentapp/prod/MONGO_DATABASE_URL`
- `recruitmentapp/prod/FRONTEND_ORIGIN`
- `recruitmentapp/prod/JWT_SECRET_KEY`
- `recruitmentapp/prod/GOOGLE_CLIENT_ID`
- `recruitmentapp/prod/GOOGLE_CLIENT_SECRET`
- `recruitmentapp/prod/GOOGLE_REDIRECT_URI`
- `recruitmentapp/prod/GOOGLE_AUTH_REDIRECT_URI`
- `recruitmentapp/prod/GOOGLE_REFRESH_TOKEN`
- `recruitmentapp/prod/GOOGLE_CALENDAR_ID`
- `recruitmentapp/prod/SMTP_HOST`
- `recruitmentapp/prod/SMTP_PORT`
- `recruitmentapp/prod/SMTP_USER`
- `recruitmentapp/prod/SMTP_PASS`
- `recruitmentapp/prod/SMTP_FROM_NAME`
- `recruitmentapp/prod/SMTP_FROM_EMAIL`
- `recruitmentapp/prod/CLOUDINARY_CLOUD_NAME`
- `recruitmentapp/prod/CLOUDINARY_API_KEY`
- `recruitmentapp/prod/CLOUDINARY_API_SECRET`

## Values You Need To Decide

- exact frontend production domain
- exact backend production domain
- MongoDB Atlas connection string
- production SMTP provider
- production Google OAuth app
- production Cloudinary account

## Recommended Example Values

- `FRONTEND_ORIGIN=https://app.yourdomain.com`
- `GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/google/oauth/token/callback`
- `GOOGLE_AUTH_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback`
- `GOOGLE_CALENDAR_ID=primary`

## Commands To Create Secrets From WSL

Replace:

- `<region>`
- `<secret-name>`
- `<secret-value>`

```bash
aws secretsmanager create-secret \
  --region <region> \
  --name <secret-name> \
  --secret-string '<secret-value>'
```

## Commands To Update Existing Secrets From WSL

```bash
aws secretsmanager put-secret-value \
  --region <region> \
  --secret-id <secret-name> \
  --secret-string '<secret-value>'
```

## Your Input Needed

Before deployment, you need to provide or create:

- AWS account access
- AWS account access in WSL
- exact production domain names
- MongoDB Atlas cluster
- fresh Google credentials
- fresh SMTP credentials
- fresh Cloudinary credentials
