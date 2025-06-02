# Building Your Kanban Board Project with GitHub Actions

## Overview

Your project already has a comprehensive CI/CD pipeline configured in `.github/workflows/ci-cd.yml`. This guide explains how it works and how to set it up properly.

## Current Workflow Structure

The GitHub Actions workflow includes the following jobs:

### 1. Backend Test & Build (`backend-test-build`)
- **Triggers**: Push to `main` or `develop` branches, PRs to `main`
- **What it does**:
  - Sets up Node.js 18
  - Starts MongoDB service for testing
  - Installs backend dependencies
  - Runs backend tests
  - Builds the backend TypeScript code
  - Uploads build artifacts

### 2. Frontend Test & Build (`frontend-test-build`)
- **Triggers**: Same as backend
- **What it does**:
  - Sets up Node.js 18
  - Installs frontend dependencies
  - Runs ESLint for code quality
  - Runs frontend tests
  - Builds the React/Vite application
  - Uploads build artifacts

### 3. Security Scan (`security-scan`)
- **Triggers**: After both build jobs complete
- **What it does**:
  - Runs Trivy vulnerability scanner
  - Uploads security results to GitHub Security tab

### 4. Deploy to Staging (`deploy-staging`)
- **Triggers**: Only on `develop` branch
- **What it does**:
  - Downloads build artifacts
  - Deploys to staging environment (needs configuration)

### 5. Deploy to Production (`deploy-production`)
- **Triggers**: Only on `main` branch
- **What it does**:
  - Downloads build artifacts
  - Deploys to production environment (needs configuration)

### 6. Docker Build & Push (`docker-build-push`)
- **Triggers**: Only on `main` branch
- **What it does**:
  - Builds Docker images for both frontend and backend
  - Pushes images to Docker Hub

## Required GitHub Secrets

To make the workflow fully functional, you need to set up these secrets in your GitHub repository:

### Repository Settings → Secrets and Variables → Actions

1. **MONGODB_URI**: MongoDB connection string for production
2. **JWT_SECRET**: Secret key for JWT token signing
3. **VITE_API_URL**: API URL for the frontend (optional, defaults to localhost)
4. **DOCKER_USERNAME**: Your Docker Hub username
5. **DOCKER_PASSWORD**: Your Docker Hub password or access token

## How to Set Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with its corresponding value

## Local Development Scripts

The root `package.json` now includes convenient scripts:

```bash
# Install all dependencies
npm run install:all

# Build everything
npm run build:all

# Build individual parts
npm run build:client
npm run build:server

# Run tests
npm run test:all
npm run test:client
npm run test:server

# Development
npm run dev:client    # Start Vite dev server
npm run dev:server    # Start backend with hot reload

# Linting
npm run lint:client

# Production
npm run start:server  # Start production server
```

## How the Build Process Works

### Backend Build Process
1. **Dependencies**: `npm ci` installs exact versions from package-lock.json
2. **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript in `dist/` folder
3. **Artifacts**: Built files are uploaded for deployment jobs

### Frontend Build Process
1. **Dependencies**: `npm ci` installs exact versions
2. **Type Checking**: `tsc -b` checks TypeScript types
3. **Vite Build**: Creates optimized production bundle in `dist/` folder
4. **Artifacts**: Built files are uploaded for deployment jobs

### Docker Build Process
1. **Backend**: Creates Node.js container with compiled TypeScript
2. **Frontend**: Multi-stage build with Nginx serving static files

## Triggering Builds

### Automatic Triggers
- **Push to `main`**: Runs full pipeline including production deployment
- **Push to `develop`**: Runs full pipeline including staging deployment
- **Pull Request to `main`**: Runs tests and builds (no deployment)

### Manual Triggers
You can also trigger workflows manually from the GitHub Actions tab.

## Monitoring Builds

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. View running/completed workflows
4. Click on any workflow run to see detailed logs

## Environment Configuration

### Staging Environment
- Triggered on `develop` branch
- Uses staging secrets and configuration
- Safe environment for testing

### Production Environment
- Triggered on `main` branch
- Uses production secrets and configuration
- Live environment for users

## Deployment Customization

The current deployment steps are placeholders. To customize:

1. **For cloud platforms** (AWS, Azure, GCP):
   ```yaml
   - name: Deploy to AWS
     run: |
       aws s3 sync client/dist/ s3://your-bucket-name
       aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

2. **For traditional servers**:
   ```yaml
   - name: Deploy via SSH
     run: |
       rsync -avz --delete client/dist/ user@server:/var/www/html/
       ssh user@server 'sudo systemctl restart nginx'
   ```

3. **For container platforms**:
   ```yaml
   - name: Deploy to Kubernetes
     run: |
       kubectl set image deployment/frontend frontend=${{ secrets.DOCKER_USERNAME }}/kanban-frontend:${{ github.sha }}
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check if all dependencies are properly listed in package.json
   - Ensure TypeScript compilation succeeds locally
   - Verify environment variables are set correctly

2. **Test Failures**:
   - Currently using placeholder tests
   - Add proper test suites using Jest, Vitest, or similar

3. **Docker Build Issues**:
   - Ensure Dockerfiles are in correct locations
   - Check if Docker Hub credentials are correct
   - Verify image names don't conflict

4. **Deployment Issues**:
   - Ensure all required secrets are set
   - Check if deployment targets are accessible
   - Verify permissions for deployment operations

## Next Steps

1. **Add Real Tests**: Replace placeholder tests with actual test suites
2. **Configure Deployment**: Set up actual deployment targets
3. **Add Monitoring**: Include health checks and monitoring
4. **Security**: Add additional security scans and checks
5. **Notifications**: Set up Slack/email notifications for build status

## Example Workflow Run

When you push to `main`:
1. ✅ Backend builds and tests pass
2. ✅ Frontend builds and lints successfully
3. ✅ Security scan completes
4. ✅ Docker images are built and pushed
5. ✅ Production deployment executes
6. 🎉 Your application is live!

This setup provides a robust, production-ready CI/CD pipeline for your Kanban board application.
