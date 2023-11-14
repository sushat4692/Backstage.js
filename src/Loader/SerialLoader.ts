import {
    LoadedFile,
    SerialLoaderEmitCompleteType,
    SerialLoaderEmitErrorType,
    SerialLoaderEmitFileCompleteType,
    SerialLoaderEmitFileProgressType,
    SerialLoaderEmitProgressType,
} from "../type";
import { FileLoader, FileLoaderType } from "./FileLoader";
import { useLoaderEmitter } from "./Event";

export const SerialLoader = (files: string[]) => {
    const fileLength = files.length;
    let loadedFileLength = 0;
    let currentIndex = 0;

    // Event Emitter
    const {
        progress,
        error,
        complete,
        fileProgress,
        fileComplete,
        on,
        off,
        offAll,
    } = useLoaderEmitter<
        SerialLoaderEmitProgressType,
        SerialLoaderEmitErrorType,
        SerialLoaderEmitCompleteType,
        SerialLoaderEmitFileProgressType,
        SerialLoaderEmitFileCompleteType
    >();

    const loaders: FileLoaderType[] = [];
    const fileResults: LoadedFile[] = [];

    files.forEach((file) => {
        const loader = FileLoader(file);

        loader.on({
            type: "progress",
            emitter: (e) => {
                fileProgress.emit({
                    ...e,
                    file,
                });

                progress.emit({
                    total: fileLength,
                    current: loadedFileLength,
                    per: loadedFileLength / fileLength,
                });
            },
        });

        loader.on({
            type: "complete",
            emitter: (e) => {
                loadedFileLength += 1;
                fileResults.push(e.file);

                fileComplete.emit({
                    total: fileLength,
                    file: e.file,
                });

                if (loadedFileLength >= fileLength) {
                    complete.emit({
                        total: fileLength,
                        files: fileResults,
                    });
                } else {
                    currentIndex += 1;
                    loaders[currentIndex].start();
                }
            },
        });

        loader.on({
            type: "error",
            emitter: (e) => error.emit(e),
        });

        loaders.push(loader);
    });

    return {
        on,
        off,
        offAll,
        start: () => {
            loaders[currentIndex].start();
        },
    };
};
