
import { promises as fs } from 'fs';
import { Note } from "types";

import { timeEpsilon } from '../BeatSaber2Ragnarock.logic';

export async function loadSong(filePath: string): Promise<any> {
    console.log(`loadSong called with filePath: ${filePath}`);
    const songData: string = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(songData);
}

export function eliminateStackedNotes(notes: Note[]): Note[] {
    console.log(`eliminateStackedNotes called with ${notes.length} notes`);
    let nodesToDelete: Note[] = [];
    notes.forEach((note, index) => {
        let nextNotes = notes.slice(index + 1, index + 4);
        if (nextNotes.filter(neighborNote => Math.abs(note._time - neighborNote._time) < timeEpsilon && neighborNote._lineIndex === note._lineIndex).length > 0) {
            nodesToDelete.push(note);
        }
    });
    return notes.filter(note => !nodesToDelete.includes(note));
}

export function squashNotes(notes: Note[]): Note[] {
    console.log(`squashNotes called with ${notes.length} notes`);
    return notes.map(note => ({ ...note, _type: 0, _cutDirection: 1, _lineLayer: 1 }));
}

export function eliminateNeighborNotes(notes: Note[]): Note[] {
    console.log(`eliminateNoteNeighbors called with ${notes.length} notes`);
    let nodesToDelete: Note[] = [];
    notes.forEach((note, index) => {
        let neighbors = notes.filter((neighborNote, neighborIndex) => 
            neighborIndex !== index && Math.abs(note._time - neighborNote._time) < timeEpsilon);
        if (neighbors.length > 1) {
            nodesToDelete.push(note);
        }
    });
    return notes.filter(note => !nodesToDelete.includes(note));
}

export async function saveSong(filePath: string, song: any) {
    console.log(`saveSong called with filePath: ${filePath}`);
    const updatedSongData: string = JSON.stringify(song);
    await fs.writeFile(filePath, updatedSongData, 'utf-8');
    console.log(`${filePath} converted to Ragnaröck!`);
}

export async function processSong(filePath: string) {
    try {
        console.log(`processSong called with filePath: ${filePath}`);
        const song = await loadSong(filePath);
        let notes: Note[] = song._notes;

        console.log(`Initial note count: ${notes.length}`);
        notes = eliminateStackedNotes(notes);
        console.log(`Note count after eliminateStackedNotes: ${notes.length}`);
        notes = squashNotes(notes);
        notes = eliminateNeighborNotes(notes);
        console.log(`Note count after eliminateNeighborNotes: ${notes.length}`);

        song._notes = notes;
        console.log(`Saving song at filePath: ${filePath}`);
        await saveSong(filePath, song);
    } catch (error) {
        console.error(`ERROR: Failed to process file "${filePath}".`, error);
    }
}