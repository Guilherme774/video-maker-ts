import { save, load } from "./state";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Content } from "../models/content";

export async function imageRobot() {
    const content = load();

    await fetchImageOfAllSentences(content);

    save(content);

    async function fetchGoogleAndReturnImageLinks(query: string): Promise<string[]> {
        let counter: number = 1;
        const searchUrl = `https://www.google.com/search?q=${query}&tbm=isch`;

        try {
            const response = await axios.get(searchUrl);
            const $ = cheerio.load(response.data);
            const imageUrls: string[] = [];

            $('img').each((index, element) => {
                const imageUrl = $(element).attr('src');
                const imageAlt = $(element).attr('alt');

                if (imageUrl && imageUrl.startsWith('http') && counter <= 2) {
                  imageUrls.push(imageUrl);
                  counter++;
                }
              });
          
              return imageUrls;
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            return [];
        }
    }

    async function fetchImageOfAllSentences(content: Content) {
        for(let sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImageLinks(query);

            content.googleSearchQuery = query;
        }
    }
}