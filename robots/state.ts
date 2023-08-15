import { Content } from "../models/content";
import { writeFileSync, readFileSync } from "fs";

const contentFilePath = './content.json';

export function save(content: Content) {
    const contentString = JSON.stringify(content);

    return writeFileSync(contentFilePath, contentString);
}

export function load() {
    const fileBuffer = readFileSync(contentFilePath, 'utf-8');
    const contentJson = JSON.parse(fileBuffer);
    
    return contentJson;
}