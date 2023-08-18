import { resolve } from "path";
import { Content } from "../models/content";
import { load } from "./state";

const express = require('express');
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube({ version: 'v3' });
const fs = require('fs');

export async function youtubeRobot() {
    console.log('> [youtube-robot] Starting...');
    const content: Content = load();

    await authenticatedWithOAuth();
    const videoInformation = await uploadVideo(content);
    await uploadThumbnail(videoInformation);


    async function authenticatedWithOAuth() {
        console.log('> [youtube-robot] Authenticating...');
        const webServer = await startsWebServer();
        const OAuthClient = await createOAuthClient();
        await requestUserConsent(OAuthClient);
        const authorizationToken = await waitForGoogleCallback(webServer);
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
        await setGlobalGoogleAuthentication(OAuthClient);
        await stopWebServer(webServer);

        console.log('> [youtube-robot] Authenticated!');
    }

    async function startsWebServer() {
        return new Promise((resolve, reject) => {
            const port = 5000;
            const app = express();

            const server = app.listen(port, () => {
                console.log(`> Listening on http://localhost:${port}`)

                resolve({
                    app,
                    server
                })
            })
        })
    }

    async function createOAuthClient() {
        const credentials = require('../credentials/oauth-credentials.json');

        const OAuthClient = new OAuth2(
            credentials.web.client_id,
            credentials.web.client_secret,
            credentials.web.redirect_uris[0]
        )

        return OAuthClient;
    }

    async function requestUserConsent(OAuthClient: any) {
        const consentUrl = OAuthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/youtube']
        });

        console.log(`> [youtube-robot] Please give your consent: ${consentUrl}`);
    }

    async function waitForGoogleCallback(webServer: any) {
        return new Promise((resolve, reject) => {
            console.log('> [youtube-robot] Waiting for user consent...');

            webServer.app.get('/oauth2callback', (req: any, res: any) => {
                const authCode = req.query.code;
                console.log(`> Consent given: ${authCode}`);

                res.send('<h1>Thank you!</h1><p>Now close this tab.</p>');
                resolve(authCode);
            })
        })
    }

    async function requestGoogleForAccessTokens(OAuthClient: any, authorizationToken: any): Promise<void> {
        return new Promise((resolve, reject) => {
            OAuthClient.getToken(authorizationToken, (error: any, tokens: any) => {
                if(error) {
                    return reject(error);
                }

                console.log('> [youtube-robot] Access token received');
                // console.log(tokens);

                OAuthClient.setCredentials(tokens);
                resolve();
            })
        })
    }

    async function setGlobalGoogleAuthentication(OAuthClient: any) {
        google.options({
            auth: OAuthClient
        });
    }

    async function stopWebServer(webServer: any): Promise<void> {
        return new Promise((resolve, reject) => {
            webServer.server.close(() => {
                resolve();
            })
        })
    }


    async function uploadVideo(Content: Content) {
        console.log('> [youtube-robot] Uploading video at Youtube...');

        const videoFilePath = '/sf/video-maker-ts/content/video.mp4';
        const videoFileSize = fs.statSync(videoFilePath).size;
        const videoTitle = `${content.prefix} ${content.searchTerm}`;
        const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
        const videoDescription = content.sentences.map((sentence) => {
            return sentence.text
        }).join('\n\n');

        const requestParameters = {
            part: 'snippet, status',
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription,
                    tags: videoTags
                },
                status: {
                    privacyStatus: 'unlisted',
                    selfDeclaredMadeForKids: false
                }
            },
            media: {
                body: fs.createReadStream(videoFilePath)
            }
        }

        const youtubeResponse = await youtube.videos.insert(requestParameters, {
            onUploadProgress: onUploadProgress
        });

        console.log(`> [youtube-robot] Video available at: https://youtu.be/${youtubeResponse.data.id}`);
        return youtubeResponse.data

        function onUploadProgress(event: any) {
            const progress = Math.round( (event.bytesRead / videoFileSize) * 100 )
            console.log(`> ${progress}% completed`);
        }
    }

    async function uploadThumbnail(videoInformation: any) {
        console.log('> [youtube-robot] Uploading Thumbnail...');

        const videoId = videoInformation.id;
        const videoThumbnailFilePath = '/sf/video-maker-ts/content/youtube-thumbnail.jpg';

        const requestParameters = {
            videoId: videoId,
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(videoThumbnailFilePath)
            }
        }

        const youtubeResponse = await youtube.thumbnails.set(requestParameters);
        console.log(`> [youtube-robot] Thumbnail uploaded!`);
    }
}