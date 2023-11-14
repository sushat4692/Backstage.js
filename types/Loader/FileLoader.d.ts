import { FileLoaderEmitCompleteType, FileLoaderEmitProgressType } from "../type";
export declare const FileLoader: (file: string) => {
    on: ({ type, emitter }: import("../type").EventEmitKey<FileLoaderEmitProgressType, Error, FileLoaderEmitCompleteType, null, null>) => void;
    off: ({ type, emitter }: import("../type").EventEmitKey<FileLoaderEmitProgressType, Error, FileLoaderEmitCompleteType, null, null>) => void;
    offAll: (key: import("../type").EventEmitType) => void;
    start: () => void;
    abort: () => void;
};
export type FileLoaderType = ReturnType<typeof FileLoader>;
//# sourceMappingURL=FileLoader.d.ts.map