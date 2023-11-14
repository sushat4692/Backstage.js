import { EventmitHandler } from "eventmit";
export type LoaderType = "parallel" | "serial";
export type LoadedFile = {
    file: string;
    size: number;
};
export type EventEmitType = "progress" | "error" | "complete" | "file_progress" | "file_complete";
export type EventEmitKey<P = null, E = null, C = null, FP = null, FC = null> = {
    type: "progress";
    emitter: EventmitHandler<P>;
} | {
    type: "error";
    emitter: EventmitHandler<E>;
} | {
    type: "complete";
    emitter: EventmitHandler<C>;
} | {
    type: "file_progress";
    emitter: EventmitHandler<FP>;
} | {
    type: "file_complete";
    emitter: EventmitHandler<FC>;
};
export type FileLoaderEmitProgressType = {
    total: number;
    current: number;
    per: number;
};
export type FileLoaderEmitErrorType = Error;
export type FileLoaderEmitCompleteType = {
    total: number;
    file: LoadedFile;
};
export type ParallelLoaderEmitProgressType = {
    total: number;
    current: number;
    per: number;
};
export type ParallelLoaderEmitErrorType = Error;
export type ParallelLoaderEmitCompleteType = {
    total: number;
    files: LoadedFile[];
};
export type ParallelLoaderEmitFileCompleteType = {
    total: number;
    file: LoadedFile;
};
export type SerialLoaderEmitProgressType = {
    total: number;
    current: number;
    per: number;
};
export type SerialLoaderEmitErrorType = Error;
export type SerialLoaderEmitCompleteType = {
    total: number;
    files: LoadedFile[];
};
export type SerialLoaderEmitFileProgressType = {
    file: string;
    total: number;
    current: number;
    per: number;
};
export type SerialLoaderEmitFileCompleteType = {
    total: number;
    file: LoadedFile;
};
//# sourceMappingURL=type.d.ts.map