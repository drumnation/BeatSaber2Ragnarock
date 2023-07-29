import { processInfoFile } from './logic/processInfo';

export async function main() {
    const infoFileName: string = process.argv[2];
    if (!infoFileName) {
        console.error("ERROR: No file name given!");
        return;
    }

    try {
        await processInfoFile(infoFileName);
        console.log("All processing completed successfully.");
    } catch (error) {
        console.error("ERROR: Failed to process the provided file.", error);
    }
}
