const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

// Check if we're in development mode
const isDev = !app.isPackaged;

let mainWindow = null;
let ollamaProcess = null;
const OLLAMA_PORT = 11435;

function getOllamaPath() {
  if (isDev) {
    return path.join(__dirname, '../resources/mac/ollama');
  } else {
    return path.join(process.resourcesPath, 'resources/mac/ollama'); // Note: during packaging, we'll put it directly in resources
  }
}

function ensureModelInUserData() {
  const userDataModelsPath = path.join(app.getPath('userData'), 'ollama-models');
  if (!fs.existsSync(userDataModelsPath)) {
    fs.mkdirSync(userDataModelsPath, { recursive: true });
    
    // Copy bundled models over if they exist
    const bundledModelsPath = isDev 
      ? path.join(__dirname, '../resources/models')
      : path.join(process.resourcesPath, 'resources/models');
      
    if (fs.existsSync(bundledModelsPath)) {
      console.log('Initial launch: Copying bundled models to user data directory...');
      try {
        fs.cpSync(bundledModelsPath, userDataModelsPath, { recursive: true });
      } catch (err) {
        console.error('Error copying bundled models:', err);
      }
    }
  }
  return userDataModelsPath;
}

// Function to check if Ollama is already running on our port
async function checkOllamaRunning() {
  try {
    const res = await fetch(`http://127.0.0.1:${OLLAMA_PORT}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

// Function to start bundled Ollama server
async function startOllama() {
  try {
    const isRunning = await checkOllamaRunning();
    if (isRunning) {
      console.log('Bundled Ollama is already running');
      return true;
    }

    const ollamaPath = getOllamaPath();
    if (!fs.existsSync(ollamaPath)) {
      console.error('Bundled Ollama binary not found at:', ollamaPath);
      return false;
    }

    const userDataModelsPath = ensureModelInUserData();

    ollamaProcess = spawn(ollamaPath, ['serve'], {
      detached: false,
      env: {
        ...process.env,
        OLLAMA_HOST: `127.0.0.1:${OLLAMA_PORT}`,
        OLLAMA_MODELS: userDataModelsPath
      }
    });

    ollamaProcess.on('error', (error) => {
      console.error('Failed to start bundled Ollama:', error);
    });

    ollamaProcess.on('close', (code) => {
      console.log(`Ollama process exited with code ${code}`);
      ollamaProcess = null;
    });

    // Wait a moment for Ollama to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Bundled Ollama server started successfully on port', OLLAMA_PORT);
    return true;
  } catch (error) {
    console.error('Error starting Ollama:', error);
    return false;
  }
}

// Function to stop Ollama server
function stopOllama() {
  if (ollamaProcess) {
    console.log('Stopping bundled Ollama server...');
    ollamaProcess.kill('SIGTERM');
    ollamaProcess = null;
  }
}

function createWindow() {
  try {
    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.cjs'),
        webSecurity: false // Allow localhost connections
      },
      titleBarStyle: 'hiddenInset',
      show: false,
      backgroundColor: '#000000',
    });

    // Set Content Security Policy to allow localhost connections
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ['default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' http://localhost:* https://localhost:*']
        }
      });
    });

    // Load the app
    if (isDev) {
      // Development mode - try different ports
      console.log('Running in development mode...');
      
      // Try to detect the correct port by checking which one is available
      const tryPort = async (port) => {
        try {
          const response = await fetch(`http://localhost:${port}`);
          return port;
        } catch (error) {
          return null;
        }
      };
      
      // Try common Vite ports
      const ports = [5173, 5174, 5175, 5176, 5177];
      let selectedPort = 5173; // default
      
      // Use 5173 as the default port
      selectedPort = 5173;
      
      console.log(`Loading development server on port ${selectedPort}...`);
      mainWindow.loadURL(`http://localhost:${selectedPort}`);
      mainWindow.webContents.openDevTools();
    } else {
      // Production mode
      const indexPath = path.join(__dirname, '../dist/index.html');
      console.log('Loading production build from:', indexPath);
      mainWindow.loadFile(indexPath);
      // Open dev tools in production for debugging
      mainWindow.webContents.openDevTools();
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Error handling
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });

  } catch (error) {
    console.error('Error creating window:', error);
  }
}

// Create window when app is ready
app.whenReady().then(async () => {
  // Start Ollama server first
  await startOllama();
  
  createWindow();
  createMenu();
});

// macOS: Re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopOllama();
    app.quit();
  }
});

// Clean up when app is about to quit
app.on('before-quit', () => {
  stopOllama();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

function createMenu() {
  const template = [
    {
      label: 'Alaka',
      submenu: [
        {
          label: 'About Alaka',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Quit Alaka',
          accelerator: 'Cmd+Q',
          click: () => {
            stopOllama();
            app.quit();
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'Cmd+N',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('new-chat');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Close Window',
          accelerator: 'Cmd+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Cmd+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+Cmd+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Cmd+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Cmd+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Cmd+V', role: 'paste' },
        { label: 'Select All', accelerator: 'Cmd+A', role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Cmd+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'Cmd+Shift+R', role: 'forcereload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggledevtools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'Cmd+0', role: 'resetzoom' },
        { label: 'Zoom In', accelerator: 'Cmd+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'Cmd+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Cmd+M', role: 'minimize' },
        { label: 'Close', accelerator: 'Cmd+W', role: 'close' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
}); 