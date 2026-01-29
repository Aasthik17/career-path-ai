# CareerPath AI - Deployment Checklist

## Pre-Deployment

### Prerequisites ✅
- [ ] AWS CLI configured with appropriate credentials
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] AWS CDK CLI installed (`npm install -g aws-cdk`)
- [ ] AWS account with Bedrock access enabled

### Bedrock Model Access ✅
- [ ] Enable `amazon.titan-embed-text-v2:0` in Bedrock console
- [ ] Enable `amazon.nova-pro-v1:0` in Bedrock console
- [ ] Verify models available in `us-east-1`

---

## Infrastructure Deployment

### Step 1: Install Dependencies
```bash
cd infrastructure
npm install
```
- [ ] Dependencies installed successfully

### Step 2: Bootstrap CDK (first time only)
```bash
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```
- [ ] CDK bootstrapped

### Step 3: Deploy Stack
```bash
cdk deploy --require-approval never
```
- [ ] Stack deployed successfully

### Step 4: Note Outputs
Record these values from CDK output:
- [ ] API Gateway URL: ________________
- [ ] User Pool ID: ________________
- [ ] User Pool Client ID: ________________
- [ ] Resume Bucket: ________________
- [ ] Source Data Bucket: ________________

---

## Knowledge Base Setup (AWS Console)

### Step 5: Create Knowledge Base
1. Go to Amazon Bedrock → Knowledge bases
2. Click "Create knowledge base"
3. Configure:
   - [ ] Name: `careerpath-knowledge-base`
   - [ ] Service role: `hackathon-bedrock-kb-role`
   - [ ] Embedding model: `amazon.titan-embed-text-v2:0`

### Step 6: Add Data Source
1. Select S3 as data source
2. Choose bucket: `careerpath-sourcedata-{account-id}`
3. Configure chunking strategy (default is fine)
- [ ] Data source configured

### Step 7: Upload Source Data
```bash
aws s3 cp data/ s3://careerpath-sourcedata-{account-id}/ --recursive
```
- [ ] Job postings uploaded
- [ ] Skills taxonomy uploaded
- [ ] Learning resources uploaded

### Step 8: Sync Knowledge Base
1. Click "Sync" in Knowledge Base console
2. Wait for sync to complete
- [ ] Knowledge base synced
- [ ] Knowledge Base ID: ________________

---

## Lambda Configuration

### Step 9: Update Environment Variables
For each Lambda function, update:
- [ ] KNOWLEDGE_BASE_ID set correctly
- [ ] BEDROCK_REGION = us-east-1
- [ ] EMBEDDING_MODEL_ID = amazon.titan-embed-text-v2:0
- [ ] GENERATION_MODEL_ID = amazon.nova-pro-v1:0

---

## Frontend Deployment

### Step 10: Configure Environment
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_ENDPOINT=https://xxx.execute-api.us-east-1.amazonaws.com/v1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxx
NEXT_PUBLIC_RESUME_BUCKET=careerpath-resumes-xxxxx
```
- [ ] Environment file created

### Step 11: Build and Deploy
```bash
cd frontend
npm install
npm run build
```
- [ ] Build successful

For production (choose one):
- [ ] Deploy to Vercel: `vercel deploy`
- [ ] Deploy to AWS Amplify
- [ ] Deploy to EC2/ECS

---

## Verification

### Step 12: Health Check
```bash
curl https://your-api-url/v1/health
```
Expected: `{"status": "healthy", "service": "CareerPath AI"}`
- [ ] Health check passed

### Step 13: End-to-End Test
1. Open frontend URL
2. Upload a test resume
3. Verify parsing works
4. Test chat functionality
5. Check dashboard renders
- [ ] All features working

### Step 14: CloudWatch Verification
1. Check Lambda logs for errors
2. Verify CloudWatch dashboard metrics
- [ ] No errors in logs
- [ ] Metrics flowing

---

## Post-Deployment

### Security Checklist
- [ ] CORS configured for production domain only
- [ ] API Gateway throttling configured
- [ ] CloudWatch alarms set up
- [ ] Cognito configured for production

### Documentation
- [ ] README updated with production URLs
- [ ] Team has access to AWS resources
- [ ] Runbook created for operations

---

## Troubleshooting

### Lambda Timeout
- Increase timeout in CDK (up to 5 min for orchestrator)
- Check Bedrock quotas

### Knowledge Base Not Returning Results
- Verify sync completed
- Check data format in S3
- Test with Bedrock console directly

### CORS Errors
- Update API Gateway CORS config
- Check allowed origins

### Authentication Errors
- Verify Cognito configuration
- Check user pool client settings

---

## Rollback Procedure

If issues occur:
```bash
cd infrastructure
cdk destroy
# Fix issues
cdk deploy
```

---

## Compliance Verification

| Requirement | Verified |
|-------------|----------|
| Region: us-east-1 | ☐ |
| Service role: hackathon-bedrock-kb-role | ☐ |
| Embedding: amazon.titan-embed-text-v2:0 | ☐ |
| Generation: amazon.nova-pro-v1:0 | ☐ |
| No third-party models | ☐ |
