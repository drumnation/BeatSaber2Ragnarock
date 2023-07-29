import { DifficultyBeatmapSet, Info } from 'types';
import { addEditorInfo, loadInfoFile, processAllSongs, saveInfoFile } from './processInfo';

import { setupBeforeEach, teardownAfterEach, tempDir, tempInfoPath } from '../config/setupTests';
import * as songProcessor from './processSong';
import { join } from 'path';

beforeEach(async () => {
    await setupBeforeEach();
});

afterEach(async () => {
    await teardownAfterEach();
});

describe('loadInfoFile function', () => {
    it('should load the info file correctly', async () => {
        const info = await loadInfoFile(tempInfoPath);

        expect(info).toBeDefined();
        expect(typeof info).toBe('object');
        expect(info._version).toBe('2.0.0');
        expect(info._songName).toBe('Ka$cade');
        expect(info._difficultyBeatmapSets).toBeInstanceOf(Array);
    });
});

describe('processAllSongs function', () => {
    it('should process all songs correctly', async () => {
        const processSongMock = jest.spyOn(songProcessor, 'processSong');

        const info = await loadInfoFile(tempInfoPath);
        await processAllSongs(info, tempDir);

        // Check that `processSong` was called the correct number of times
        const totalSongs = info._difficultyBeatmapSets.reduce((sum: number, set: DifficultyBeatmapSet) => sum + set._difficultyBeatmaps.length, 0);
        expect(processSongMock).toHaveBeenCalledTimes(totalSongs);

        // Check that `processSong` was called with the correct arguments
        info._difficultyBeatmapSets.forEach((set: DifficultyBeatmapSet)  => {
            set._difficultyBeatmaps.forEach(beatmap => {
                const filePath = join(tempDir, beatmap._beatmapFilename);
                expect(processSongMock).toHaveBeenCalledWith(filePath);
            });
        });

        // Restore the original function
        processSongMock.mockRestore();
    });
});

describe('addEditorInfo function', () => {
    it('should add editor info correctly', () => {
        let info: Info = {
            _customData: { _editors: { _lastEditedBy: '' } },
            _version: '',
            _songName: '',
            _songSubName: '',
            _songAuthorName: '',
            _levelAuthorName: '',
            _beatsPerMinute: 0,
            _songTimeOffset: 0,
            _shuffle: 0,
            _shufflePeriod: 0,
            _previewStartTime: 0,
            _previewDuration: 0,
            _songFilename: '',
            _coverImageFilename: '',
            _environmentName: '',
            _allDirectionsEnvironmentName: '',
            _difficultyBeatmapSets: []
        };

        info = addEditorInfo(info);

        if (typeof info._customData._editors.BeatSaber2Ragnarock !== 'string') {
            expect(info._customData._editors.BeatSaber2Ragnarock.version).toBe('0.2.0');
        }
        expect(info._customData._editors._lastEditedBy).toBe('BeatSaber2Ragnarock');
    });
});

describe('saveInfoFile function', () => {
    it('should save the info file correctly', async () => {
        let info = await loadInfoFile(tempInfoPath);
        info = addEditorInfo(info);
        await saveInfoFile(tempInfoPath, info);

        // Load the saved info file and assert that it matches the original info
        const savedInfo = await loadInfoFile(tempInfoPath);

        expect(savedInfo).toEqual(info);
        expect(savedInfo._customData._editors.BeatSaber2Ragnarock.version).toBe(info._customData._editors.BeatSaber2Ragnarock.version);
        expect(savedInfo._customData._editors._lastEditedBy).toBe(info._customData._editors._lastEditedBy);
    });
});
