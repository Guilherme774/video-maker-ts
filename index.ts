import { question, keyInSelect } from "readline-sync";
import { Content } from "./models/content";
import { textRobot } from "./robots/text";

let content: Content = new Content();

async function start() {
    content.maximumSentences = 7;
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    await textRobot(content);

    function askAndReturnSearchTerm() {
        return question('Type a Wikipedia search term: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['What is', 'Who is', 'The history of'];
        const selectedPrefixIndex = keyInSelect(prefixes, 'Choose an option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];

        return selectedPrefixText;
    }

    console.log(content);
}

start();