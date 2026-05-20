# Deployment Guide

This guide covers deploying the LiveBoard application to AWS using Amplify (frontend) and App Runner (backend).

## Architecture

- **Frontend**: AWS Amplify Hosting (Static React app)
- **Backend**: AWS App Runner (Express SSE server in Docker)

## Prerequisites

- AWS Account
- GitHub repository connected
- AWS CLI or Amplify CLI installed

## Step 1: Deploy Backend to AWS App Runner

### Using AWS Console:

1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
2. Click "Create service"
3. **Source**: Choose "Source code repository"
4. **Connect to GitHub**: Authorize and select your repository
5. **Deployment settings**:
   - Branch: `main`
   - Deployment trigger: Automatic
6. **Build settings**:
   - Configuration file: Use Dockerfile
   - Dockerfile: `Dockerfile.backend`
   - Build command: (leave empty, Docker handles it)
   - Port: `4000`
7. **Service settings**:
   - Service name: `liveboard-backend`
   - CPU: 1 vCPU
   - Memory: 2 GB
   - Environment variables: None needed
8. Click "Create & deploy"

Wait for deployment to complete (~5 minutes). Note the **App Runner URL** (e.g., `https://abc123.us-east-1.awsapprunner.com`).

### Using AWS CLI:

```bash
# Install AWS CLI and configure credentials
aws configure

# Create App Runner service
aws apprunner create-service \
  --service-name liveboard-backend \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/EdgarMC100/AgenticRank-Challenge-Frontend-Senior",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "API",
        "CodeConfigurationValues": {
          "Runtime": "DOCKER",
          "BuildCommand": "",
          "StartCommand": "",
          "Port": "4000"
        }
      }
    }
  }'
```

## Step 2: Deploy Frontend to AWS Amplify

### Using Amplify Console:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. **Connect repository**:
   - Choose GitHub
   - Authorize and select `AgenticRank-Challenge-Frontend-Senior`
   - Branch: `main`
4. **Build settings**: Auto-detected from `amplify.yml`
5. **Environment variables**:
   - Add: `VITE_API_URL` = `<Your App Runner URL from Step 1>`
   - Example: `https://abc123.us-east-1.awsapprunner.com`
6. Click "Save and deploy"

Wait for deployment (~3 minutes). Your app will be available at the Amplify URL (e.g., `https://main.d123abc.amplifyapp.com`).

### Using Amplify CLI:

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Select manual configuration and provide App Runner URL as backend

# Publish
amplify publish
```

## Step 3: Configure CORS on Backend

After deploying, you need to update the backend to allow requests from your Amplify domain.

**Option 1: Update server/index.js** (if allowed):
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://main.d123abc.amplifyapp.com'  // Add your Amplify URL
  ]
}));
```

**Option 2: Environment variable approach**:
Add to App Runner environment variables:
- `ALLOWED_ORIGINS`: `https://main.d123abc.amplifyapp.com`

Then update `server/index.js` to read from env.

## Step 4: Verify Deployment

1. Visit your Amplify URL
2. Check browser console for errors
3. Verify SSE connection is established
4. Confirm real-time orders are flowing

## Environment Variables Summary

### Frontend (Amplify):
- `VITE_API_URL`: Your App Runner backend URL

### Backend (App Runner):
- None required by default
- Optional: `ALLOWED_ORIGINS` for dynamic CORS

## Costs Estimate

- **AWS Amplify**: Free tier includes 1000 build minutes/month
- **AWS App Runner**: ~$5-10/month with minimal traffic
- Total: ~$5-10/month for light usage

## Troubleshooting

### Frontend can't connect to backend:
- Check `VITE_API_URL` in Amplify environment variables
- Verify App Runner service is running
- Check CORS configuration

### SSE not working:
- Ensure App Runner health check passes
- Check App Runner logs for errors
- Verify port 4000 is configured correctly

### Build failures:
- Check Amplify build logs
- Verify `amplify.yml` is correct
- Ensure all dependencies are in package.json

## Clean Up

To avoid charges:
1. Delete App Runner service
2. Delete Amplify app
3. Remove GitHub repository (optional)
