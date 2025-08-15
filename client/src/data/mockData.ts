import type { Article } from '../types'

export const mockArticles: Article[] = [
  {
    _id: '1',
    title: 'El futur de la literatura digital',
    url: 'futur-literatura-digital',
    section: 'articles',
    author: 'Maria Valls',
    summary: 'Una reflexió profunda sobre com la tecnologia està transformant la manera en què llegim i escrivim literatura.',
    imageCard: 'soler49-01',
    data: '15/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'La literatura està experimentant una transformació sense precedents...'
      }
    ],
    publicationDate: new Date('2024-12-15'),
    tags: ['literatura', 'tecnologia', 'futur'],
    readTime: 8
  },
  {
    _id: '2',
    title: 'Recomanació: "El vent que ens mou"',
    url: 'recomanacio-vent-que-ens-mou',
    section: 'llibres',
    author: 'Pere Gimferrer',
    summary: 'Una novel·la emotiva que explora les relacions familiars i els secrets del passat.',
    imageCard: 'escher',
    data: '10/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'Aquest llibre ens transporta a un món de emocions intenses...'
      }
    ],
    publicationDate: new Date('2024-12-10'),
    tags: ['novel·la', 'família', 'recomanació'],
    readTime: 12
  },
  {
    _id: '3',
    title: 'Entrevista amb Anna Puig',
    url: 'entrevista-anna-puig',
    section: 'entrevistes',
    author: 'Jordi Soler',
    summary: 'La poetessa catalana ens parla del seu nou recull i de la poesia contemporània.',
    imageCard: 'escher',
    data: '08/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'Anna Puig ens rep al seu despatx de Barcelona...'
      }
    ],
    publicationDate: new Date('2024-12-08'),
    tags: ['poesia', 'entrevista', 'literatura catalana'],
    readTime: 15
  },
  {
    _id: '4',
    title: 'Barcelona literària: ruta per Gràcia',
    url: 'barcelona-literaria-gracia',
    section: 'llocs',
    author: 'Marta Ribas',
    summary: 'Descobreix els racons més literaris del barri de Gràcia, des de cafès històrics fins a llibreries emblemàtiques.',
    imageCard: 'escher',
    data: '05/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'El barri de Gràcia ha estat sempre un refugi per a escriptors...'
      }
    ],
    publicationDate: new Date('2024-12-05'),
    tags: ['Barcelona', 'literatura', 'turisme'],
    readTime: 10
  },
  {
    _id: '5',
    title: 'Conte: La casa del carrer Major',
    url: 'conte-casa-carrer-major',
    section: 'creacio',
    author: 'Lluís Ventós',
    summary: 'Un conte original sobre la memòria i els secrets familiars ambientat en un poble de la Catalunya rural.',
    imageCard: 'escher',
    data: '02/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'La casa del carrer Major sempre havia estat un misteri...'
      }
    ],
    publicationDate: new Date('2024-12-02'),
    tags: ['conte', 'memòria', 'Catalunya'],
    readTime: 6
  },
  {
    _id: '6',
    title: 'Selecció cultural: desembre 2024',
    url: 'seleccio-cultural-desembre-2024',
    section: 'recomanacions',
    author: 'Redacció',
    summary: 'Les nostres recomanacions culturals per aquest mes: llibres, cinema, música i exposicions.',
    imageCard: 'escher',
    data: '01/12/2024',
    issue: 49,
    issueId: 'issue-49',
    year: 2024,
    issueNumber: 49,
    isPublished: true,
    text: [
      {
        type: 'paragraph',
        content: 'Aquest mes us recomanem una selecció especial...'
      }
    ],
    publicationDate: new Date('2024-12-01'),
    tags: ['cultura', 'recomanacions', 'actualitat'],
    readTime: 5
  }
]

// Generar más artículos para cada sección para el infinite scroll
const generateMoreArticles = (section: string, baseCount: number): Article[] => {
  const baseArticle = mockArticles.find(a => a.section === section) || mockArticles[0]
  const articles: Article[] = []
  
  for (let i = 1; i <= baseCount; i++) {
    articles.push({
      ...baseArticle,
      _id: `${section}-${i}`,
      title: `${baseArticle.title} ${i}`,
      url: `${baseArticle.url}-${i}`,
      data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      publicationDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    })
  }
  
  return articles
}

export const allMockArticles: Article[] = [
  ...mockArticles,
  ...generateMoreArticles('articles', 50),
  ...generateMoreArticles('llibres', 30),
  ...generateMoreArticles('creacio', 25),
  ...generateMoreArticles('entrevistes', 8),
  ...generateMoreArticles('llocs', 6),
  ...generateMoreArticles('recomanacions', 10)
]

export const mockIssue = {
  _id: 'issue-49',
  year: 2024,
  number: 49,
  title: 'Edició de desembre 2024',
  description: 'L\'última edició de Lletres Barbares amb els millors articles del mes',
  coverImage: 'portada-49.jpg',
  publicationDate: new Date('2024-12-01'),
  isPublished: true,
  totalArticles: allMockArticles.length,
  sections: ['articles', 'creacio', 'entrevistes', 'llibres', 'llocs', 'recomanacions']
}