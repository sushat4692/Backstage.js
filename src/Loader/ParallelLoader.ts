import {
    LoadedFile,
    ParallelLoaderEmitCompleteType,
    ParallelLoaderEmitErrorType,
    ParallelLoaderEmitFileCompleteType,
    ParallelLoaderEmitProgressType,
} from "../type";
import { FileLoader, FileLoaderType } from "./FileLoader";
import { useLoaderEmitter } from "./Event";

export const ParallelLoader = (files: string[]) => {
    const fileLength = files.length;
    let loadedFileLength = 0;

    // Event Emitter
    const { progress, error, complete, fileComplete, on, off, offAll } =
        useLoaderEmitter<
            ParallelLoaderEmitProgressType,
            ParallelLoaderEmitErrorType,
            ParallelLoaderEmitCompleteType,
            null,
            ParallelLoaderEmitFileCompleteType
        >();

    const loaders: FileLoaderType[] = [];
    const fileResults: LoadedFile[] = [];

    files.forEach((file) => {
        const loader = FileLoader(file);

        loader.on({
            type: "progress",
            emitter: (_) => {
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
            loaders.forEach((loader) => loader.start());
        },
    };
};
