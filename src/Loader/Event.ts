import { eventmit } from "eventmit";
import { EventEmitType, EventEmitKey } from "../type";

export const useLoaderEmitter = <
    P = null,
    E = null,
    C = null,
    FP = null,
    FC = null
>() => {
    const progress = eventmit<P>();
    const error = eventmit<E>();
    const complete = eventmit<C>();
    const fileProgress = eventmit<FP>();
    const fileComplete = eventmit<FC>();

    const on = ({ type, emitter }: EventEmitKey<P, E, C, FP, FC>) => {
        switch (type) {
            case "progress":
                progress.on(emitter);
                break;
            case "error":
                error.on(emitter);
                break;
            case "complete":
                complete.on(emitter);
                break;
            case "file_progress":
                fileProgress.on(emitter);
                break;
            case "file_complete":
                fileComplete.on(emitter);
                break;
        }
    };

    const off = ({ type, emitter }: EventEmitKey<P, E, C, FP, FC>) => {
        switch (type) {
            case "progress":
                progress.off(emitter);
                break;
            case "error":
                error.off(emitter);
                break;
            case "complete":
                complete.off(emitter);
                break;
            case "file_progress":
                fileProgress.off(emitter);
                break;
            case "file_complete":
                fileComplete.off(emitter);
                break;
        }
    };

    const offAll = (key: EventEmitType) => {
        switch (key) {
            case "progress":
                progress.offAll();
                break;
            case "error":
                error.offAll();
                break;
            case "complete":
                complete.offAll();
                break;
            case "file_progress":
                fileProgress.offAll();
                break;
            case "file_complete":
                fileComplete.offAll();
                break;
        }
    };

    return {
        progress,
        error,
        complete,
        fileProgress,
        fileComplete,
        on,
        off,
        offAll,
    };
};
