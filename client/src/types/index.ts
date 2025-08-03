export interface ArticleTextElement {
  type: 'paragraph' | 'title' | 'image' | 'footnotes';
  content: string;
  name?: string;
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