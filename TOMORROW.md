# Resume Deployment Tomorrow

## Quick Start Commands

### 1. Start Backend Service
```bash
aws ecs update-service \
    --cluster liveboard-cluster \
    --service liveboard-backend-service \
    --desired-count 1 \
    --region us-east-1
```

Wait ~2 minutes for the task to start, then verify:
```bash
curl http://liveboard-lb-672717474.us-east-1.elb.amazonaws.com/api/orders
```

## Important Information

**Load Balancer URL:** `http://liveboard-lb-672717474.us-east-1.elb.amazonaws.com`
**Cluster:** `liveboard-cluster`
**Service:** `liveboard-backend-service`
**Region:** `us-east-1`

## What Was Completed Today

✅ ECS cluster configured
✅ Docker image built and pushed to ECR
✅ ECS service deployed with Application Load Balancer
✅ Security group configured to allow HTTP traffic
✅ Backend verified working (REST API + SSE stream)
✅ Service scaled down to save costs overnight

## Next Steps for Tomorrow

### 1. Deploy Frontend to AWS Amplify (~10 min)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect GitHub repository: `AgenticRank-Challenge-Frontend-Senior`
4. Branch: `main`
5. Build settings will auto-detect from `amplify.yml`
6. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: `http://liveboard-lb-672717474.us-east-1.elb.amazonaws.com`
7. Deploy

### 2. Configure CORS (~5 min)

Once you have your Amplify URL (e.g., `https://main.d123abc456.amplifyapp.com`):

Update `server/index.js:142`:
```javascript
// Change from:
app.use(cors());

// To:
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://main.d123abc456.amplifyapp.com'  // Your Amplify URL
  ],
  credentials: true
}));
```

Rebuild and redeploy:
```bash
# IMPORTANT: Use --platform flag for linux/amd64
docker build --platform linux/amd64 -f Dockerfile.backend -t liveboard-backend .

# Get your ECR URI from the console or:
aws ecr describe-repositories --repository-name liveboard-backend --region us-east-1 --query 'repositories[0].repositoryUri' --output text

# Tag and push (replace with your ECR URI)
docker tag liveboard-backend:latest <your-ecr-uri>:latest
docker push <your-ecr-uri>:latest

# Force new deployment
aws ecs update-service \
    --cluster liveboard-cluster \
    --service liveboard-backend-service \
    --force-new-deployment \
    --region us-east-1
```

### 3. Test End-to-End (~5 min)

Visit your Amplify URL and verify:
- Orders load initially
- Real-time orders stream in
- Filters work
- No CORS errors in console

### 4. Optional: Set Up CI/CD

See `DEPLOYMENT-ECS.md` section "Automatic Deployments (Optional)" for GitHub Actions setup.

## Stop Service Again When Done

```bash
aws ecs update-service \
    --cluster liveboard-cluster \
    --service liveboard-backend-service \
    --desired-count 0 \
    --region us-east-1
```

---

**Need help?** Run `claude` and say "continue deployment"
