export class Content {
    searchTerm: string = '';
    prefix: string = '';
    sourceContentOriginal: string = '';
    sourceContentSanitized: string = '';
    sentences: Sentence[] = [];
    maximumSentences: number = 0;
    googleSearchQuery: string = '';
}

class Sentence {
    text: string = '';
    keywords: string[] = [];
    images: string[] = [];
}