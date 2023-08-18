import { save, load } from "./state";
import axios from 'axios';
import { Content } from "../models/content";
import { google } from "googleapis";
const imageDownloader = require('image-downloader');
const customSearch = google.customsearch('v1');

const googleApiKey = require('../credentials/google.json');


export async function imageRobot() {
    const content = load();

    console.log('> [video-root] Starting...');
    await fetchImageOfAllSentences(content);
    
    console.log('> [image-robot] Downloading images...');
    await downloadAllImages(content);

    save(content);

    async function fetchGoogleAndReturnImageLinks(query: string) {
        console.log(query);

        const response = await customSearch.cse.list({
            auth: googleApiKey.apikey,
            cx: googleApiKey.search_engine_id,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imagesUrl: any = response.data.items?.map((item: any) => {
            return item.link;
        })

        return imagesUrl;
    }

    async function fetchImageOfAllSentences(content: Content) {
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            let query: string;

            if(sentenceIndex === 0) {
                query = `${content.searchTerm}`
            }
            else {
                query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
            }

            console.log(`> [image-robot] Querying Google Images with: "${query}"`);

            content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImageLinks(query);
            content.sentences[sentenceIndex].googleSearchQuery = query;
        }
    }


    async function downloadAllImages(content: Content) {
        content.downloadedImages = [];

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images;

            for(let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex];

                try {
                    if(content.downloadedImages.includes(imageUrl)) throw new Error('> [image-robot] [!] Image already downloaded!');

                    await downloadAndSaveImage(imageUrl, `${sentenceIndex}-original.png`);
                    content.downloadedImages.push(imageUrl);
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded`);
                    break;
                }
                catch (error) {
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error to download: (${imageUrl}) : ${error}`);
                }
            }
        }

        console.log('> [image-robot] Download completed!');
    }

    async function downloadAndSaveImage(url: string, fileName: string) {
        return imageDownloader.image({
            url: url,
            dest: `/sf/video-maker-ts/content/${fileName}`
        })
    }
}