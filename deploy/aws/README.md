# AWS Deployment Templates

This folder contains starter templates for deploying the application to AWS ECS Fargate.

## Files

- `backend-task-definition.json`
- `frontend-task-definition.json`

## Before Use

Replace these placeholders:

- `<region>`
- `<account-id>`
- `<execution-role-name>`
- `<task-role-name>`
- `<backend-image-tag>`
- `<frontend-image-tag>`
- secret ARNs
- log group names

## Notes

- backend container port is `5000`
- frontend container port is `80`
- ALB health check path for backend should be `/health`
- start with one backend task because Socket.IO presence and rate limiting are in memory
