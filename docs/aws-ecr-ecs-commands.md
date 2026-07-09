# AWS ECR and ECS Commands

## Confirmed Values

- AWS account: `386785029718`
- AWS region: `us-east-1`
- AWS CLI profile: `rahul`
- frontend domain: `app.hireme.com`

## Assumption

This command sheet assumes the backend domain will be:

- `api.hireme.com`

If you want a different backend domain, tell me and I will update the docs.

## 1. Verify AWS access

```bash
aws sts get-caller-identity --profile rahul
```

## 2. Create ECR repositories

```bash
aws ecr create-repository --repository-name recruitmentapp-frontend --region us-east-1 --profile rahul
aws ecr create-repository --repository-name recruitmentapp-backend --region us-east-1 --profile rahul
```

## 3. Log in Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 --profile rahul | docker login --username AWS --password-stdin 386785029718.dkr.ecr.us-east-1.amazonaws.com
```

## 4. Build Docker images

Run from the repo root:

```bash
docker build -t recruitmentapp-frontend ./frontend
docker build -t recruitmentapp-backend ./Backend
```

## 5. Tag Docker images

```bash
docker tag recruitmentapp-frontend:latest 386785029718.dkr.ecr.us-east-1.amazonaws.com/recruitmentapp-frontend:latest
docker tag recruitmentapp-backend:latest 386785029718.dkr.ecr.us-east-1.amazonaws.com/recruitmentapp-backend:latest
```

## 6. Push Docker images

```bash
docker push 386785029718.dkr.ecr.us-east-1.amazonaws.com/recruitmentapp-frontend:latest
docker push 386785029718.dkr.ecr.us-east-1.amazonaws.com/recruitmentapp-backend:latest
```

## 7. Create ECS cluster

```bash
aws ecs create-cluster --cluster-name recruitmentapp-cluster --region us-east-1 --profile rahul
```

## 8. Create CloudWatch log groups

```bash
aws logs create-log-group --log-group-name /ecs/recruitmentapp-frontend --region us-east-1 --profile rahul
aws logs create-log-group --log-group-name /ecs/recruitmentapp-backend --region us-east-1 --profile rahul
```

## 9. Register task definitions

Run these after replacing the remaining role-name and image-tag placeholders:

```bash
aws ecs register-task-definition --cli-input-json file://deploy/aws/frontend-task-definition.json --region us-east-1 --profile rahul
aws ecs register-task-definition --cli-input-json file://deploy/aws/backend-task-definition.json --region us-east-1 --profile rahul
```

## Still Needed Before ECS Service Creation

- exact backend domain confirmation
- MongoDB Atlas connection string
- AWS Secrets Manager secret creation
- IAM execution role name
- IAM task role name
- ALB, ACM certificate, Route 53 records

## Recommended Next Step

Create the ECR repositories and log groups first. After that, prepare Secrets Manager values and MongoDB Atlas.
