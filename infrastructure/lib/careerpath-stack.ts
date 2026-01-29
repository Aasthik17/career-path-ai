import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';

export class CareerPathStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ============================================================
        // S3 BUCKETS
        // ============================================================

        // Bucket for user resume uploads
        const resumeBucket = new s3.Bucket(this, 'ResumeBucket', {
            bucketName: `careerpath-resumes-${this.account}`,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.GET],
                    allowedOrigins: ['*'], // Restrict in production
                    allowedHeaders: ['*'],
                },
            ],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Bucket for knowledge base source data (jobs, skills, resources)
        const sourceDataBucket = new s3.Bucket(this, 'SourceDataBucket', {
            bucketName: `careerpath-sourcedata-${this.account}`,
            versioned: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // ============================================================
        // IAM - Reference hackathon service role
        // ============================================================

        // Reference the existing hackathon Bedrock KB role
        const bedrockKbRole = iam.Role.fromRoleName(
            this,
            'HackathonBedrockKbRole',
            'hackathon-bedrock-kb-role'
        );

        // Lambda execution role with Bedrock permissions
        const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
            roleName: 'careerpath-lambda-role',
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        // Bedrock permissions for Lambda
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'bedrock:InvokeModel',
                    'bedrock:InvokeModelWithResponseStream',
                    'bedrock:Retrieve',
                    'bedrock:RetrieveAndGenerate',
                ],
                resources: [
                    `arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0`,
                    `arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0`,
                    `arn:aws:bedrock:us-east-1:${this.account}:knowledge-base/*`,
                ],
            })
        );

        // S3 permissions for Lambda
        lambdaRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
                resources: [
                    resumeBucket.bucketArn,
                    `${resumeBucket.bucketArn}/*`,
                    sourceDataBucket.bucketArn,
                    `${sourceDataBucket.bucketArn}/*`,
                ],
            })
        );

        // ============================================================
        // COGNITO - User Authentication
        // ============================================================

        const userPool = new cognito.UserPool(this, 'CareerPathUserPool', {
            userPoolName: 'careerpath-users',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
            standardAttributes: {
                email: { required: true, mutable: true },
                fullname: { required: false, mutable: true },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const userPoolClient = new cognito.UserPoolClient(this, 'CareerPathUserPoolClient', {
            userPool,
            userPoolClientName: 'careerpath-web-client',
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            generateSecret: false,
        });

        // ============================================================
        // LAMBDA FUNCTIONS
        // ============================================================

        // Common Lambda environment variables
        const commonEnv = {
            RESUME_BUCKET: resumeBucket.bucketName,
            SOURCE_DATA_BUCKET: sourceDataBucket.bucketName,
            BEDROCK_REGION: 'us-east-1',
            EMBEDDING_MODEL_ID: 'amazon.titan-embed-text-v2:0',
            GENERATION_MODEL_ID: 'amazon.nova-pro-v1:0',
            // Knowledge Base ID will be set after manual creation
            KNOWLEDGE_BASE_ID: process.env.KNOWLEDGE_BASE_ID || 'PLACEHOLDER_KB_ID',
        };

        // Lambda Layer for shared dependencies
        const dependenciesLayer = new lambda.LayerVersion(this, 'DependenciesLayer', {
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/layers/dependencies')),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
            description: 'Shared Python dependencies for CareerPath AI',
        });

        // Resume Parser Lambda
        const resumeParserFn = new lambda.Function(this, 'ResumeParserFunction', {
            functionName: 'careerpath-resume-parser',
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'handler.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/resume-parser')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(60),
            memorySize: 512,
            environment: commonEnv,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // Embedding Pipeline Lambda
        const embeddingPipelineFn = new lambda.Function(this, 'EmbeddingPipelineFunction', {
            functionName: 'careerpath-embedding-pipeline',
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'handler.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/embedding-pipeline')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(120),
            memorySize: 512,
            environment: commonEnv,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // RAG Retriever Lambda
        const ragRetrieverFn = new lambda.Function(this, 'RagRetrieverFunction', {
            functionName: 'careerpath-rag-retriever',
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'handler.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/rag-retriever')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(60),
            memorySize: 512,
            environment: commonEnv,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // Agent Orchestrator Lambda
        const agentOrchestratorFn = new lambda.Function(this, 'AgentOrchestratorFunction', {
            functionName: 'careerpath-agent-orchestrator',
            runtime: lambda.Runtime.PYTHON_3_11,
            handler: 'handler.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/agent-orchestrator')),
            role: lambdaRole,
            timeout: cdk.Duration.seconds(300),
            memorySize: 1024,
            environment: commonEnv,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // ============================================================
        // API GATEWAY
        // ============================================================

        const api = new apigateway.RestApi(this, 'CareerPathApi', {
            restApiName: 'CareerPath AI API',
            description: 'API for CareerPath AI Career Mentor',
            deployOptions: {
                stageName: 'v1',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
                metricsEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
            },
        });

        // Cognito Authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [userPool],
            authorizerName: 'careerpath-authorizer',
        });

        // API Resources and Methods
        const resumeResource = api.root.addResource('resume');
        resumeResource.addMethod('POST', new apigateway.LambdaIntegration(resumeParserFn), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const embedResource = api.root.addResource('embed');
        embedResource.addMethod('POST', new apigateway.LambdaIntegration(embeddingPipelineFn), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const retrieveResource = api.root.addResource('retrieve');
        retrieveResource.addMethod('POST', new apigateway.LambdaIntegration(ragRetrieverFn), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const chatResource = api.root.addResource('chat');
        chatResource.addMethod('POST', new apigateway.LambdaIntegration(agentOrchestratorFn), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        // Health check endpoint (no auth)
        const healthResource = api.root.addResource('health');
        healthResource.addMethod(
            'GET',
            new apigateway.MockIntegration({
                integrationResponses: [
                    {
                        statusCode: '200',
                        responseTemplates: {
                            'application/json': JSON.stringify({ status: 'healthy', service: 'CareerPath AI' }),
                        },
                    },
                ],
                requestTemplates: {
                    'application/json': '{ "statusCode": 200 }',
                },
            }),
            {
                methodResponses: [{ statusCode: '200' }],
            }
        );

        // Presigned URL endpoint for resume upload
        const uploadUrlResource = api.root.addResource('upload-url');
        uploadUrlResource.addMethod('GET', new apigateway.LambdaIntegration(resumeParserFn), {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        // ============================================================
        // CLOUDWATCH DASHBOARD
        // ============================================================

        const dashboard = new cdk.aws_cloudwatch.Dashboard(this, 'CareerPathDashboard', {
            dashboardName: 'CareerPathAI-Metrics',
        });

        dashboard.addWidgets(
            new cdk.aws_cloudwatch.GraphWidget({
                title: 'Lambda Invocations',
                left: [
                    resumeParserFn.metricInvocations(),
                    embeddingPipelineFn.metricInvocations(),
                    ragRetrieverFn.metricInvocations(),
                    agentOrchestratorFn.metricInvocations(),
                ],
            }),
            new cdk.aws_cloudwatch.GraphWidget({
                title: 'Lambda Errors',
                left: [
                    resumeParserFn.metricErrors(),
                    embeddingPipelineFn.metricErrors(),
                    ragRetrieverFn.metricErrors(),
                    agentOrchestratorFn.metricErrors(),
                ],
            }),
            new cdk.aws_cloudwatch.GraphWidget({
                title: 'Lambda Duration',
                left: [
                    resumeParserFn.metricDuration(),
                    embeddingPipelineFn.metricDuration(),
                    ragRetrieverFn.metricDuration(),
                    agentOrchestratorFn.metricDuration(),
                ],
            }),
            new cdk.aws_cloudwatch.GraphWidget({
                title: 'API Gateway Requests',
                left: [api.metricCount()],
            })
        );

        // ============================================================
        // OUTPUTS
        // ============================================================

        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
            description: 'API Gateway endpoint URL',
        });

        new cdk.CfnOutput(this, 'ResumeBucketName', {
            value: resumeBucket.bucketName,
            description: 'S3 bucket for resume uploads',
        });

        new cdk.CfnOutput(this, 'SourceDataBucketName', {
            value: sourceDataBucket.bucketName,
            description: 'S3 bucket for knowledge base source data',
        });

        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        });

        new cdk.CfnOutput(this, 'BedrockKbRoleArn', {
            value: bedrockKbRole.roleArn,
            description: 'Hackathon Bedrock KB Role ARN (for manual KB creation)',
        });
    }
}
