import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { FastifyPostgresTemplateStack } from "../lib/fastify-postgres-template-stack";

test("Stack creates expected resources", () => {
  const app = new cdk.App();
  const stack = new FastifyPostgresTemplateStack(app, "TestStack");
  const template = Template.fromStack(stack);

  // TODO: Add assertions as you implement resources
  // Example:
  // template.hasResourceProperties("AWS::RDS::DBInstance", {
  //   Engine: "postgres",
  // });

  // Placeholder assertion - verify stack name output exists
  template.hasOutput("StackName", {
    Description: "Name of this CDK stack",
  });
});

