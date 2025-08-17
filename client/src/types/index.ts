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
  issue: number;
  data: string; // fecha en formato DD/MM/YYYY
  imageCard: string;
  title: string;
  url: string;
  section: 'articles' | 'creacio' | 'entrevistes' | 'llibres' | 'llocs' | 'recomanacions';
  author: string;
  summary: string;
  text: ArticleTextElement[];
  // Campos adicionales para compatibilidad con API
  issueId?: string;
  year?: number;
  issueNumber?: number;
  isPublished?: boolean;
  publicationDate?: Date;
  tags?: string[];
  readTime?: number;
}

export interface Issue {
  year: number;
  number: number;
  articles: Article[];
  creacio: Article[];
  entrevistes: Article[];
  llibres: Article[];
  llocs: Article[];
  recomanacions: Article[];
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