import { SerialLoaderEmitCompleteType, SerialLoaderEmitFileCompleteType, SerialLoaderEmitFileProgressType, SerialLoaderEmitProgressType } from "../type";
export declare const SerialLoader: (files: string[]) => {
    on: ({ type, emitter }: import("../type").EventEmitKey<SerialLoaderEmitProgressType, Error, SerialLoaderEmitCompleteType, SerialLoaderEmitFileProgressType, SerialLoaderEmitFileCompleteType>) => void;
    off: ({ type, emitter }: import("../type").EventEmitKey<SerialLoaderEmitProgressType, Error, SerialLoaderEmitCompleteType, SerialLoaderEmitFileProgressType, SerialLoaderEmitFileCompleteType>) => void;
    offAll: (key: import("../type").EventEmitType) => void;
    start: () => void;
};
//# sourceMappingURL=SerialLoader.d.ts.map