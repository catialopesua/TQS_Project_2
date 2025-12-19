# Self-Hosted Runner Setup Guide

This guide covers:
1. Setting up GitHub Actions self-hosted runner on your Windows machine
2. Installing Docker on your cloud VM

---

## Part 1: Self-Hosted Runner Setup (Windows)

### Why?
Your self-hosted runner needs VPN access to deploy to your cloud VM. Running it on your Windows machine (or any machine with VPN) solves this.

### Prerequisites
- Windows machine with VPN access
- GitHub account with repo access
- Administrator access (for some steps)

### Step 1: Get the Runner from GitHub

1. Go to your GitHub repo
2. **Settings → Actions → Runners → New self-hosted runner**
3. Select **Windows** (since you're on Windows)
4. GitHub will show you download/setup instructions

### Step 2: Download and Extract

In PowerShell (as Administrator):

```powershell
# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download (copy the exact URL from GitHub - it includes your token)
Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v2.X.X/actions-runner-win-x64-2.X.X.zip" -OutFile "runner.zip"

# Extract
Expand-Archive -Path runner.zip -DestinationPath .

# Verify
Get-ChildItem
# Should show: config.cmd, run.cmd, etc.
```

### Step 3: Configure the Runner

Still in PowerShell in `C:\actions-runner`:

```powershell
# Run configuration (replace with YOUR token from GitHub)
.\config.cmd --url https://github.com/YOUR_USERNAME/TQS_Project_2 --token YOUR_GITHUB_TOKEN

# When prompted:
# - Runner name: (press Enter for default, or name it "Windows-VPN-Runner")
# - Run as service: (Y/N) → Choose Y (so it auto-starts)
# - Service user: (leave default for local system, or use your user)
```

**Get your token:**
- Go back to GitHub Settings → Actions → Runners → New self-hosted runner
- Copy the registration token (it's in the instructions)

### Step 4: Install as Windows Service (Optional but Recommended)

This makes the runner auto-start and survive reboots:

```powershell
# Still in C:\actions-runner
.\svc.cmd install

# Start the service
.\svc.cmd start

# Verify it's running
Get-Service -Name "GitHub Actions Runner"
```

### Step 5: Verify It's Connected

Go back to GitHub:
- **Settings → Actions → Runners**
- You should see your runner listed as **Idle** (green dot)

### Troubleshooting

**Runner shows offline:**
```powershell
# Check logs
Get-Content "C:\actions-runner\_diag\Runner_*.log"

# Restart service
Restart-Service -Name "GitHub Actions Runner"
```

**VPN connectivity issues:**
- Make sure VPN is connected before starting runner
- If runner starts before VPN, restart it: `Restart-Service -Name "GitHub Actions Runner"`

---

## Part 2: Docker Setup on Cloud VM

### Prerequisites
- SSH access to cloud VM (which you have)
- Sudo/root access (usually yes for cloud VMs)

### Step 1: SSH into Cloud VM

Using MobaXTerm or PowerShell (with VPN on):

```bash
ssh user@your-cloud-vm-ip
```

### Step 2: Install Docker

Choose based on your VM's OS:

#### **For Ubuntu/Debian:**

```bash
# Update package manager
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker  # Auto-start on reboot

# Verify
sudo docker --version
```

#### **For CentOS/RHEL:**

```bash
sudo yum install -y docker

sudo systemctl start docker
sudo systemctl enable docker

sudo docker --version
```

#### **For Azure VM (Ubuntu default):**

```bash
# Install Docker (Azure recommends this method)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional, so you don't need sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Step 3: Grant Permissions (Optional)

If you want to run Docker without `sudo`:

```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply the new group
newgrp docker

# Verify (shouldn't need sudo)
docker ps
```

### Step 4: Test Docker

```bash
# Run a test container
docker run hello-world

# Should output: "Hello from Docker!"

# List containers
docker ps -a

# Remove test container
docker rm <container-id>
```

### Step 5: Verify Port Access

Your app needs port 8080 accessible. Test it's open:

```bash
# From your Windows machine (with VPN on)
curl http://your-cloud-vm-ip:8080

# Or check if port is listening on VM
sudo netstat -tlnp | grep 8080
```

---

## Part 3: Verify Everything Works

### Quick Test Deployment

1. **Make a test commit** on your Windows machine:
```powershell
git add .
git commit -m "Test CI/CD setup"
git push origin main
```

2. **Watch GitHub Actions:**
   - Go to repo → **Actions** tab
   - Should see:
     - CI pipeline running (ubuntu-latest) ✓
     - CD pipeline waiting for CI to finish
     - Deploy job running on `[self-hosted]` ✓

3. **Check VM:**
```bash
# SSH into VM
ssh user@cloud-vm-ip

# Check if container is running
docker ps

# Check logs
docker logs tqs-app

# Test app
curl http://localhost:8080/actuator/health
```

4. **Access from Windows:**
```powershell
# From PowerShell (with VPN on)
curl http://your-cloud-vm-ip:8080/actuator/health
```

---

## Common Issues

### Self-Hosted Runner Not Picking Up Jobs

**Problem:** Deployment stuck waiting for runner
**Solution:**
```powershell
# Restart the runner service
Restart-Service -Name "GitHub Actions Runner"

# Check if it's connected (should say "Listening for Jobs")
Get-Content "C:\actions-runner\_diag\Runner_*.log" -Tail 20
```

### Docker Deployment Fails on VM

**Problem:** "docker: command not found"
**Solution:**
```bash
# Check if Docker is running
sudo systemctl status docker

# If not running
sudo systemctl start docker

# Check Docker is installed
which docker
docker --version
```

### Health Check Fails

**Problem:** App starts but health check times out
**Solution:**
```bash
# Check if app is running
docker ps

# View logs
docker logs tqs-app

# Test health endpoint manually
curl http://localhost:8080/actuator/health

# If endpoint not found, ensure app has Spring Boot Actuator dependency
```

### Port Already in Use

**Problem:** "Error response from daemon: bind: address already in use"
**Solution:**
```bash
# Find what's using port 8080
sudo lsof -i :8080

# Kill the process (if needed)
sudo kill -9 <PID>

# Or use different host port in deployment
# Edit CD pipeline and change HOST_PORT
```

---

## Summary

After completing this guide:

✅ Self-hosted runner is running on Windows with VPN access  
✅ Docker is installed on cloud VM  
✅ SSH access is set up  
✅ GitHub secrets are configured  
✅ Deployment is automated  

**Next Steps:**
1. Commit and push to main
2. Watch CI/CD run automatically
3. Check GitHub Actions for status
4. SSH into VM to verify app is running

**That's it!** Your CI/CD pipeline is now fully operational.
