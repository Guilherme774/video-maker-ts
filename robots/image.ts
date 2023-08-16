import { save, load } from "./state";
import axios from 'axios';
import { Content } from "../models/content";

const googleApiKey = require('../credentials/google.json');


export async function imageRobot() {
    const content = load();

    await fetchImageOfAllSentences(content);

    save(content);

    async function fetchGoogleAndReturnImageLinks(query: string) {
        const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey.apikey}&cx=${googleApiKey.search_engine_id}&searchType=image&q=${encodeURIComponent(query)}&fileType=jpg&hq=true&num=2`;
        
        try {
            const response = await axios.get(url);
            const imageResults = response.data.items;

            const imageUrls = imageResults.map((item: any) => item.link);
            return imageUrls;
        } catch (error) {
            console.error('Error searching images:', error);
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

imageRobot();