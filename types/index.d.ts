import { LoaderType } from "./type";
export declare const Backstage: (type: LoaderType, files: string[]) => {
    on: ({ type, emitter }: import("./type").EventEmitKey<import("./type").ParallelLoaderEmitProgressType, Error, import("./type").ParallelLoaderEmitCompleteType, null, import("./type").ParallelLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: import("./type").EventEmitKey<import("./type").ParallelLoaderEmitProgressType, Error, import("./type").ParallelLoaderEmitCompleteType, null, import("./type").ParallelLoaderEmitFileCompleteType>) => void;
    offAll: (key: import("./type").EventEmitType) => void;
    start: () => void;
} | {
    on: ({ type, emitter }: import("./type").EventEmitKey<import("./type").SerialLoaderEmitProgressType, Error, import("./type").SerialLoaderEmitCompleteType, import("./type").SerialLoaderEmitFileProgressType, import("./type").SerialLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: import("./type").EventEmitKey<import("./type").SerialLoaderEmitProgressType, Error, import("./type").SerialLoaderEmitCompleteType, import("./type").SerialLoaderEmitFileProgressType, import("./type").SerialLoaderEmitFileCompleteType>) => void;
    offAll: (key: import("./type").EventEmitType) => void;
    start: () => void;
};
//# sourceMappingURL=index.d.ts.map