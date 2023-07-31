import { version } from '../BeatSaber2Ragnarock.logic';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { processSong } from './processSong';

export async function loadInfoFile(infoFileName: string): Promise<any> {
    const data: string = await fs.readFile(infoFileName, 'utf-8');
    try {
        console.log("data", data);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error parsing JSON from file ${infoFileName}:`, error);
        throw error;
    }
}

export async function processAllSongs(info: any, dirPath: string) {
    for (let difficultyBeatmapSet of info._difficultyBeatmapSets) {
        for (let difficultyBeatmap of difficultyBeatmapSet._difficultyBeatmaps) {
            const filePath: string = join(dirPath, difficultyBeatmap._beatmapFilename);
            console.log(`Processing song at filePath: ${filePath}`);
            await processSong(filePath);
        }
    }
}

export function addEditorInfo(info: any) {
    if (!info._customData._editors) {
        info._customData._editors = {};
    }
    info._customData._editors.BeatSaber2Ragnarock = {
        version: version,
        source: "https://github.com/drumnation/BeatSaber2Ragnarock"
    };
    info._levelAuthorName = "drumnation";
    info._customData._editors._lastEditedBy = "BeatSaber2Ragnarock";
    return info;
}

export async function saveInfoFile(infoFileName: string, info: any) {
    const updatedInfoData: string = JSON.stringify(info, null, 4);
    await fs.writeFile(infoFileName, updatedInfoData, 'utf-8');
}

export async function processInfoFile(infoFileName: string) {
    try {
        let info = await loadInfoFile(infoFileName);
        const dirPath: string = dirname(infoFileName);

        await processAllSongs(info, dirPath);
        info = addEditorInfo(info);
        console.log("info", info);

        await saveInfoFile(infoFileName, info);
    } catch (error) {
        console.error(`ERROR: Failed to process info file "${infoFileName}".`, error);
    }
}