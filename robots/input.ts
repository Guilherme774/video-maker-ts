import { Content } from "../models/content";
import { question, keyInSelect } from "readline-sync";
import { save } from "./state";

let content: Content = new Content();

export function inputRobot() {
    content.maximumSentences = 7;
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    save(content);

    function askAndReturnSearchTerm() {
        return question('Type a Wikipedia search term: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['What is', 'Who is', 'The history of'];
        const selectedPrefixIndex = keyInSelect(prefixes, 'Choose an option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];

        return selectedPrefixText;
    }
}