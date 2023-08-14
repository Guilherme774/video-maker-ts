import { Content } from "../models/content";
import wiki from 'wikijs';

export async function textRobot(content: Content) {
    await fetchContentFromWikipedia(content);

    async function fetchContentFromWikipedia(content: Content) {
        const wikipediaResponse = (await wiki().page(content.searchTerm).then(page => page.summary())).toString();
        const withoutDatesInParentheses = removeDatesInParentheses(wikipediaResponse)

        content.sourceContentOriginal = wikipediaResponse;
        content.sourceContentSanitized = withoutDatesInParentheses;
    }

    function removeDatesInParentheses(text: string) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
    }
}