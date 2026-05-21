# LiveBoard

Real-time order management dashboard for food delivery operations.

## 🚀 Live Demo

- **Frontend:** https://main.d220an4ssskwfr.amplifyapp.com/
- **API:** https://d2u0c8er3guc1y.cloudfront.net

## 📋 Features

- **Real-time Order Streaming** - Server-Sent Events (SSE) with automatic reconnection
- **Advanced Filtering** - Search, status filters, and restaurant filtering with localStorage persistence
- **Performance Optimized** - Virtual scrolling for large datasets (1000+ orders)
- **Responsive UI** - Grid layout with status-based color coding
- **Analytics Dashboard** - Order metrics and statistics

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript (strict mode)
- Vite for build tooling
- Recharts for analytics
- TanStack Virtual for list virtualization
- Vitest + Testing Library for tests

### Backend
- Node.js + Express
- Server-Sent Events (SSE) for real-time updates
- CORS protection with origin whitelisting

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                       │
│                    (HTTPS Secure)                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              AWS Amplify (Frontend Hosting)             │
│   • Auto-deploy from GitHub (main branch)              │
│   • HTTPS with AWS certificate                          │
│   • Global CDN distribution                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ API Requests
                         ▼
┌─────────────────────────────────────────────────────────┐
│           CloudFront CDN (API Gateway)                  │
│   • HTTPS endpoint (d2u0c8er3guc1y.cloudfront.net)     │
│   • Global edge locations                               │
│   • Zero caching for API (TTL=0)                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│        Application Load Balancer (us-east-1)           │
│   • HTTP → Container routing                            │
│   • Health checks every 30s                             │
│   • Target group: liveboard-tg                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              AWS ECS Fargate (Backend)                  │
│   • Cluster: liveboard-cluster                          │
│   • Service: liveboard-backend-service                  │
│   • Container: Node.js Express API                      │
│   • Auto-scaling: 1 task (configurable)                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- pnpm (or npm)

### Setup

```bash
# Install dependencies
pnpm install

# Start dev server (frontend + backend)
pnpm dev
```

This boots:
- Vite dev server on http://localhost:5173
- Mock backend on http://localhost:4000

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint code
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

Tests include:
- Unit tests for filter logic
- Component tests for UI interactions
- Integration tests for SSE streaming

## 📁 Project Structure

```
├── src/
│   ├── components/       # React components (all memoized)
│   │   ├── OrderList.tsx      # Virtualized order list
│   │   ├── OrderRow.tsx       # Individual order card
│   │   ├── FilterBar.tsx      # Search and filters
│   │   └── Dashboard.tsx      # Analytics dashboard
│   ├── hooks/
│   │   └── useOrderStream.ts  # SSE client with reconnection
│   ├── lib/
│   │   └── orderFilters.ts    # Filter and sort logic
│   ├── types/            # TypeScript definitions
│   ├── config.ts         # Environment configuration
│   └── App.tsx           # Main application
├── server/
│   └── index.js          # Express backend (SSE + REST)
├── tests/                # Test files
└── amplify.yml           # AWS Amplify build config
```

## 🔑 Key Implementation Details

### Real-Time Streaming
- SSE connection with automatic reconnection
- Exponential backoff (1s → 2s → 4s → 8s → max 30s)
- Graceful error handling and recovery

### Performance Optimizations
- Virtual scrolling with TanStack Virtual (handles 1000+ orders)
- React.memo on all components
- localStorage caching for filter state
- Debounced search input

### Filter Persistence
Filters are persisted to localStorage and restored on mount:
- Search query
- Status filters (multi-select)
- Restaurant filter

## 🌐 Deployment

### Frontend (AWS Amplify)

**Automatic deployments** from GitHub `main` branch.

**Environment Variables:**
- `VITE_API_URL`: CloudFront API endpoint

**Manual redeploy:**
1. Go to AWS Amplify Console
2. Select the app → Deployments
3. Click "Redeploy this version"

### Backend (AWS ECS)

**Deploy new version:**

```bash
# 1. Build Docker image
docker build --platform linux/amd64 -f Dockerfile.backend -t liveboard-backend .

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  108742334699.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag and push
docker tag liveboard-backend:latest \
  108742334699.dkr.ecr.us-east-1.amazonaws.com/liveboard-backend:latest
docker push 108742334699.dkr.ecr.us-east-1.amazonaws.com/liveboard-backend:latest

# 4. Force new deployment
aws ecs update-service \
  --cluster liveboard-cluster \
  --service liveboard-backend-service \
  --force-new-deployment \
  --region us-east-1
```

### Cost Management

**Stop backend when not in use:**
```bash
aws ecs update-service \
  --cluster liveboard-cluster \
  --service liveboard-backend-service \
  --desired-count 0 \
  --region us-east-1
```

**Restart backend:**
```bash
aws ecs update-service \
  --cluster liveboard-cluster \
  --service liveboard-backend-service \
  --desired-count 1 \
  --region us-east-1
```

## 💰 AWS Cost Estimate

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| ECS Fargate (1 task) | ~$15 | 0.5 vCPU, 1GB RAM, 24/7 |
| Application Load Balancer | ~$16 | Fixed cost + data transfer |
| CloudFront | Free tier | 1TB + 10M requests free |
| Amplify Hosting | Free tier | Build minutes + storage |
| ECR (Docker registry) | ~$0.10 | 1GB storage |
| **Total** | **~$31/month** | Can reduce by stopping ECS |

**Tip:** Stop ECS when not in use to save ~$15/month.

## 🔒 Security

- CORS protection with origin whitelisting
- HTTPS everywhere (Amplify + CloudFront)
- No sensitive data in frontend code
- Environment variables for configuration

## 🐛 Known Issues

- Performance can be bumpy with 500+ simultaneous orders on screen
  - Mitigated with virtualization (only renders visible rows)
- Filter state occasionally resets after long sessions
  - Related to localStorage quota limits

## 📚 API Documentation

### GET /api/orders
Returns initial list of orders.

**Response:**
```json
[
  {
    "id": "ord_abc123",
    "customerName": "John Doe",
    "restaurantName": "Pizza Palace",
    "items": [
      { "name": "Margherita Pizza", "quantity": 2, "unitPrice": 1450 }
    ],
    "total": 2900,
    "status": {
      "kind": "ready",
      "placedAt": "2026-05-21T12:00:00Z",
      "startedAt": "2026-05-21T12:05:00Z",
      "readyAt": "2026-05-21T12:15:00Z"
    }
  }
]
```

### GET /api/orders/stream
Server-Sent Events endpoint for real-time updates.

**Events:**
- `new-order`: New order placed
- `update-order`: Order status changed

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using React, TypeScript, and AWS
