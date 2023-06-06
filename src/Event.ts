import { eventmit, EventmitHandler } from "eventmit";
import { EventEmitKey, EventEmitType } from "./type";

export const prepareEvent = () => {
    const progress = eventmit<EventEmitKey<"progress">>();
    const error = eventmit<EventEmitKey<"error">>();
    const file_complete = eventmit<EventEmitKey<"file_complete">>();
    const complete = eventmit<EventEmitKey<"complete">>();

    const on = <K extends EventEmitType>(
        key: K,
        emitter: EventmitHandler<EventEmitKey<K>>
    ) => {
        switch (key) {
            case "progress":
                progress.on(
                    emitter as EventmitHandler<EventEmitKey<"progress">>
                );
                break;
            case "error":
                error.on(emitter as EventmitHandler<EventEmitKey<"error">>);
                break;
            case "file_complete":
                file_complete.on(
                    emitter as EventmitHandler<EventEmitKey<"file_complete">>
                );
                break;
            case "complete":
                complete.on(
                    emitter as EventmitHandler<EventEmitKey<"complete">>
                );
                break;
        }
    };

    const off = <K extends EventEmitType>(
        key: K,
        emitter: EventmitHandler<EventEmitKey<K>>
    ) => {
        switch (key) {
            case "progress":
                progress.off(
                    emitter as EventmitHandler<EventEmitKey<"progress">>
                );
                break;
            case "error":
                error.off(emitter as EventmitHandler<EventEmitKey<"error">>);
                break;
            case "file_complete":
                file_complete.off(
                    emitter as EventmitHandler<EventEmitKey<"file_complete">>
                );
                break;
            case "complete":
                complete.off(
                    emitter as EventmitHandler<EventEmitKey<"complete">>
                );
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
            case "file_complete":
                file_complete.offAll();
                break;
            case "complete":
                complete.offAll();
                break;
        }
    };

    const emit = <K extends EventEmitType>(key: K, value: EventEmitKey<K>) => {
        switch (key) {
            case "progress":
                return progress.emit(value as EventEmitKey<"progress">);
            case "error":
                return error.emit(value as EventEmitKey<"error">);
            case "file_complete":
                return file_complete.emit(
                    value as EventEmitKey<"file_complete">
                );
            case "complete":
                return complete.emit(value as EventEmitKey<"complete">);
        }
    };

    return {
        on,
        off,
        offAll,
        emit,
    };
};
