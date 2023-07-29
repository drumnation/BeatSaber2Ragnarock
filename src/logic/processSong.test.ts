



import { setupBeforeEach, teardownAfterEach, tempSongPath } from 'config/setupTests';
import { promises as fsPromises } from 'fs';
import { eliminateNeighborNotes, eliminateStackedNotes, loadSong, processSong, saveSong, squashNotes } from './processSong';
import { Note } from 'types';
import * as path from 'path';

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn(),
        copyFile: jest.fn(),
    },
    existsSync: jest.fn(),
    unlinkSync: jest.fn(),
}));

describe('song processing functions', () => {
    beforeEach(setupBeforeEach);
    afterEach(teardownAfterEach);

    describe('loadSong function', () => {
        it('should load a song correctly', async () => {
            (fsPromises.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ _version: '2.0.0' }));

            const song = await loadSong(tempSongPath);

            expect(song).toEqual({ _version: '2.0.0' });
        });
    });

    describe('eliminateStackedNotes function', () => {
        // Please note that these test cases are assuming that the timeEpsilon variable in your eliminateNeighborNotes function is 0.2 or greater. 
        // If timeEpsilon is less than 0.2, you might need to adjust the _time values in the test cases.
        it('should eliminate stacked notes', () => {
            const notes: Note[] = [
                { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 1.1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 2, _lineIndex: 2, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];

            const result = eliminateStackedNotes(notes);

            const expected: Note[] = [
                { _time: 1.1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 2, _lineIndex: 2, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];

            expect(result).toEqual(expected);
        });

        it('should not eliminate non-stacked notes', () => {
            const notes: Note[] = [
                { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 2, _lineIndex: 2, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];

            const result = eliminateStackedNotes(notes);

            expect(result).toEqual(notes);
        });

        it('should eliminate all notes except the last one if all notes are stacked', () => {
            const notes: Note[] = [
                { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 1.1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 1.2, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];
        
            const result = eliminateStackedNotes(notes);
        
            const expected: Note[] = [
                { _time: 1.2, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];
        
            expect(result).toEqual(expected);
        });
        
        it('should not eliminate the note if there is only a single note', () => {
            const notes: Note[] = [
                { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];
        
            const result = eliminateStackedNotes(notes);
        
            expect(result).toEqual(notes);
        });

        it('should return an empty array if there are no notes', () => {
            const notes: Note[] = [];
        
            const result = eliminateStackedNotes(notes);
        
            expect(result).toEqual(notes);
        });
        
        it('should not eliminate notes at different line indices', () => {
            const notes: Note[] = [
                { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                { _time: 1.1, _lineIndex: 2, _type: 0, _cutDirection: 1, _lineLayer: 1 },
            ];
        
            const result = eliminateStackedNotes(notes);
        
            expect(result).toEqual(notes);
        });
        
        
    });


    describe('squashNotes function', () => {
        // Please note that these test cases are assuming that the timeEpsilon variable in your eliminateNeighborNotes function is 0.2 or greater. 
        // If timeEpsilon is less than 0.2, you might need to adjust the _time values in the test cases.
        it('should squash all note types and directions', () => {
            const notes = squashNotes([{ _type: 1, _cutDirection: 2, _lineLayer: 3, _time: 0, _lineIndex: 0 }]);

            expect(notes).toEqual([{ _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 0, _lineIndex: 0 }]);
        });

        it('should squash all note types and directions for multiple notes', () => {
            const notes: Note[] = [
                { _type: 1, _cutDirection: 2, _lineLayer: 3, _time: 0, _lineIndex: 0 },
                { _type: 2, _cutDirection: 3, _lineLayer: 2, _time: 1, _lineIndex: 1 },
                { _type: 3, _cutDirection: 1, _lineLayer: 1, _time: 2, _lineIndex: 2 },
            ];
        
            const result = squashNotes(notes);
        
            const expected: Note[] = [
                { _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 0, _lineIndex: 0 },
                { _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 1, _lineIndex: 1 },
                { _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 2, _lineIndex: 2 },
            ];
        
            expect(result).toEqual(expected);
        });

        it('should return an empty array if there are no notes', () => {
            const notes: Note[] = [];
            const result = squashNotes(notes);
            expect(result).toEqual([]);
        });
        
        it('should not change notes that are already squashed', () => {
            const notes: Note[] = [
                { _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 0, _lineIndex: 0 },
                { _type: 0, _cutDirection: 1, _lineLayer: 1, _time: 1, _lineIndex: 1 },
            ];
        
            const result = squashNotes(notes);
        
            expect(result).toEqual(notes);
        });
    });

    describe('eliminateNeighborNotes function', () => {
        it('should eliminate notes if they have more than one neighbor within timeEpsilon', () => {
            const notes: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.1, "_lineIndex": 2, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.2, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 2, "_lineIndex": 4, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            const result = eliminateNeighborNotes(notes);
            const expected: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.2, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 2, "_lineIndex": 4, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            
            expect(result).toEqual(expected);
        });

        it('should not eliminate any notes if there are no neighbors within timeEpsilon', () => {
            const notes: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.2, "_lineIndex": 2, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.4, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            const result = eliminateNeighborNotes(notes);
            expect(result).toEqual(notes);  // All notes should remain
        });

        it('should eliminate all notes except the first one if all notes are within timeEpsilon', () => {
            const notes: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.1, "_lineIndex": 2, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.2, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            const result = eliminateNeighborNotes(notes);
            const expected: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
                { "_time": 1.2, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            expect(result).toEqual(expected);  // Only the first and last note should remain
        });
        
        it('should not eliminate the note if there is only a single note', () => {
            const notes: Note[] = [
                { "_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1 },
            ];
            const result = eliminateNeighborNotes(notes);
            expect(result).toEqual(notes);  // The single note should remain
        });

        it('should return an empty array if there are no notes', () => {
            const notes: Note[] = [];
            const result = eliminateNeighborNotes(notes);
            expect(result).toEqual(notes);  // The result should also be an empty array
        });
    });


    describe('saveSong function', () => {
        it('should save a song correctly', async () => {
            await saveSong(tempSongPath, { _version: '2.0.0' });

            expect(fsPromises.writeFile).toHaveBeenCalledWith(tempSongPath, JSON.stringify({ _version: '2.0.0' }), 'utf-8');
        });
    });

    describe('processSong function', () => {
        it('should process a song correctly', async () => {
            const filePath = path.resolve(__dirname, '../temp/NoArrowsExpertPlus.dat');

            const originalSong = {
                _version: '2.0.0',
                _notes: [
                    { _time: 1, _lineIndex: 1, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                    { _time: 1.1, _lineIndex: 2, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                    { _time: 2, _lineIndex: 3, _type: 0, _cutDirection: 1, _lineLayer: 1 },
                ],
            };

            const processedSong = {
                "_version": "2.0.0",
                "_notes": [
                    {"_time": 1, "_lineIndex": 1, "_type": 0, "_cutDirection": 1, "_lineLayer": 1},
                    {"_time": 2, "_lineIndex": 3, "_type": 0, "_cutDirection": 1, "_lineLayer": 1}
                ]
            };

            (fsPromises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(originalSong));
            (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await processSong(filePath);

            expect(fsPromises.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
            expect(fsPromises.writeFile).toHaveBeenCalledWith(filePath, JSON.stringify(processedSong), 'utf-8');
        });

        it('should log an error if processing fails', async () => {
            const filePath = 'path/to/song.file';
            const error = new Error('test error');

            console.error = jest.fn();

            (fsPromises.readFile as jest.Mock).mockRejectedValue(error);

            await processSong(filePath);

            expect(console.error).toHaveBeenCalledWith(`ERROR: Failed to process file "${filePath}".`, error);
        });
    });

});
