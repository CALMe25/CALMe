# Build and Run the PoC - Windows 11 PowerShell Instructions

## Prerequisites Installation

### 1. Install Node.js and npm
   - Download Node.js LTS version (20.x or later) from https://nodejs.org/
   - Run the installer (.msi file)
   - Choose "Add to PATH" option during installation
   - Verify installation by opening PowerShell and running:
     ```powershell
     node --version
     npm --version
     ```

### 2. Install Git (if not already installed)
   - Download Git from https://git-scm.com/download/win
   - Run the installer
   - Use recommended settings during installation
   - Verify installation:
     ```powershell
     git --version
     ```

## Build and Run Instructions

### 1. Clone the Repository
   ```powershell
   git clone https://github.com/[repository-url]/CALMe.git
   cd CALMe
   ```

### 2. Install Project Dependencies
   ```powershell
   npm install
   ```

### 3. Run in Development Mode
   ```powershell
   npm run dev
   ```
   - The application will start on http://localhost:5173
   - Open this URL in your web browser
   - The development server includes hot module replacement (changes reflect automatically)

### 4. Build for Production
   ```powershell
   npm run build
   ```
   - Creates optimized production files in the `dist` folder
   - Build output will be approximately 50MB

### 5. Preview Production Build
   ```powershell
   npm run preview
   ```
   - Serves the production build locally for testing
   - Usually runs on http://localhost:4173

### 6. Run Code Linting (Optional)
   ```powershell
   npm run lint
   ```
   - Checks code quality and style

## Troubleshooting

### If npm commands fail with "execution policy" error:
1. Run PowerShell as Administrator
2. Execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` to confirm

### If port 5173 is already in use:
- Either close the application using that port, or
- Modify `vite.config.ts` to use a different port

### If dependencies fail to install:
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```
2. Delete `node_modules` folder and `package-lock.json` file:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   ```
3. Try installing again:
   ```powershell
   npm install
   ```

## Application Overview
CALMe is a trauma response Progressive Web App (PWA) designed to provide psychological support during crisis situations. It features:
- Offline functionality after initial download
- Natural language processing for understanding crisis-related text
- Guided breathing exercises for stress management
- Multi-language support (Hebrew, English, Arabic)