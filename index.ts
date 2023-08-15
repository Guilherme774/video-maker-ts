import { textRobot } from "./robots/text";
import { inputRobot } from "./robots/input";
import { load } from "./robots/state";

async function start() {
    inputRobot();
    await textRobot();

    const content = load();

    console.dir(content, { depth: null });
}

start();