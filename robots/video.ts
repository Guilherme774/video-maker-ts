import { Content } from "../models/content";
import { load, save } from "./state";

import { exec } from 'child_process';
const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export async function videoRobot() {
    const content: Content = load();

    await convertAllImages(content);
    await createYouTubeThumbnail();
    await renderVideo(content);


    async function convertAllImages(content: Content) {
        console.log("> Editing images...");

        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            await convertImage(sentenceIndex);
        }
    }

    async function convertImage(sentenceIndex: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const inputFile = `/sf/video-maker-ts/content/${sentenceIndex}-original.png[0]`;
            const outputFile = `/sf/video-maker-ts/content/${sentenceIndex}-converted.png`;
            const width = 1920;
            const height = 1080;

            const commandToRun = `magick convert ${inputFile} -resize ${width}x${height} -gravity "Center" -extent ${width}x${height} ${outputFile}`;

            exec(commandToRun, (error, stdout, stderr) => {
              if (error) {
                  console.error(`[!] Error to convert image: ${error.message}`);
                  reject(error);
                  return;
              }
              if (stderr) {
                  console.error(`Erro no STDERR: ${stderr}`);
                  reject(new Error(stderr));
                  return;
              }
              console.log(`> Image: ${sentenceIndex}-original.png - converted`);
              resolve(); // Resolva a promessa quando a conversão estiver concluída.
            });
        })
    }

    async function createYouTubeThumbnail(): Promise<void> {
        console.log('> Creating Youtube thumbnail...');
        
        return new Promise((resolve, reject) => {
            const filePath = '/sf/video-maker-ts/content/0-converted.png';
            const outputPath = '/sf/video-maker-ts/content/youtube-thumbnail.jpg';
            const commandToExecThumbnail = `magick convert ${filePath} ${outputPath}`;

            exec(commandToExecThumbnail, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[!] Error to create thumbnail: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Erro no STDERR: ${stderr}`);
                    return;
                }
                console.log(`> Thumbnail created`);
                resolve();
            });
        })
    }


    async function renderVideo(content: Content): Promise<void> {
        console.log("> Starting video rendering...");
        let images: any = [];

        return new Promise((resolve, reject) => {
          for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            images.push({
              path: `/sf/video-maker-ts/content/${sentenceIndex}-converted.png`,
              caption: content.sentences[sentenceIndex].text
            });
          }
      
          const videoOptions = {
            fps: 25,
            loop: 5, // seconds
            transition: true,
            transitionDuration: 1, // seconds
            videoBitrate: 1024,
            videoCodec: "libx264",
            size: "640x?",
            audioBitrate: "128k",
            audioChannels: 2,
            format: "mp4",
            pixelFormat: "yuv420p",
            useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
            subtitleStyle: {
              Fontname: "Verdana",
              Fontsize: "26",
              PrimaryColour: "11861244",
              SecondaryColour: "11861244",
              TertiaryColour: "11861244",
              BackColour: "-2147483640",
              Bold: "2",
              Italic: "0",
              BorderStyle: "2",
              Outline: "2",
              Shadow: "3",
              Alignment: "1", // left, middle, right
              MarginL: "40",
              MarginR: "60",
              MarginV: "40"
            }
          };
      
          videoshow(images, videoOptions)
            .audio("/sf/video-maker-ts/content/audio.mp3")
            .save("/sf/video-maker-ts/content/video.mp4")
            .on("start", function(command: any) {
              console.log("ffmpeg process started:", command);
            })
            .on("error", function(err: any, stdout: any, stderr: any) {
              console.error("Error:", err);
              console.error("ffmpeg stderr:", stderr);

              reject(err);
            })
            .on("end", function(output: any) {
              console.error("Video created in:", output);
              resolve();
          });
        })
    }
}