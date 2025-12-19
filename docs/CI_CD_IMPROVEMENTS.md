# CI/CD Pipeline Documentation

## Overview
This document explains the improvements made to the CI/CD pipeline and Docker configuration.

## Key Improvements

### 1. **Java Version Alignment** ✓
- **Before**: Java 17 in pom.xml, Java 21 in Docker (mismatch risk)
- **After**: Consistent Java 17 across all builds
- **Why**: Ensures reproducible builds and prevents version compatibility issues

### 2. **Docker Health Checks** ✓
- **Before**: No health monitoring
- **After**: `HEALTHCHECK` instruction in Dockerfile + Docker daemon health tracking
- **Why**: Allows orchestration tools and deployment scripts to verify app status
- **Implementation**: Uses Spring Boot actuator endpoint `/actuator/health`
  - Interval: 30s between checks
  - Timeout: 3s per check
  - Retries: 3 failures before marking unhealthy
  - Grace period: 40s startup time

### 3. **CD Pipeline Dependencies** ✓
- **Before**: CD ran independently of CI
- **After**: CD now requires CI to pass (`needs: build-and-push` + `if: success()`)
- **Why**: Prevents deploying broken code to production

### 4. **Configurable Deployment** ✓
- **Before**: Hardcoded container name (`my_app`), image path, ports
- **After**: Environment variables at top of workflow
  ```yaml
  env:
    REGISTRY: ghcr.io
    IMAGE_NAME: ${{ github.repository }}
    CONTAINER_NAME: tqs-app
    APP_PORT: 8080
    HOST_PORT: 80
  ```
- **Why**: Easy to adapt to different environments without editing workflow logic

### 5. **Smart Container Startup** ✓
- **Before**: Fire-and-forget deployment
- **After**: 
  - Waits for app health checks to pass (max 60 seconds)
  - Better error handling with `set -e`
  - Container restart policy: `unless-stopped`
  - Shows container logs if deployment fails
- **Why**: Catches deployment failures immediately instead of finding them later

### 6. **Docker Build Caching** ✓
- **Before**: No layer caching between runs
- **After**: Uses GitHub Actions cache via buildx
- **Why**: Faster builds, reduced bandwidth

### 7. **Metadata Tagging** ✓
- **Before**: Just `:latest` and `:sha`
- **After**: Semantic tagging with branch, version, and commit info
- **Why**: Better image traceability for debugging and rollbacks

### 8. **Local Development Setup** ✓
- **New**: `docker-compose.yml` for local testing
- **Profiles**:
  - `dev`: Run the app locally on port 8080
  - `test`: Run full test suite in Docker
- **Why**: Match production environment during development

## Usage

### Local Development (Run the app)
```bash
docker-compose --profile dev up -d
# App available at http://localhost:8080
docker-compose logs -f app
docker-compose down
```

### Local Testing (Run tests in Docker)
```bash
docker-compose --profile test up --abort-on-container-exit
docker-compose down
```

### CI/CD Pipeline Triggers
- **CI**: Runs on push to any branch + pull requests to main
  - Tests with SonarCloud analysis
  - Uploads Jacoco coverage reports
  - Integrates with Xray test management
  
- **CD**: Runs ONLY on successful merge to main
  - Builds and pushes Docker image to GHCR
  - Deploys to production server via SSH
  - Verifies deployment health

## Required Secrets
Make sure these are configured in GitHub Settings > Secrets:
- `SONAR_TOKEN`: SonarCloud authentication
- `SONAR_HOST_URL`: SonarCloud host
- `XRAY_CLIENT_ID`: Jira Xray integration
- `XRAY_CLIENT_SECRET`: Jira Xray integration
- `SERVER_HOST`: Production server IP/hostname
- `SERVER_USER`: SSH user for production
- `SERVER_SSH_KEY`: SSH private key for production access

## Health Check Endpoint
The deployment uses Spring Boot's actuator health endpoint. Ensure your app has:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```
And in `application.properties`:
```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=always
```

## Deployment Flow
```
1. Push to main branch
   ↓
2. CI runs: tests, code analysis, coverage reports
   ↓
3. If CI succeeds → CD pipeline starts
   ↓
4. Build and push Docker image to GHCR
   ↓
5. SSH into production server
   ↓
6. Pull new image, stop old container, start new one
   ↓
7. Wait up to 60s for health checks to pass
   ↓
8. If healthy → deployment successful
   ↓
9. If unhealthy → rollback (stop container, exit with error)
```

## Tips for Production

### Monitoring
- Add log aggregation (ELK, Datadog, CloudWatch)
- Set up alerts on deployment failures
- Monitor container health status

### Security
- Consider GitHub OIDC for cloud deployments instead of SSH keys
- Scan Docker images for vulnerabilities (Trivy, Snyk)
- Use private registries for sensitive projects

### Scaling
- Docker-compose can be extended for multi-service setups
- For Kubernetes, convert to Helm charts
- Consider blue-green deployments for zero-downtime updates

## Troubleshooting

**Deployment fails with "App failed to become healthy":**
- Check app logs: `docker logs tqs-app`
- Verify actuator endpoint: `curl http://localhost:8080/actuator/health`
- Check port mappings and firewall rules

**Build takes too long:**
- Ensure GitHub Actions cache is being used
- Consider splitting app into multiple images
- Check Maven dependencies are resolving quickly

**Health check times out:**
- Increase `start_period` in docker-compose or Dockerfile
- Check if app startup takes longer than 40s
- Verify network connectivity in container
