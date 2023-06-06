import { EventEmitKey, EventEmitType, LoadedFile } from "./type";

const SingleLoader = (
    file: string,
    progress: () => void,
    complete: (file: string, size: number) => void,
    error: () => void
) => {
    let _total = 0;
    let _current = 0;
    let _ready = false;

    return {
        start: () => {
            const xhr = new XMLHttpRequest();
            xhr.open("get", file, true);
            xhr.responseType = "blob";

            xhr.onprogress = (e) => {
                if (!e.lengthComputable) {
                    return;
                }
                _ready = true;

                _total = e.total;
                _current = e.loaded;
                progress();
            };

            xhr.onload = (e) => {
                complete(file, _total);
            };

            xhr.onerror = (e) => {
                error();
            };

            xhr.send();
        },
        total: () => {
            return _total;
        },
        current: () => {
            return _current;
        },
        ready: () => {
            return _ready;
        },
    };
};
type SingleLoaderType = ReturnType<typeof SingleLoader>;

export const Loader = (
    files: string[],
    emit: <K extends EventEmitType>(key: K, value: EventEmitKey<K>) => void
) => {
    let fileLength = files.length;
    const loaders: SingleLoaderType[] = [];

    let fileResults: LoadedFile[] = files.map((file) => ({ file, size: 0 }));

    files.forEach((file) => {
        const loader = SingleLoader(
            file,
            () => {
                let ready = true;

                const result = loaders.reduce(
                    (acc, cur) => {
                        acc.total += cur.total();
                        acc.current += cur.current();
                        ready = ready && cur.ready();
                        return acc;
                    },
                    { total: 0, current: 0, per: 0 }
                );

                if (ready) {
                    result.per = result.current / result.total;
                    emit("progress", result);
                }
            },
            (file, size) => {
                emit("file_complete", { file, size });

                let total = 0;
                fileResults = fileResults.map((res) => {
                    const _size = file === res.file ? size : res.size;
                    total += _size;

                    return {
                        file: res.file,
                        size: _size,
                    };
                });

                fileLength -= 1;
                if (fileLength <= 0) {
                    emit("complete", { total, files: fileResults });
                }
            },
            () => {
                emit("error", new Error("error"));
            }
        );
        loaders.push(loader);
    });

    return {
        start: () => {
            loaders.forEach((loader) => {
                loader.start();
            });
        },
    };
};
