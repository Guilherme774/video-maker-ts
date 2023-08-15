import { Content } from "../models/content";
import { save, load } from "./state";
import wiki from 'wikijs';

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const sentenceBoundaryDetection = require('sbd');
const watsonApiKey = require('../credentials/watson-nlu.json').apikey;
const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com'
});


export async function textRobot() {
    const content: Content = load();

    await fetchContentFromWikipedia(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);
    await fetchKeywordsOfAllSentences(content);

    save(content);


    async function fetchContentFromWikipedia(content: Content) {
        const wikipediaResponse = (await wiki().page(content.searchTerm).then(page => page.summary())).toString();
        const withoutDatesInParentheses = removeDatesInParentheses(wikipediaResponse);

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

    async function fetchWatsonAndReturnKeywords(sentence: string): Promise<any> {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            })
            .then((response: any) => {
                const keywords = response.result.keywords.map((keyword: any) => {
                    return keyword.text;
                })

                resolve(keywords);
            })
        })
    }

    async function fetchKeywordsOfAllSentences(content: Content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
        }
    }
}