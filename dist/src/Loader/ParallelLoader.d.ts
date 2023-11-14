import { ParallelLoaderEmitCompleteType, ParallelLoaderEmitFileCompleteType, ParallelLoaderEmitProgressType } from "../type";
export declare const ParallelLoader: (files: string[]) => {
    on: ({ type, emitter }: import("../type").EventEmitKey<ParallelLoaderEmitProgressType, Error, ParallelLoaderEmitCompleteType, null, ParallelLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: import("../type").EventEmitKey<ParallelLoaderEmitProgressType, Error, ParallelLoaderEmitCompleteType, null, ParallelLoaderEmitFileCompleteType>) => void;
    offAll: (key: import("../type").EventEmitType) => void;
    start: () => void;
};
//# sourceMappingURL=ParallelLoader.d.ts.map