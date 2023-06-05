import { Emit } from "./type";

const SingleLoader = (
    file: string,
    emit: () => void,
    complete: () => void,
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
                emit();
            };

            xhr.onload = (e) => {
                complete();
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

export const Loader = (files: string[], emit: (emit: Emit) => void) => {
    let fileLength = files.length;
    const loaders: SingleLoaderType[] = [];

    files.forEach((file) => {
        const loader = SingleLoader(
            file,
            () => {
                const result = loaders.reduce(
                    (acc, cur) => {
                        acc.total += cur.total();
                        acc.current += cur.current();
                        acc.ready = acc.ready && cur.ready();
                        return acc;
                    },
                    { total: 0, current: 0, per: 0, ready: true }
                );

                if (result.ready) {
                    result.per = result.current / result.total;
                    emit({ key: "progress", value: result });
                }
            },
            () => {
                fileLength -= 1;
                if (fileLength <= 0) {
                    emit({ key: "complete", value: {} });
                }
            },
            () => {
                emit({ key: "error", value: new Error("error") });
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
