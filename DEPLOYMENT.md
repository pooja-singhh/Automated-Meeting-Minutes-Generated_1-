# AMMG Deployment Guide

This guide covers various deployment options for the AMMG (Automated Meeting Minutes Generator) application.

## 🚀 Quick Start with Docker

The easiest way to deploy AMMG is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd ammg-mern

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## 🌐 Production Deployment

### Option 1: Cloud Platforms

#### Heroku Deployment

**Backend:**
```bash
# Install Heroku CLI
npm install -g heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create ammg-backend

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ammg
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set NODE_ENV=production
heroku config:set MAX_FILE_SIZE=10485760

# Deploy
git push heroku main
```

**Frontend (Netlify):**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api`

#### AWS Deployment

**Using AWS Elastic Beanstalk:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

**Using AWS ECS with Docker:**

```bash
# Build and push images
docker build -t your-registry/ammg-backend ./backend
docker build -t your-registry/ammg-frontend ./frontend

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker tag your-registry/ammg-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/ammg-backend:latest
docker tag your-registry/ammg-frontend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/ammg-frontend:latest

docker push your-account.dkr.ecr.us-east-1.amazonaws.com/ammg-backend:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/ammg-frontend:latest
```

### Option 2: VPS Deployment

#### Ubuntu/Debian Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

**Deploy Application:**

```bash
# Clone repository
git clone <repository-url>
cd ammg-mern

# Install dependencies
npm run install-all

# Build frontend
cd frontend && npm run build && cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/ammg
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/ammg-mern/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Kubernetes Deployment

**Create Kubernetes manifests:**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ammg

---
# k8s/mongodb.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: ammg
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc

---
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: ammg
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/ammg-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: jwt-secret

---
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: ammg
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/ammg-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "https://api.your-domain.com"
```

**Deploy to Kubernetes:**

```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n ammg

# Expose services
kubectl expose deployment frontend --type=LoadBalancer --port=80 -n ammg
kubectl expose deployment backend --type=LoadBalancer --port=5000 -n ammg
```

## 🔧 Environment Configuration

### Required Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ammg
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** with SSL certificates
4. **Configure CORS** properly for your domain
5. **Set up rate limiting** for API endpoints
6. **Use environment-specific** MongoDB databases
7. **Enable MongoDB authentication**
8. **Regular security updates** for dependencies

## 📊 Monitoring and Logging

### Application Monitoring

**PM2 Monitoring:**
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all
```

**Health Checks:**
```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend health check
curl http://localhost:3000
```

### Log Management

**Log Rotation with PM2:**
```bash
# Install logrotate
npm install -g pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "ammg-backend"
          heroku_email: "your-email@example.com"
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Restart MongoDB
   sudo systemctl restart mongod
   ```

2. **Port Conflicts:**
   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :5000
   
   # Kill process using port
   sudo kill -9 <PID>
   ```

3. **Memory Issues:**
   ```bash
   # Check memory usage
   free -h
   
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

4. **File Upload Issues:**
   ```bash
   # Check upload directory permissions
   ls -la uploads/
   
   # Fix permissions
   chmod 755 uploads/
   ```

### Performance Optimization

1. **Enable Gzip compression**
2. **Set up Redis caching**
3. **Use CDN for static assets**
4. **Optimize database queries**
5. **Implement connection pooling**

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancers (Nginx, HAProxy)
- Implement session management
- Use Redis for session storage
- Set up database replication

### Vertical Scaling

- Increase server resources
- Optimize application code
- Use PM2 cluster mode
- Implement caching strategies

---

For more detailed information, refer to the main [README.md](README.md) file.
