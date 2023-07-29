import { promises as fsPromises } from 'fs';
import * as fs from 'fs';
import * as path from 'path';

export const tempDir = path.join(__dirname, '../temp');
export const originalInfoPath = path.join(__dirname, '../sample/Info.dat');
export const tempInfoPath = path.join(tempDir, 'Info.dat');
export const originalSongPath = path.join(__dirname, '../sample/NoArrowsExpertPlus.dat');
export const tempSongPath = path.join(tempDir, 'NoArrowsExpertPlus.dat');

process.argv[2] = tempInfoPath;

let errorMock: jest.SpyInstance;

export const setupBeforeEach = async () => {
    errorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
    await fsPromises.mkdir(tempDir, { recursive: true }); // ensure the directory exists
    await fsPromises.copyFile(originalInfoPath, tempInfoPath);
    await fsPromises.copyFile(originalSongPath, tempSongPath);
};

export const teardownAfterEach = async () => {
    errorMock.mockRestore();
    try {
        if (fs.existsSync(tempInfoPath)) {
            fs.unlinkSync(tempInfoPath);
        }
        if (fs.existsSync(tempSongPath)) {
            fs.unlinkSync(tempSongPath);
        }
    } catch (error) {
        console.error('Error while deleting files: ', error);
    }
};

