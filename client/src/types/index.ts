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
  issue: number;
  data: string; // fecha en formato DD/MM/YYYY
  imageCard: string;
  title: string;
  url: string;
  section: 'articles' | 'creacio' | 'entrevistes' | 'llibres' | 'llocs' | 'recomanacions';
  author: string;
  summary: string;
  text: ArticleTextElement[];
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