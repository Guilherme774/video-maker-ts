import { Content } from "../models/content";
import wiki from 'wikijs';
const sentenceBoundaryDetection = require('sbd');

export async function textRobot(content: Content) {
    await fetchContentFromWikipedia(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);


    async function fetchContentFromWikipedia(content: Content) {
        const wikipediaResponse = (await wiki().page(content.searchTerm).then(page => page.summary())).toString();
        const withoutDatesInParentheses = removeDatesInParentheses(wikipediaResponse)

        content.sourceContentOriginal = wikipediaResponse;
        content.sourceContentSanitized = withoutDatesInParentheses;
    }

    function removeDatesInParentheses(text: string) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
    }

    function breakContentIntoSentences(content: Content) {
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

        for(let sentence of sentences) {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        }
    }

    function limitMaximumSentences(content: Content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences);
    }
}