import { save, load } from "./state";
import axios from 'axios';
import { Content } from "../models/content";
const imageDownloader = require('image-downloader');

const googleApiKey = require('../credentials/google.json');


export async function imageRobot() {
    const content = load();

    console.log(`> Searching for ${content.searchTerm} images...`);
    await fetchImageOfAllSentences(content);
    
    console.log('> Downloading images...');
    await downloadAllImages(content);

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


    async function downloadAllImages(content: Content) {
        content.downloadedImages = [];

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images;

            for(let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex];

                try {
                    if(content.downloadedImages.includes(imageUrl)) throw new Error('[!] Image already downloaded!');

                    await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`);
                    content.downloadedImages.push(imageUrl);
                    console.log(`> [${sentenceIndex}][${imageIndex}] Image downloaded`);
                    break;
                }
                catch (error) {
                    console.log(`> [${sentenceIndex}][${imageIndex}] Error to download: (${imageUrl}) : ${error}`);
                }
            }
        }
    }

    async function downloadAndSaveImage(url: string, fileName: string) {
        return imageDownloader.image({
            url: url,
            dest: `/sf/video-maker-ts/content/${fileName}`
        })
    }
}