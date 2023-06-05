import { eventmit } from "eventmit";
import { EventEmitKey, EventEmitType, Event, Emit } from "./type";

export const prepareEvent = () => {
    const progress = eventmit<EventEmitKey<"progress">>();
    const error = eventmit<EventEmitKey<"error">>();
    const complete = eventmit<EventEmitKey<"complete">>();

    const on = (event: Event) => {
        switch (event.key) {
            case "progress":
                progress.on(event.handler);
                break;
            case "error":
                error.on(event.handler);
                break;
            case "complete":
                complete.on(event.handler);
                break;
        }
    };

    const off = (event: Event) => {
        switch (event.key) {
            case "progress":
                progress.off(event.handler);
                break;
            case "error":
                error.off(event.handler);
                break;
            case "complete":
                complete.off(event.handler);
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
        }
    };

    const emit = (emit: Emit) => {
        switch (emit.key) {
            case "progress":
                return progress.emit(emit.value);
            case "error":
                return error.emit(emit.value);
            case "complete":
                return complete.emit(emit.value);
        }
    };

    return {
        on,
        off,
        offAll,
        emit,
    };
};
