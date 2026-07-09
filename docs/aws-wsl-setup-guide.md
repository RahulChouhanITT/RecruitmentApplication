# AWS WSL Setup Guide

## Goal

Set up AWS access inside WSL so you can push Docker images to ECR and deploy to ECS.

## Current Choices

- AWS region: `us-east-1`
- AWS profile name: `rahul`
- deployment target: `ECS Fargate`
- database: `MongoDB Atlas`
- domain base: `hireme`

## Step 1. Install AWS CLI in WSL

Run:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

## Step 2. Get AWS credentials

You need one of these from your AWS admin:

- IAM access key ID and secret access key
- AWS IAM Identity Center / SSO access

If you do not have either one yet, ask for:

- programmatic access for CLI use in WSL
- permission for `ECR`, `ECS`, `IAM`, `CloudWatch`, `Secrets Manager`, and `EC2` networking read/create actions needed for deployment

## Step 3. Configure AWS CLI with profile `rahul`

If you get access key and secret key, run:

```bash
aws configure --profile rahul
```

Use:

- AWS Access Key ID: `<from-admin>`
- AWS Secret Access Key: `<from-admin>`
- Default region name: `us-east-1`
- Default output format: `json`

## Step 4. Verify access

Run:

```bash
aws sts get-caller-identity --profile rahul
```

If it works, WSL is ready for AWS deployment commands.

## Step 5. Check Docker from WSL

Run:

```bash
docker --version
docker compose version
```

## Step 6. When WSL access is ready

You can then run:

```bash
aws ecr create-repository --repository-name recruitmentapp-frontend --region us-east-1 --profile rahul
aws ecr create-repository --repository-name recruitmentapp-backend --region us-east-1 --profile rahul
```

## Domain Decision Still Needed

You still need to choose the exact public domain names. Recommended pattern:

- `app.hireme.<your-tld>`
- `api.hireme.<your-tld>`

Examples:

- `app.hireme.com`
- `api.hireme.com`

or

- `app.hireme.in`
- `api.hireme.in`

## MongoDB Decision Still Needed

Recommended:

- use `MongoDB Atlas`
- create one production cluster
- create one database user
- allow ECS access to the cluster

## Tell Codex When Ready

After Step 4 succeeds, share:

- the output status of `aws sts get-caller-identity --profile rahul`
- your exact frontend domain
- your exact backend domain
- whether MongoDB Atlas is created

Then the next deployment commands can be prepared with your real values.
