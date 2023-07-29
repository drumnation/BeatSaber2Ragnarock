

import { main } from './BeatSaber2Ragnarock';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { processSong } from './logic/processSong';
import { Info, Note } from 'types';

import { originalSongPath, setupBeforeEach, teardownAfterEach, tempInfoPath, tempSongPath } from './config/setupTests';

beforeEach(async () => {
    await setupBeforeEach();
});

afterEach(async () => {
    await teardownAfterEach();
});

test('main function test', async () => {
    await main();

    const infoData = await fsPromises.readFile(tempInfoPath, 'utf8');
    const info: Info = JSON.parse(infoData);

    if (typeof info._customData._editors.BeatSaber2Ragnarock !== 'string') {
        expect(info._customData._editors.BeatSaber2Ragnarock.version).toBe('0.2.0');
    }

    expect(info._customData._editors._lastEditedBy).toBe('BeatSaber2Ragnarock');
});

describe('processSong function', () => {
    test('should remove notes with a neighboring note in the same _lineIndex and within a time difference defined by timeEpsilon', async () => {
        const epsilon: number = 0.16;

        // load original song
        const originalSongData: string = fs.readFileSync(originalSongPath, 'utf8');
        const originalSong: any = JSON.parse(originalSongData);

        // process song
        await processSong(tempSongPath);

        // load processed song
        const processedSongData: string = fs.readFileSync(tempSongPath, 'utf8');
        const processedSong: any = JSON.parse(processedSongData);

        // Test Case 1: Ensure that notes with a neighboring note in the same _lineIndex and within a time difference defined by timeEpsilon are removed
        const notes1: Note[] = originalSong._notes;
        let expectedNotes1: Note[] = notes1.filter((note, index) => {
            let neighbors = notes1.filter((neighborNote, neighborIndex) => 
                neighborIndex !== index && note._lineIndex === neighborNote._lineIndex && Math.abs(note._time - neighborNote._time) < epsilon);
            return neighbors.length <= 1;
        });
        console.log(`expectedNotes1 length: ${expectedNotes1.length}`);
        // Second filtering operation
        expectedNotes1 = expectedNotes1.filter((note, index) => {
            let nextNotes = expectedNotes1.slice(index + 1, index + 4);
            return nextNotes.filter(neighborNote => Math.abs(note._time - neighborNote._time) < epsilon).length <= 1;
        });

        expect(processedSong._notes.length).toBe(expectedNotes1.length);
    });

    test('should squash all notes into line layer 1, make them red, and set their cut direction to downward', async () => {
        // process song
        await processSong(tempSongPath);

        // load processed song
        const processedSongData: string = fs.readFileSync(tempSongPath, 'utf8');
        const processedSong: any = JSON.parse(processedSongData);

        // Test Case 2: Ensure that all notes are squashed into line layer 1, made red, and have their cut direction set to downward
        const notes2: Note[] = processedSong._notes;
        expect(notes2.every(note => note._lineLayer === 1 && note._type === 0 && note._cutDirection === 1)).toBe(true);
    });

    test('should remove notes with more than one neighboring note within a time difference defined by timeEpsilon', async () => {
        const epsilon: number = 0.16;

        // load original song
        const originalSongData: string = fs.readFileSync(originalSongPath, 'utf8');
        const originalSong: any = JSON.parse(originalSongData);

        // process song
        await processSong(tempSongPath);

        // load processed song
        const processedSongData: string = fs.readFileSync(tempSongPath, 'utf8');
        const processedSong: any = JSON.parse(processedSongData);

        // Test Case 3: Ensure that notes with more than one neighboring note within a time difference defined by timeEpsilon are removed
        // Apply first filtering operation
        let notes3: Note[] = originalSong._notes.filter((note: Note, index: number) => {
            let nextNotes = originalSong._notes.slice(index + 1, index + 4);
            return nextNotes.filter((neighborNote: Note) => Math.abs(note._time - neighborNote._time) < epsilon && neighborNote._lineIndex === note._lineIndex).length === 0;
        });

        // Apply second filtering operation
        let expectedNotes3: Note[] = notes3.filter((note, index) => {
            let neighbors = notes3.filter((neighborNote, neighborIndex) => 
                neighborIndex !== index && Math.abs(note._time - neighborNote._time) < epsilon);
            return neighbors.length <= 1;
        });

        expect(processedSong._notes.length).toBe(expectedNotes3.length);
    });
});


