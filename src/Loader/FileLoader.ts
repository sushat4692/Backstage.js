import {
    FileLoaderEmitCompleteType,
    FileLoaderEmitErrorType,
    FileLoaderEmitProgressType,
} from "../type";
import { useLoaderEmitter } from "./Event";

export const FileLoader = (file: string) => {
    let total = 0;
    let current = 0;
    let ready = false;
    let xhr = null as XMLHttpRequest | null;

    // Event Emitter
    const { progress, error, complete, on, off, offAll } = useLoaderEmitter<
        FileLoaderEmitProgressType,
        FileLoaderEmitErrorType,
        FileLoaderEmitCompleteType
    >();

    const start = () => {
        xhr = new XMLHttpRequest();
        xhr.open("get", file, true);
        xhr.responseType = "blob";

        xhr.onloadstart = (e) => {
            ready = true;
            current = e.loaded;

            if (e.lengthComputable) {
                total = e.total;
            }
            progress.emit({ total, current, per: current / total });
        };

        xhr.onprogress = (e) => {
            current = e.loaded;

            if (e.lengthComputable) {
                total = e.total;
            }

            progress.emit({ total, current, per: current / total });
        };

        xhr.onload = (e) => {
            complete.emit({ total, file: { file, size: total } });
            abort();
        };

        xhr.onerror = (e) => {
            error.emit(new Error(`Failed to load ${file}`));
            abort();
        };

        xhr.send();
    };

    const abort = () => {
        if (!xhr) {
            return;
        }

        xhr.abort();
        xhr = null;
    };

    return {
        on,
        off,
        offAll,
        start,
        abort,
    };
};
export type FileLoaderType = ReturnType<typeof FileLoader>;
