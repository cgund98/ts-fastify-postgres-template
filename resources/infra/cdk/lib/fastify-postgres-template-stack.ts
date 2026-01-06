import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as ecs from "aws-cdk-lib/aws-ecs";
// import * as ec2 from "aws-cdk-lib/aws-ec2";
// import * as rds from "aws-cdk-lib/aws-rds";
// import * as sns from "aws-cdk-lib/aws-sns";
// import * as sqs from "aws-cdk-lib/aws-sqs";
// import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

/**
 * Main CDK Stack for Fastify PostgreSQL Template
 *
 * This stack provisions the AWS infrastructure needed to run the Fastify application:
 * - RDS PostgreSQL database
 * - ECS Fargate service for the API
 * - ECS Fargate service for the worker
 * - SNS topics for event publishing
 * - SQS queues for event consumption
 * - Application Load Balancer
 * - VPC and networking components
 *
 * TODO: Implement the following resources:
 * 1. VPC with public and private subnets
 * 2. RDS PostgreSQL instance in private subnet
 * 3. ECS Cluster
 * 4. ECS Fargate service for API (with ALB)
 * 5. ECS Fargate service for worker
 * 6. SNS topics for events
 * 7. SQS queues for event processing
 * 8. Security groups and IAM roles
 * 9. CloudWatch logs and monitoring
 */
export class FastifyPostgresTemplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: Create VPC with public and private subnets
    // const vpc = new ec2.Vpc(this, "Vpc", {
    //   maxAzs: 2,
    //   natGateways: 1,
    // });

    // TODO: Create RDS PostgreSQL instance
    // const database = new rds.DatabaseInstance(this, "Database", {
    //   engine: rds.DatabaseInstanceEngine.postgres({
    //     version: rds.PostgresEngineVersion.VER_16,
    //   }),
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T3,
    //     ec2.InstanceSize.MICRO
    //   ),
    //   vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //   },
    //   multiAz: false,
    //   deletionProtection: false,
    // });

    // TODO: Create ECS Cluster
    // const cluster = new ecs.Cluster(this, "Cluster", {
    //   vpc,
    // });

    // TODO: Create SNS topics
    // const eventTopic = new sns.Topic(this, "EventTopic", {
    //   topicName: "fastify-postgres-template-events",
    // });

    // TODO: Create SQS queues
    // const userCreatedQueue = new sqs.Queue(this, "UserCreatedQueue", {
    //   queueName: "user-created-events",
    // });
    // const userUpdatedQueue = new sqs.Queue(this, "UserUpdatedQueue", {
    //   queueName: "user-updated-events",
    // });

    // TODO: Create ECS Task Definition for API
    // const apiTaskDefinition = new ecs.FargateTaskDefinition(this, "ApiTaskDef", {
    //   memoryLimitMiB: 512,
    //   cpu: 256,
    // });

    // TODO: Create ECS Task Definition for Worker
    // const workerTaskDefinition = new ecs.FargateTaskDefinition(this, "WorkerTaskDef", {
    //   memoryLimitMiB: 512,
    //   cpu: 256,
    // });

    // TODO: Create Application Load Balancer
    // const loadBalancer = new elbv2.ApplicationLoadBalancer(this, "LoadBalancer", {
    //   vpc,
    //   internetFacing: true,
    // });

    // TODO: Create ECS Fargate service for API
    // const apiService = new ecs.FargateService(this, "ApiService", {
    //   cluster,
    //   taskDefinition: apiTaskDefinition,
    //   desiredCount: 1,
    // });

    // TODO: Create ECS Fargate service for Worker
    // const workerService = new ecs.FargateService(this, "WorkerService", {
    //   cluster,
    //   taskDefinition: workerTaskDefinition,
    //   desiredCount: 1,
    // });

    // Outputs
    // new cdk.CfnOutput(this, "LoadBalancerDns", {
    //   value: loadBalancer.loadBalancerDnsName,
    //   description: "DNS name of the load balancer",
    // });

    // new cdk.CfnOutput(this, "DatabaseEndpoint", {
    //   value: database.instanceEndpoint.hostname,
    //   description: "RDS PostgreSQL endpoint",
    // });

    // Placeholder output to verify stack deployment
    new cdk.CfnOutput(this, "StackName", {
      value: this.stackName,
      description: "Name of this CDK stack",
    });
  }
}
