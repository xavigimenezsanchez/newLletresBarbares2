const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')

let mainWindow
let fileWatcher = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // En desarrollo, cargar desde Vite dev server
  mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.loadURL('http://localhost:5173')
  //   mainWindow.webContents.openDevTools()
  // } else {
  //   // En producción, cargar archivo local
  //   mainWindow.loadFile('dist/index.html')
  // }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleccionar carpeta de la edición'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('load-issue-data', async (event, folderPath) => {
  try {
    const issuePath = path.join(folderPath, 'issue.json')
    
    if (!fs.existsSync(issuePath)) {
      throw new Error('No se encontró el archivo issue.json')
    }

    const issueData = JSON.parse(fs.readFileSync(issuePath, 'utf-8'))
    
    // Cargar artículos de todas las carpetas
    const articles = []
    const sections = ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions']
    
    for (const section of sections) {
      const sectionPath = path.join(folderPath, section)
      if (fs.existsSync(sectionPath)) {
        const files = fs.readdirSync(sectionPath).filter(file => file.endsWith('.json'))
        
        for (const file of files) {
          const filePath = path.join(sectionPath, file)
          const articleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          articles.push(articleData)
        }
      }
    }

    return {
      issue: issueData,
      articles: articles
    }
  } catch (error) {
    console.error('Error loading issue data:', error)
    throw error
  }
})

ipcMain.handle('start-watching', async (event, folderPath) => {
  // Detener el watcher anterior si existe
  if (fileWatcher) {
    await fileWatcher.close()
  }

  // Crear nuevo watcher
  fileWatcher = chokidar.watch(folderPath, {
    ignored: /(^|[\/\\])\../, // ignorar archivos ocultos
    persistent: true
  })

  fileWatcher.on('change', (filePath) => {
    console.log('File changed:', filePath)
    mainWindow.webContents.send('file-changed', filePath)
  })

  fileWatcher.on('add', (filePath) => {
    console.log('File added:', filePath)
    mainWindow.webContents.send('file-added', filePath)
  })

  fileWatcher.on('unlink', (filePath) => {
    console.log('File removed:', filePath)
    mainWindow.webContents.send('file-removed', filePath)
  })

  return true
})

ipcMain.handle('stop-watching', async () => {
  if (fileWatcher) {
    await fileWatcher.close()
    fileWatcher = null
  }
  return true
})