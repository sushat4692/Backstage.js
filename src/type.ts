export type LoadedFile = { file: string; size: number };

export type EventEmitType = "progress" | "error" | "file_complete" | "complete";
export type EventEmitKey<K> = K extends "progress"
    ? { total: number; current: number; per: number }
    : K extends "error"
    ? Error
    : K extends "file_complete"
    ? LoadedFile
    : K extends "complete"
    ? { total: number; files: LoadedFile[] }
    : unknown;
