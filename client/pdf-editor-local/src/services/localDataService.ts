import type { Issue, Article } from '../types'

class LocalDataService {
  private currentFolderPath: string | null = null

  async selectFolder(): Promise<string | null> {
    if (window.electronAPI) {
      this.currentFolderPath = await window.electronAPI.selectFolder()
      return this.currentFolderPath
    }
    
    // Fallback para desarrollo web (sin Electron)
    console.warn('Electron API no disponible. Usando fallback para desarrollo web.')
    const folderPath = prompt('Introduce la ruta de la carpeta de la edición:')
    if (folderPath) {
      this.currentFolderPath = folderPath
      return folderPath
    }
    return null
  }

  async loadIssueData(folderPath?: string): Promise<{ issue: Issue; articles: Article[] }> {
    const path = folderPath || this.currentFolderPath
    if (!path) {
      throw new Error('No se ha seleccionado ninguna carpeta')
    }

    if (window.electronAPI) {
      return await window.electronAPI.loadIssueData(path)
    }

    // Fallback para desarrollo web (sin Electron)
    return this.loadIssueDataWeb(path)
  }

  private async loadIssueDataWeb(_folderPath: string): Promise<{ issue: Issue; articles: Article[] }> {
    // Para desarrollo web, necesitaríamos un servidor local que sirva los archivos
    // Por ahora, lanzamos un error con instrucciones más claras
    throw new Error('Para usar esta aplicación, ejecuta: npm run electron-dev (no npm run dev)')
  }

  async startWatching(folderPath?: string): Promise<boolean> {
    const path = folderPath || this.currentFolderPath
    if (!path) {
      throw new Error('No se ha seleccionado ninguna carpeta')
    }

    if (window.electronAPI) {
      return await window.electronAPI.startWatching(path)
    }
    return false
  }

  async stopWatching(): Promise<boolean> {
    if (window.electronAPI) {
      return await window.electronAPI.stopWatching()
    }
    return false
  }

  onFileChanged(callback: (filePath: string) => void): void {
    if (window.electronAPI) {
      window.electronAPI.onFileChanged(callback)
    }
  }

  onFileAdded(callback: (filePath: string) => void): void {
    if (window.electronAPI) {
      window.electronAPI.onFileAdded(callback)
    }
  }

  onFileRemoved(callback: (filePath: string) => void): void {
    if (window.electronAPI) {
      window.electronAPI.onFileRemoved(callback)
    }
  }

  getCurrentFolderPath(): string | null {
    return this.currentFolderPath
  }
}

export const localDataService = new LocalDataService()