# AWS Containerization and Deployment Plan

## Objective

Containerize the Recruitment Application safely, prepare it for production, and deploy it to AWS with a path that works from WSL.

## Confirmed Choices

- AWS region: `us-east-1`
- AWS CLI profile name: `rahul`
- runtime platform: `Amazon ECS Fargate`
- database: `MongoDB`
- project domain base: `hireme`

## Current Blocker

AWS access is now configured in WSL. The remaining blockers are production secrets, MongoDB Atlas setup, and final domain/DNS setup.

Setup guide added:

- `docs/aws-wsl-setup-guide.md`
- `docs/aws-ecr-ecs-commands.md`

## Execution Plan

### Phase 1. Repository preparation

Goal:

- make the repo easier to deploy repeatedly
- add missing deployment support files
- avoid production guesswork

Tasks:

- add backend health endpoint for ALB and ECS checks
- add `Backend/.env.example`
- add `frontend/.env.example`
- add `docker-compose.prod.yml` template
- keep the existing local Docker setup intact

Status:

- backend health endpoint: done
- backend env example: done
- frontend env example: done
- production compose template: done

### Phase 2. Secret and configuration cleanup

Goal:

- separate local development config from production secrets

Tasks:

- rotate existing local secrets
- remove real production-like secrets from tracked env files
- store production secrets in AWS Secrets Manager
- keep only example env files in the repo

Status:

- still needed

Blocking requirement:

- AWS CLI access in WSL

Support files added:

- `docs/aws-secrets-checklist.md`
- `deploy/aws/backend-task-definition.json`
- `deploy/aws/frontend-task-definition.json`
- `deploy/aws/README.md`

### Phase 3. Local production-style validation

Goal:

- test the app in containers before AWS deployment

Tasks:

- build frontend and backend containers
- run compose locally
- verify frontend, backend, MongoDB connectivity
- verify `/health` endpoint
- verify login, upload, email, Google auth, and chat basics

Status:

- still needed

### Phase 4. AWS image publishing

Goal:

- publish deployable images to ECR

Tasks:

- create ECR repositories
- log in from WSL
- build Docker images
- tag and push images

Status:

- still needed

### Phase 5. AWS runtime deployment

Goal:

- run the app safely in AWS

Tasks:

- create ECS cluster
- create frontend and backend task definitions
- inject backend secrets
- configure ALB, ACM, Route 53
- point backend to MongoDB Atlas
- deploy one backend task first

Status:

- still needed

### Phase 6. Scale and hardening

Goal:

- improve reliability after first deployment succeeds

Tasks:

- add Redis for shared socket state
- move rate limiting off in-memory storage
- add structured logging
- add CI/CD pipeline

Status:

- later phase

## Project Analysis

### Application structure

This repository is already split into two deployable parts:

- `frontend`
  - React 19 + Vite
  - built as static files
  - already has `frontend/Dockerfile`
  - already has `frontend/nginx.conf`
- `Backend`
  - Node.js + Express + TypeScript
  - Socket.IO for realtime notifications/chat
  - Mongoose for MongoDB
  - already has `Backend/Dockerfile`
- root
  - already has `docker-compose.yml`

### External dependencies detected

The backend depends on:

- MongoDB
- JWT secret
- frontend origin / CORS
- SMTP email provider
- Cloudinary
- Google OAuth
- Google Calendar / Meet integration

The frontend depends on:

- `VITE_API_BASE_URL` at build time

## What Already Exists

### Good news

The app is partly container-ready already:

- `Backend/Dockerfile` builds the TypeScript API and starts `dist/server.js`
- `frontend/Dockerfile` builds the Vite app and serves it with Nginx
- `docker-compose.yml` starts:
  - frontend
  - backend
  - mongo
- local Docker env files already exist:
  - `Backend/.env.docker`
  - `frontend/.env.docker`

### Current local container flow

Today the repo is designed roughly like this:

- frontend container on port `3001`
- backend container on port `5001`
- mongo container on port `27018`

## Production Gaps and Risks

### 1. Secrets are currently stored in local env files

The repository contains real-looking runtime secrets in Docker env files. Before any AWS deployment:

- rotate all backend secrets
- create fresh Google credentials
- create fresh SMTP credentials
- create fresh Cloudinary credentials
- do not reuse the current local secret values in cloud
- move secrets to AWS Secrets Manager or SSM Parameter Store

This is the highest-priority security task.

### 2. Backend env loading is file-based

The backend loads env from `Backend/.env` through `src/configuration/env.ts`.

That works locally, but in AWS we should rely on real container environment variables or secrets injection, not a checked-in `.env` file.

The new `Backend/.env.example` helps standardize that transition, but secret injection is still a deployment task to complete.

### 3. Socket.IO is single-instance friendly, not horizontally scalable yet

Current realtime behavior uses in-memory state:

- socket presence store uses local memory
- notification dispatch relies on the current Node instance
- rate limiting also uses local memory

This means:

- one backend task is fine for initial deployment
- multiple backend tasks can cause inconsistent socket presence and rate limits
- scaling the backend will eventually require shared state such as Redis

### 4. Backend auth uses cookies and CORS

The app depends on cookie-based auth with:

- `withCredentials: true` in frontend axios and socket client
- `cors({ origin: env.FRONTEND_ORIGIN, credentials: true })` in backend
- secure cookies in production

So production needs:

- HTTPS
- correct frontend and backend domain strategy
- exact CORS origin config
- correct proxy headers and cookie behavior

### 5. Frontend API URL is build-time configuration

The frontend uses `VITE_API_BASE_URL` during build.

That means:

- the frontend image must be built with the correct production API URL
- if the API URL changes, rebuild the frontend image

The new `frontend/.env.example` documents the required variable.

### 6. MongoDB choice matters

This project uses Mongoose. For fastest reliable deployment, prefer:

- MongoDB Atlas on AWS

Safer first-deployment choice than:

- self-managed MongoDB on EC2
- DocumentDB without compatibility validation

## Recommended AWS Target Architecture

### Recommended first production architecture

Use:

- Amazon ECR for container images
- Amazon ECS Fargate for running containers
- Application Load Balancer for HTTPS and routing
- AWS Certificate Manager for SSL certificate
- Route 53 for DNS
- AWS Secrets Manager for backend secrets
- MongoDB Atlas for database

### Deployment shape

#### Frontend

Option A, recommended:

- keep frontend containerized
- run Nginx frontend container in ECS
- expose through ALB

Option B, more cloud-native:

- do not run frontend in ECS
- build static frontend and deploy to S3 + CloudFront

Because your request is specifically to containerize the app, Option A is the better match for now.

#### Backend

- deploy one ECS Fargate service initially
- attach ALB target group
- run on port `5000` inside the container
- inject env via Secrets Manager / ECS task definition

#### Database

- use MongoDB Atlas
- allow ECS outbound access to Atlas
- whitelist the ECS egress IP strategy or use Atlas network rules carefully

## Recommended Domain Strategy

Use separate subdomains:

- frontend: `app.yourdomain.com`
- backend: `api.yourdomain.com`

Set:

- frontend `VITE_API_BASE_URL=https://api.yourdomain.com`
- backend `FRONTEND_ORIGIN=https://app.yourdomain.com`
- Google redirect URIs to the final backend domain

Recommended naming for your app:

- frontend: `app.hireme.<your-tld>`
- backend: `api.hireme.<your-tld>`

You still need to choose the exact TLD such as `.com` or `.in`.

## Recommended Deployment Phases

### Phase 1. Local container validation

Goal:

- make sure Docker build and compose startup work cleanly
- verify backend can reach Mongo
- verify frontend can talk to backend

### Phase 2. Production hardening

Before AWS:

- rotate all secrets
- create production env values
- remove reliance on checked-in secrets
- confirm cookie settings in production
- confirm Google OAuth redirect URLs
- confirm email sender configuration
- confirm Cloudinary production account

### Phase 3. AWS image publishing

- create ECR repositories
- build images from WSL
- tag and push images

### Phase 4. ECS deployment

- create ECS cluster
- create task definitions
- create services
- attach ALB
- inject secrets

### Phase 5. Post-deploy validation

- verify login
- verify cookies
- verify Google login
- verify resume upload
- verify email flow
- verify notifications and chat

## What We Need Before Deployment

### Infrastructure requirements

- AWS account
- IAM user or role with ECR, ECS, ALB, CloudWatch, Secrets Manager access
- Route 53 hosted zone or external DNS control
- ACM certificate
- MongoDB Atlas cluster

### Application requirements

- production backend env values
- production frontend API URL
- production Google OAuth credentials
- production SMTP credentials
- production Cloudinary credentials

### Recommended code changes before production

These are not strictly required for a first single-instance deployment, but they are strongly recommended.

#### High priority

- load backend env cleanly from runtime env in ECS, not only from local `.env`
- add health endpoint such as `/health`
- add reverse-proxy awareness if needed for secure cookies and IP handling
- stop storing secrets in tracked files

#### Medium priority

- add Redis for shared socket presence if you want multi-instance backend
- move rate limiting to Redis-backed storage
- add structured logging
- add CI build pipeline

#### Nice to have

- split frontend deployment to S3 + CloudFront later
- add IaC using Terraform or AWS CDK

## WSL Commands for Local Docker Work

### 1. Move into the repo from WSL

```bash
cd "/mnt/c/Users/rahul.chouhan/OneDrive - InTimeTec Visionsoft Pvt. Ltd./Desktop/RecruitmentApllication/RecruitmentApplication"
```

### 2. Verify Docker is available inside WSL

```bash
docker --version
docker compose version
```

### 3. Build all containers

```bash
docker compose build
```

### 4. Start the full stack

```bash
docker compose up -d
```

### 4a. Check backend health

```bash
curl http://localhost:5001/health
```

### 5. See running containers

```bash
docker compose ps
```

### 6. Follow logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### 7. Stop the stack

```bash
docker compose down
```

### 8. Rebuild from scratch if needed

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Useful Local Validation Commands

### Backend

```bash
curl http://localhost:5001
curl http://localhost:5001/api/jobs
```

### Frontend

```bash
curl -I http://localhost:3001
```

### Docker status

```bash
docker images
docker ps
```

## WSL Commands for AWS CLI Setup

### 1. Install AWS CLI in WSL if needed

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. Configure credentials

```bash
aws configure
```

### 3. Confirm account access

```bash
aws sts get-caller-identity
```

### 4. If you do not have AWS access in WSL yet

You need one of these from your AWS admin:

- IAM access key + secret key
- AWS IAM Identity Center / SSO access

Without one of those, we can prepare files locally but cannot deploy from WSL.

Recommended command after setup:

```bash
aws sts get-caller-identity --profile rahul
```

## WSL Commands to Push Images to ECR

Replace:

- `<region>` with `us-east-1`
- `<account-id>`

### 1. Create repositories

```bash
aws ecr create-repository --repository-name recruitmentapp-frontend --region <region>
aws ecr create-repository --repository-name recruitmentapp-backend --region <region>
```

### 2. Log in to ECR

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
```

### 3. Build images

```bash
docker build -t recruitmentapp-frontend ./frontend
docker build -t recruitmentapp-backend ./Backend
```

### 4. Tag images

```bash
docker tag recruitmentapp-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/recruitmentapp-frontend:latest
docker tag recruitmentapp-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/recruitmentapp-backend:latest
```

### 5. Push images

```bash
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/recruitmentapp-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/recruitmentapp-backend:latest
```

## High-Level ECS Deployment Steps

### 1. Create cluster

```bash
aws ecs create-cluster --cluster-name recruitmentapp-cluster --region <region>
```

### 2. Create secrets in Secrets Manager

Examples:

- `recruitmentapp/prod/backend`
- individual secret keys for:
  - `MONGO_DATABASE_URL`
  - `JWT_SECRET_KEY`
  - `FRONTEND_ORIGIN`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM_NAME`
  - `SMTP_FROM_EMAIL`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
  - `GOOGLE_AUTH_REDIRECT_URI`
  - `GOOGLE_REFRESH_TOKEN`
  - `GOOGLE_CALENDAR_ID`

### 3. Create task definitions

You will need:

- one task definition for frontend
- one task definition for backend
- CPU/memory sizing
- container port mapping
- log configuration to CloudWatch
- secret injection for backend

### 4. Create services

You will need:

- frontend ECS service
- backend ECS service
- ALB listener rules
- target groups
- security groups

### 5. Enable HTTPS

You will need:

- ACM certificate
- ALB HTTPS listener on `443`
- DNS records in Route 53

## Suggested First ECS Sizing

### Frontend

- `0.25 vCPU`
- `0.5 GB RAM`

### Backend

- `0.5 vCPU`
- `1 GB RAM`

Increase after load testing.

## Important Production Checks

### Cookies and auth

Verify:

- auth cookie is set in browser
- secure cookie works over HTTPS
- login survives page reload
- frontend origin matches backend `FRONTEND_ORIGIN`

### Google OAuth

Verify:

- Google console redirect URIs match exact production callback URLs
- backend callback domain is HTTPS
- frontend redirects back correctly after auth

### Socket.IO

Verify:

- realtime notifications connect over ALB
- websocket upgrade succeeds
- chat and presence work with one backend task

## Best First Deployment Strategy

For this project, the safest first production rollout is:

1. Keep one frontend container
2. Keep one backend container
3. Use MongoDB Atlas
4. Deploy both containers to ECS Fargate
5. Use ALB + ACM + Route 53
6. Use Secrets Manager for backend env
7. Run only one backend task initially

That avoids early scaling bugs with in-memory socket state.

## Future Scale-Up Plan

When traffic grows, do this next:

1. Add Redis
2. Move Socket.IO scaling to Redis adapter
3. Move rate limit storage to Redis
4. Run multiple backend ECS tasks
5. Add autoscaling

## Final Recommendation

This project is close to being container-deployable already. The main work is not writing Dockerfiles from scratch, but production hardening:

- secure secret management
- AWS infrastructure setup
- correct domain/CORS/cookie configuration
- single-instance realtime strategy for first launch

## Changes Made In This Step

- added backend health endpoint at `GET /health`
- added `Backend/.env.example`
- added `frontend/.env.example`
- added `docker-compose.prod.yml`
- added AWS ECS task definition templates
- added AWS secrets checklist

## Files Reviewed

- `docker-compose.yml`
- `Backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `Backend/src/configuration/env.ts`
- `Backend/src/server.ts`
- `Backend/src/app.ts`
- `Backend/src/utils/auth/cookieHelper.ts`
- `Backend/src/middleware/rateLimitMiddleware.ts`
- `Backend/src/socket/socketServer.ts`
- `Backend/src/socket/services/presenceStore.ts`
- `frontend/src/utils/api/axiosBaseQuery.ts`
- `frontend/src/app/socket/SocketProvider.tsx`
