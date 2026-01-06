# AWS CDK Infrastructure

This directory contains the AWS CDK code for provisioning the infrastructure needed to run the Fastify PostgreSQL Template application.

## Prerequisites

- Node.js 20+
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed: `npm install -g aws-cdk`

## Setup

1. Install dependencies:

   ```bash
   cd resources/infra/cdk
   npm install
   ```

2. Bootstrap CDK (first time only):
   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## Available Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile
- `npm run test` - Run unit tests
- `cdk synth` - Synthesize CloudFormation template
- `cdk deploy` - Deploy this stack to your default AWS account/region
- `cdk diff` - Compare deployed stack with current state
- `cdk destroy` - Destroy the stack

## Stack Structure

The `FastifyPostgresTemplateStack` currently contains placeholder code. You'll need to implement:

- **VPC**: Network infrastructure with public and private subnets
- **RDS**: PostgreSQL database instance
- **ECS**: Container orchestration for API and worker services
- **SNS**: Event publishing topics
- **SQS**: Event processing queues
- **ALB**: Application Load Balancer for the API
- **Security Groups**: Network security rules
- **IAM Roles**: Permissions for ECS tasks

## Environment Variables

Set these environment variables before deploying:

- `CDK_DEFAULT_ACCOUNT` - Your AWS account ID
- `CDK_DEFAULT_REGION` - Your preferred AWS region

Or specify them in the stack props in `bin/app.ts`.

## Notes

- This is a placeholder implementation. Uncomment and implement the TODO sections in `lib/fastify-postgres-template-stack.ts`
- Adjust resource sizes (instance types, memory, CPU) based on your needs
- Consider enabling deletion protection for production databases
- Review and adjust security group rules for your use case
