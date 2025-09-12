# Editor PDF Local - Lletres Bàrbares

Esta es una aplicación local independiente para editar y visualizar PDFs de las ediciones de Lletres Bàrbares. La aplicación lee los datos directamente de archivos JSON locales en lugar de usar la base de datos.

## Características

- **Visualización PDF**: Usa la misma página `EdicioPDFPage` que la aplicación principal
- **Observación de archivos**: Se actualiza automáticamente cuando detecta cambios en los archivos
- **Interfaz local**: Permite seleccionar la carpeta de la edición a editar
- **Sin dependencias de base de datos**: Lee directamente de archivos JSON

## Estructura de archivos requerida

La aplicación espera encontrar la siguiente estructura en la carpeta seleccionada:

```
carpeta-edicion/
├── issue.json          # Archivo con información de la edición
├── articles/           # Carpeta con artículos
│   ├── 1.json
│   ├── 2.json
│   └── ...
├── creacio/           # Carpeta con creaciones
│   ├── 1.json
│   └── ...
├── llibres/           # Carpeta con libros
│   ├── 1.json
│   └── ...
└── ...                # Otras carpetas (entrevistes, llocs, recomanacions)
```

## Instalación y uso

### Opción 1: Script de inicio automático (Recomendado)

```bash
cd pdf-editor-local
./start.sh
```

### Opción 2: Comandos manuales

1. Instalar dependencias:
```bash
cd pdf-editor-local
npm install
```

2. **Desarrollo con Electron (Recomendado):**
```bash
npm run electron-dev
```

3. **Solo servidor web (Limitado):**
```bash
npm run dev
```
⚠️ **Nota:** El modo web tiene funcionalidad limitada. Usa `npm run electron-dev` para funcionalidad completa.

### Producción

1. Construir la aplicación:
```bash
npm run build-electron
```

2. Ejecutar la aplicación construida desde la carpeta `dist-electron`

## Uso

1. **Seleccionar carpeta**: Al iniciar la aplicación, haz clic en "Seleccionar Carpeta" y elige la carpeta que contiene la edición (ej: `/client/documents/2025/51`)

2. **Visualizar PDF**: Una vez seleccionada la carpeta, la aplicación cargará automáticamente los datos y mostrará la vista PDF

3. **Edición en tiempo real**: La aplicación observa los archivos de la carpeta. Cuando modifiques cualquier archivo JSON, la vista PDF se actualizará automáticamente

4. **Cambiar carpeta**: Puedes cambiar la carpeta en cualquier momento usando el botón "Cambiar Carpeta" en la parte superior

## Formato de archivos

### issue.json
```json
{
  "year": 2025,
  "number": 50,
  "publicationDate": "2025-08-31T00:00:00.000Z",
  "title": "Lletres Barbares - Número 50",
  "isPublished": true,
  "totalArticles": 12,
  "sections": ["articles", "creacio", "llibres"],
  "pdfManual": true,
  "articlesOrder": ["article_id_1", "article_id_2", ...]
}
```

### Archivos de artículos
Los archivos de artículos deben seguir el mismo formato que en la aplicación principal, con campos como:
- `_id`: Identificador único
- `title`: Título del artículo
- `section`: Sección (articles, creacio, llibres, etc.)
- `authors`: Array de autores
- `text`: Array de elementos de texto con información PDF
- `pdf`: Información de paginación manual (si aplica)

## Tecnologías utilizadas

- **React**: Framework de interfaz de usuario
- **TypeScript**: Tipado estático
- **Electron**: Aplicación de escritorio
- **Chokidar**: Observación de archivos
- **Vite**: Herramienta de construcción

## Desarrollo

Para contribuir al desarrollo:

1. Modifica los archivos en `src/`
2. Los cambios se reflejarán automáticamente en modo desarrollo
3. Para cambios en el proceso principal de Electron, reinicia la aplicación

## Notas

- Esta aplicación está diseñada para uso local únicamente
- No requiere conexión a internet ni base de datos
- Los archivos JSON deben seguir el formato exacto de la aplicación principal
- La aplicación observa todos los archivos en la carpeta seleccionada, incluyendo subcarpetas