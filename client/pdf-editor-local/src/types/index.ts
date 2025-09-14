export interface ArticleTextElement {
  type: 'paragraph' | 'paragraph2' | 'title' | 'title2' | 'question' | 'image' | 'video' | 'youtube' | 'biography' | 'footnotes' | 'image-foot';
  content: string;
  name?: string;
  className?: string;
  reference?: string;
  styles?: string;
  image?: {
    name: string;
  };
  foot?: string;
  biography?: string[];
  notes?: Footnote[];
  divided?: boolean;
  path?: string;
}

export interface Footnote {
  number: number;
  content: string;
}

export interface Article {
  _id?: string;
  issueId?: string;
  issue: number;
  data: string;
  imageCard?: string;
  title: string;
  titlePdf?: string;
  url: string;
  section: 'articles' | 'creacio' | 'entrevistes' | 'llibres' | 'llocs' | 'recomanacions';
  authors: string[];
  author?: string;
  summary: string;
  text: Array<{
    type: 'paragraph' | 'title' | 'image' | 'video' | 'youtube' | 'biography' | 'footnotes';
    content: string;
    name?: string;
    pdf?: {
      page: number;
      type?: 'qr';
      path?: string;
      division?: {
        alignLast?: boolean;
        contentPage: string;
        contentNextPage: string;
      };
    };
  }>;
  publicationDate?: string;
  isPublished?: boolean;
  tags?: string[];
  readTime?: number;
  year?: number;
  issueNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Issue {
  _id?: string;
  number: number;
  year: number;
  title: string;
  description?: string;
  coverImage?: string;
  publicationDate: string;
  isPublished: boolean;
  articles?: Article[];
  totalArticles?: number;
  sections?: string[];
  pdfManual?: boolean;
  articlesOrder?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageContent {
  elements: ArticleTextElement[]
  hasHeader: boolean
  pageNumber: number
  totalPages: number
}

export interface ArticlesPdfManual {
  article: Article
  pagesNumber: number
  pages: PageContent[]
}

// Declaración global para electronAPI
declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      loadIssueData: (folderPath: string) => Promise<{ issue: Issue; articles: Article[] }>;
      startWatching: (folderPath: string) => Promise<boolean>;
      stopWatching: () => Promise<boolean>;
      onFileChanged: (callback: (filePath: string) => void) => void;
      onFileAdded: (callback: (filePath: string) => void) => void;
      onFileRemoved: (callback: (filePath: string) => void) => void;
    };
  }
}