import { EventmitHandler } from 'eventmit';

export declare const Backstage: (type: LoaderType, files: string[]) => {
    on: ({ type, emitter }: EventEmitKey<ParallelLoaderEmitProgressType, Error, ParallelLoaderEmitCompleteType, null, ParallelLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: EventEmitKey<ParallelLoaderEmitProgressType, Error, ParallelLoaderEmitCompleteType, null, ParallelLoaderEmitFileCompleteType>) => void;
    offAll: (key: EventEmitType) => void;
    start: () => void;
} | {
    on: ({ type, emitter }: EventEmitKey<SerialLoaderEmitProgressType, Error, SerialLoaderEmitCompleteType, SerialLoaderEmitFileProgressType, SerialLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: EventEmitKey<SerialLoaderEmitProgressType, Error, SerialLoaderEmitCompleteType, SerialLoaderEmitFileProgressType, SerialLoaderEmitFileCompleteType>) => void;
    offAll: (key: EventEmitType) => void;
    start: () => void;
};

declare type EventEmitKey<P = null, E = null, C = null, FP = null, FC = null> = {
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

declare type EventEmitType = "progress" | "error" | "complete" | "file_progress" | "file_complete";

declare type LoadedFile = {
    file: string;
    size: number;
};

declare type LoaderType = "parallel" | "serial";

declare type ParallelLoaderEmitCompleteType = {
    total: number;
    files: LoadedFile[];
};

declare type ParallelLoaderEmitFileCompleteType = {
    total: number;
    file: LoadedFile;
};

declare type ParallelLoaderEmitProgressType = {
    total: number;
    current: number;
    per: number;
};

declare type SerialLoaderEmitCompleteType = {
    total: number;
    files: LoadedFile[];
};

declare type SerialLoaderEmitFileCompleteType = {
    total: number;
    file: LoadedFile;
};

declare type SerialLoaderEmitFileProgressType = {
    file: string;
    total: number;
    current: number;
    per: number;
};

declare type SerialLoaderEmitProgressType = {
    total: number;
    current: number;
    per: number;
};

export { }
