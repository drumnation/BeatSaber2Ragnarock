export interface Note {
    _time: number;
    _lineIndex: number;
    _type: number;
    _cutDirection: number;
    _lineLayer: number;
}

export interface Info {
    _version: string;
    _songName: string;
    _songSubName: string;
    _songAuthorName: string;
    _levelAuthorName: string;
    _beatsPerMinute: number;
    _songTimeOffset: number;
    _shuffle: number;
    _shufflePeriod: number;
    _previewStartTime: number;
    _previewDuration: number;
    _songFilename: string;
    _coverImageFilename: string;
    _environmentName: string;
    _allDirectionsEnvironmentName: string;
    _difficultyBeatmapSets: DifficultyBeatmapSet[];
    _customData: CustomData;
}

export interface DifficultyBeatmapSet {
    _beatmapCharacteristicName: string;
    _difficultyBeatmaps: DifficultyBeatmap[];
}

export interface DifficultyBeatmap {
    _difficulty: string;
    _difficultyRank: number;
    _beatmapFilename: string;
    _noteJumpMovementSpeed: number;
    _noteJumpStartBeatOffset: number;
}

export interface CustomData {
    _editors: Editors;
}

export interface Editors {
    _lastEditedBy: string;
    [key: string]: Editor | string;
}

export interface Editor {
    version: string;
    id: string;
    events: any[];
}
