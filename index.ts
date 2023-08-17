import { textRobot } from "./robots/text";
import { inputRobot } from "./robots/input";
import { load } from "./robots/state";
import { imageRobot } from "./robots/image";
import { videoRobot } from "./robots/video";

async function start() {
    // inputRobot();
    // await textRobot();
    // await imageRobot();
    await videoRobot();

    const content = load();

    // console.dir(content, { depth: null });
    // console.log('> Done!');
}

start();