# 🛠️ Development Setup Guide

## 📋 Prerequisites

### Required Software

- **Java 21 (LTS)** - [Download Eclipse Adoptium](https://adoptium.net/temurin/releases/?version=21)
- **Gradle 8.5+** - Included via Gradle Wrapper (`gradlew`)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Docker Desktop** - [Download Docker](https://www.docker.com/products/docker-desktop)

---

## ☕ Java 21 Configuration

### 🎯 Recommended: Automated Setup (Project-Specific)

**Best for multi-JDK environments** - Each project uses its own JDK without affecting others.

#### Option 1: Auto-detect (Easiest)

```powershell
# Auto-detects JDK 21 from 15+ common locations
.\setup-java.ps1
```

**Searches in:**
- Eclipse Adoptium: `C:\Program Files\Eclipse Adoptium\`
- Oracle JDK: `C:\Program Files\Java\`
- Amazon Corretto: `C:\Program Files\Amazon Corretto\`
- Microsoft OpenJDK: `C:\Program Files\Microsoft\`
- SDKMAN: `%USERPROFILE%\.sdkman\candidates\java\`
- Custom: `C:\Java\`, `D:\Java\`, `%USERPROFILE%\Java\`, etc.

#### Option 2: Specify Custom Path

```powershell
# Use JDK from specific location
.\setup-java.ps1 -JdkPath "C:\MyJava\jdk-21.0.10"

# Examples:
.\setup-java.ps1 -JdkPath "D:\Development\jdk21"
.\setup-java.ps1 -JdkPath "C:\Program Files\Java\jdk-21.0.10.7-hotspot"
```

**Use cases for custom path:**
- ✅ JDK in non-standard location
- ✅ Multiple JDK 21 versions (choose specific one)
- ✅ Portable/USB JDK installation
- ✅ Network drive or custom path

#### What it does:

- ✅ **Validates** JDK 21 is installed correctly
- ✅ **Creates** `backend/gradle.properties.local` (gitignored)
- ✅ **Configures** optimal Gradle performance settings
- ✅ **Works** from any IDE or terminal
- ✅ **Isolates** this project from other Java projects

**Benefits:**
- ✅ Project-isolated JDK configuration
- ✅ No environment variables needed
- ✅ Works across all terminals
- ✅ Each developer configures their own path
- ✅ Other projects unaffected

### 🚀 Quick Start for New Developers

```powershell
# Standard setup (auto-detect)
git clone <repo-url>
cd dental-saas-mvp
.\setup-java.ps1
cd backend
.\run-backend.ps1

# Setup with custom JDK location
.\setup-java.ps1 -JdkPath "D:\Java\jdk-21"
cd backend
.\run-backend.ps1
```

**That's it!** The script finds your JDK automatically or uses your specified path. 🎉

### 🔄 Handling JDK Auto-Updates

Eclipse Adoptium may install updates automatically, creating multiple versions:

```
C:\Program Files\Eclipse Adoptium\
├── jdk-21.0.10.7-hotspot\  ← Old version
└── jdk-21.0.11.9-hotspot\  ← New version (auto-installed)
```

**Solution 1: Auto-detect latest (Recommended)**

```powershell
.\setup-java.ps1  # Auto-detects and uses latest JDK 21
```

**Solution 2: Specify exact version**

```powershell
.\setup-java.ps1 -JdkPath "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.9-hotspot"
```

**No manual editing required!** 🎉 The script will:
1. Find all JDK 21 installations (if auto-detecting)
2. Select the latest version automatically (or use your specified path)
3. Update `backend/gradle.properties.local` with correct path

**Tip:** Run `.\setup-java.ps1` after any JDK update to ensure you're using the latest version.

### 💻 IDE Compatibility

| IDE | Compatible | How to Run |
|-----|-----------|-----------|
| **VSCode** | ✅ Yes | Integrated terminal: `.\setup-java.ps1` |
| **IntelliJ IDEA** | ✅ Yes | Integrated terminal: `.\setup-java.ps1` |
| **Eclipse** | ✅ Yes | Integrated terminal: `.\setup-java.ps1` |
| **NetBeans** | ✅ Yes | Integrated terminal: `.\setup-java.ps1` |
| **Any Terminal** | ✅ Yes | Direct execution |

**No IDE-specific configuration needed!** The setup script works universally.

### 📋 Parameters Reference

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `-JdkPath` | No | Custom JDK installation path | `.\setup-java.ps1 -JdkPath "C:\Java\jdk21"` |
| *(none)* | - | Auto-detect from common locations | `.\setup-java.ps1` |

---

### Alternative: Manual Configuration

#### Option A: Global JAVA_HOME (Simple but affects all projects)

**Windows (PowerShell):**
```powershell
# Set for current session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify
java -version
```

**Linux:**
```bash
export JAVA_HOME="/usr/lib/jvm/jdk-21"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

**macOS:**
```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version
```

#### Option B: IDE-specific Configuration

**VS Code:**
Create `.vscode/settings.json` (gitignored):
```json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.10.7-hotspot",
      "default": true
    }
  ],
  "java.jdt.ls.java.home": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.10.7-hotspot",
  "java.import.gradle.java.home": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.10.7-hotspot"
}
```

**IntelliJ IDEA:**
1. `File` → `Project Structure` → `Project SDK` → `Add JDK` → Select JDK 21
2. `File` → `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Gradle`
3. Set `Gradle JVM` to JDK 21

**Eclipse:**
1. `Window` → `Preferences` → `Java` → `Installed JREs` → `Add` → Select JDK 21
2. Right-click project → `Properties` → `Java Build Path` → `Libraries` → Edit JRE → Select JDK 21

---

## ✅ Verify Installation

```bash
# Java version
java -version
# Expected: openjdk version "21.0.x"

# Gradle version (uses wrapper)
cd backend
./gradlew -version  # Linux/Mac
.\gradlew.bat -version  # Windows
# Expected: Gradle 8.5

# Node version
node -version
# Expected: v18.x or higher

# Docker version
docker --version
# Expected: Docker version 20.x or higher
```

---

## 🚀 Quick Start

### 0. Configure JDK (First Time Only)

**Windows:**
```powershell
.\setup-java.ps1
```

This creates `backend/gradle.properties.local` with JDK 21 configuration.

### 1. Start Database

```bash
cd docker
docker-compose up -d
```

### 2. Start Backend

**Windows:**
```powershell
cd backend
.\run-backend.ps1
```

**Linux/Mac:**
```bash
cd backend
./run-backend.sh
```

**Or manually with Gradle:**
```bash
cd backend
./gradlew bootRun
```

Backend will be available at: **http://localhost:8080**

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔧 Troubleshooting

### Java Issues

**Problem:** `The supplied javaHome seems to be invalid`

**Solution:**
1. Verify JDK 21 installation: `java -version`
2. Check `JAVA_HOME` is set correctly
3. For Gradle, set `org.gradle.java.home` in `backend/gradle.properties`
4. Stop Gradle daemon: `./gradlew --stop`

**Problem:** JDK auto-updated and project won't build

**Solution:**
```powershell
# Re-run setup to detect latest JDK 21
.\setup-java.ps1

# Or specify exact version
.\setup-java.ps1 -JdkPath "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.9-hotspot"

# Verify new version is detected
cd backend
.\gradlew --version
```

The setup script automatically finds the latest JDK 21 installation or uses your specified path.

**Problem:** JDK installed in non-standard location

**Solution:**
```powershell
# Specify custom path
.\setup-java.ps1 -JdkPath "D:\MyTools\jdk-21"
.\setup-java.ps1 -JdkPath "E:\PortableApps\jdk21"
```

### Gradle Issues

**Problem:** Gradle uses wrong Java version

**Solution:**
```bash
cd backend
./gradlew --stop  # Stop all Gradle daemons
rm -rf .gradle    # Clear project cache
./gradlew clean build
```

### Docker Issues

**Problem:** Port 5432 already in use

**Solution:**
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :5432

# Stop existing PostgreSQL or change port in docker-compose.yml
```

---

## 📦 Project Structure

```
dental-saas-mvp/
├── backend/              # Spring Boot WebFlux + R2DBC
│   ├── src/
│   ├── build.gradle
│   ├── gradle.properties # Portable config (commit this)
│   └── run-backend.ps1   # Helper script
├── frontend/             # React 18 + TypeScript + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── docker/               # PostgreSQL database
│   └── docker-compose.yml
├── openspec/             # OpenSpec specifications
│   ├── specs/           # Source of truth
│   └── changes/         # Work in progress
└── sdd/archive/         # Legacy docs (archived)
```

---

## 🔐 Default Credentials

**Test User:**
- Email: `admin@dental.com`
- Password: `password123`

**Database:**
- Host: `localhost:5432`
- Database: `dentaldb`
- User: `dentaluser`
- Password: `dentalpass`

---

## 📚 Additional Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [OpenSpec Workflow](openspec/WORKFLOW.md)
- [API Documentation](openspec/specs/)
- [Project Overview](openspec/project.md)

---

## 🤝 IDE Support

This project works with:
- ✅ Visual Studio Code
- ✅ IntelliJ IDEA
- ✅ Eclipse
- ✅ NetBeans
- ✅ Any text editor + CLI

Configuration files (`.vscode/`, `.idea/`, etc.) are gitignored to keep the repository IDE-agnostic.

---

## 🆘 Need Help?

- Check [GitHub Issues](../../issues)
- Review [OpenSpec Documentation](openspec/AGENTS.md)
- Contact the development team

---

**Last Updated:** March 2026
