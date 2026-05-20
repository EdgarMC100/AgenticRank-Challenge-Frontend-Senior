# Deployment Guide - AWS ECS Express Mode

Deploy LiveBoard using AWS Amplify (frontend) and Amazon ECS Express mode (backend).

## Architecture

- **Frontend**: AWS Amplify Hosting (Static React app)
- **Backend**: Amazon ECS Express mode (Express SSE server in Docker)
- **Container Registry**: Amazon ECR

## Prerequisites

- AWS Account with CLI configured
- Docker installed locally
- GitHub repository

---

## Part 1: Deploy Backend to Amazon ECS Express Mode

### Step 1: Install and Configure AWS CLI

```bash
# Install AWS CLI (if not already installed)
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region (e.g., us-east-1)
```

### Step 2: Create ECR Repository

```bash
# Create a repository for your backend image
aws ecr create-repository \
    --repository-name liveboard-backend \
    --region us-east-1

# Note the repositoryUri from the output (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com/liveboard-backend)
```

### Step 3: Build and Push Docker Image

```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build the Docker image
docker build -f Dockerfile.backend -t liveboard-backend .

# Tag the image
docker tag liveboard-backend:latest <your-ecr-uri>:latest

# Push to ECR
docker push <your-ecr-uri>:latest
```

**Example:**
```bash
# Replace 123456789 with your AWS account ID
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -f Dockerfile.backend -t liveboard-backend .

docker tag liveboard-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/liveboard-backend:latest

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/liveboard-backend:latest
```

### Step 4: Create ECS Cluster with Express Mode

**Using AWS Console:**

1. Go to [Amazon ECS Console](https://console.aws.amazon.com/ecs)
2. Click "Clusters" → "Create cluster"
3. **Cluster configuration**:
   - Cluster name: `liveboard-cluster`
   - Infrastructure: AWS Fargate (serverless)
4. Click "Create"

### Step 5: Create ECS Service (Express Mode)

1. In your cluster, click "Services" → "Create"
2. **Deployment configuration**:
   - Application type: Service
   - Family: Create new
   - Service name: `liveboard-backend-service`
3. **Container configuration**:
   - Container name: `liveboard-backend`
   - Image URI: `<your-ecr-uri>:latest`
   - Port: `4000`
   - Protocol: HTTP
4. **Networking**:
   - VPC: Default VPC
   - Subnets: Select all available
   - Security group: Create new
     - Allow inbound: Port 4000 from anywhere (0.0.0.0/0)
   - Public IP: Enabled
5. **Load balancing**:
   - Load balancer type: Application Load Balancer
   - Create new load balancer
   - Target group port: 4000
   - Health check path: `/api/orders`
6. **Service auto scaling**:
   - Desired tasks: 1
   - Minimum: 1
   - Maximum: 3
7. Click "Create"

Wait ~5 minutes for deployment. Note the **Load Balancer DNS name** (e.g., `liveboard-lb-123456789.us-east-1.elb.amazonaws.com`).

### Step 6: Test Backend

```bash
# Test the API endpoint
curl http://<load-balancer-dns>/api/orders

# You should see JSON with seeded orders
```

---

## Part 2: Deploy Frontend to AWS Amplify

### Step 1: Go to Amplify Console

1. Visit [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"

### Step 2: Connect GitHub Repository

1. Choose **GitHub** as source
2. Authorize AWS Amplify
3. Select repository: `AgenticRank-Challenge-Frontend-Senior`
4. Branch: `main`
5. Click "Next"

### Step 3: Configure Build Settings

Build settings should be auto-detected from `amplify.yml`. Verify it shows:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

Click "Next"

### Step 4: Add Environment Variables

**Critical**: Add your backend URL as an environment variable.

1. In "Advanced settings" → "Environment variables"
2. Add variable:
   - Key: `VITE_API_URL`
   - Value: `http://<your-load-balancer-dns>`
   - Example: `http://liveboard-lb-123456789.us-east-1.elb.amazonaws.com`

⚠️ **Important**: Use `http://` (not `https://`) unless you've configured SSL on the load balancer.

Click "Next" → "Save and deploy"

### Step 5: Wait for Deployment

Deployment takes ~3-5 minutes. You'll get an Amplify URL like:
`https://main.d123abc456.amplifyapp.com`

---

## Part 3: Configure CORS (Important!)

Your backend needs to allow requests from your Amplify domain.

### Update server/index.js:

You'll need to modify the CORS configuration to allow your Amplify URL:

```javascript
// Current (line 142):
app.use(cors());

// Change to:
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://main.d123abc456.amplifyapp.com'  // Add your Amplify URL
  ],
  credentials: true
}));
```

Then rebuild and redeploy:

```bash
# Rebuild and push Docker image
docker build -f Dockerfile.backend -t liveboard-backend .
docker tag liveboard-backend:latest <your-ecr-uri>:latest
docker push <your-ecr-uri>:latest

# Force new deployment in ECS
aws ecs update-service \
    --cluster liveboard-cluster \
    --service liveboard-backend-service \
    --force-new-deployment \
    --region us-east-1
```

---

## Part 4: Verify Everything Works

1. Visit your Amplify URL: `https://main.d123abc456.amplifyapp.com`
2. Open browser DevTools (F12) → Console
3. Check for errors
4. Verify:
   - Orders load initially
   - Real-time orders appear (SSE working)
   - Filters work
   - No CORS errors

---

## Cost Breakdown

| Service | Cost (Monthly) |
|---------|----------------|
| **ECS Fargate** | ~$10-15 (1 task, 0.5 vCPU, 1GB RAM) |
| **Application Load Balancer** | ~$16 (fixed) + data transfer |
| **Amplify Hosting** | Free tier: 1000 build minutes |
| **ECR Storage** | $0.10/GB (minimal) |
| **Total** | ~$30-35/month |

### Cost Optimization Tips:
- Use Fargate Spot for 70% savings (with task interruptions)
- Delete when not in use
- Use AWS Free Tier (12 months for new accounts)

---

## Automatic Deployments (Optional)

### Backend Auto-Deploy from GitHub:

Create a GitHub Actions workflow:

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to ECS

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
      - 'Dockerfile.backend'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}

      - name: Build and push
        run: |
          docker build -f Dockerfile.backend -t liveboard-backend .
          docker tag liveboard-backend:latest ${{ secrets.ECR_REGISTRY }}/liveboard-backend:latest
          docker push ${{ secrets.ECR_REGISTRY }}/liveboard-backend:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster liveboard-cluster --service liveboard-backend-service --force-new-deployment
```

Add GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ECR_REGISTRY` (your ECR URI)

---

## Troubleshooting

### Backend not responding:
```bash
# Check ECS task status
aws ecs list-tasks --cluster liveboard-cluster --service-name liveboard-backend-service

# Get task details
aws ecs describe-tasks --cluster liveboard-cluster --tasks <task-arn>

# Check logs in CloudWatch
aws logs tail /ecs/liveboard-backend --follow
```

### CORS errors:
- Verify CORS configuration includes your Amplify URL
- Check browser console for exact error
- Ensure you rebuilt and redeployed after CORS changes

### SSE not working:
- Verify health checks pass (check target group)
- Ensure load balancer allows long-lived connections
- Check CloudWatch logs for errors

### Build failures on Amplify:
- Check Amplify build logs
- Verify `VITE_API_URL` environment variable is set
- Ensure `amplify.yml` is correct

---

## Clean Up (To Avoid Charges)

```bash
# Delete ECS service
aws ecs delete-service --cluster liveboard-cluster --service liveboard-backend-service --force

# Delete ECS cluster
aws ecs delete-cluster --cluster liveboard-cluster

# Delete load balancer (via Console or CLI)

# Delete ECR repository
aws ecr delete-repository --repository-name liveboard-backend --force

# Delete Amplify app (via Console)
```

---

## Next Steps

1. ✅ Set up custom domain in Amplify
2. ✅ Configure SSL/HTTPS on load balancer
3. ✅ Set up CloudWatch alarms for monitoring
4. ✅ Implement CI/CD with GitHub Actions
5. ✅ Add environment-based configurations
