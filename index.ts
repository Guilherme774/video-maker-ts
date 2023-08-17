import { textRobot } from "./robots/text";
import { inputRobot } from "./robots/input";
import { imageRobot } from "./robots/image";
import { videoRobot } from "./robots/video";

async function start() {
    inputRobot();
    await textRobot();
    await imageRobot();
    await videoRobot();
}

start();