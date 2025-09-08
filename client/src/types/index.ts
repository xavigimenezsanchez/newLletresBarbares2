export interface ArticleTextElement {
  type: 'paragraph' | 'paragraph2' | 'title' | 'title2' | 'question' | 'image' | 'video' | 'youtube' | 'biography' | 'footnotes';
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
  url: string;
  section: 'articles' | 'creacio' | 'entrevistes' | 'llibres' | 'llocs' | 'recomanacions';
  // CAMBIO: author → authors (array de strings)
  authors: string[];
  // Mantener author por compatibilidad durante la migración
  author?: string;
  summary: string;
  text: Array<{
    type: 'paragraph' | 'title' | 'image' | 'video' | 'youtube' | 'biography' | 'footnotes';
    content: string;
    name?: string;
    pdf?: {
      page: number;
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
  // Campos para generación manual de PDF
  pdfManual?: boolean;
  articlesOrder?: string[]; // Array de IDs de artículos
  createdAt?: string;
  updatedAt?: string;
}

export interface MagazineData {
  issues: Issue[];
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface HeroSection {
  title: string;
  subtitle: string;
  featuredArticle?: Article;
}

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export interface Author {
  _id?: string;
  name: string;
  slug: string;
  bio: {
    short: string;
    full: string;
  };
  photo?: string;
  contact?: {
    email?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  profession?: string;
  location?: string;
  birthDate?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  awards?: Array<{
    name: string;
    year: number;
    description: string;
  }>;
  specialties?: string[];
  stats: {
    totalArticles: number;
    firstPublication?: string;
    lastPublication?: string;
    totalViews: number;
  };
  isActive: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorStats {
  sectionStats: Array<{
    _id: string;
    count: number;
  }>;
  yearStats: Array<{
    _id: number;
    count: number;
  }>;
  totalArticles: number;
  firstPublication?: string;
  lastPublication?: string;
}

export interface SearchResult {
  articles: Article[];
  total: number;
  page: number;
  pages: number;
  query?: string;
}

export interface SearchAnalytics {
  _id?: string;
  query: string;
  results: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
} 