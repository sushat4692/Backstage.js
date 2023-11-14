import { EventEmitType, EventEmitKey } from "../type";
export declare const useLoaderEmitter: <P = null, E = null, C = null, FP = null, FC = null>() => {
    progress: import("eventmit").Eventmitter<P>;
    error: import("eventmit").Eventmitter<E>;
    complete: import("eventmit").Eventmitter<C>;
    fileProgress: import("eventmit").Eventmitter<FP>;
    fileComplete: import("eventmit").Eventmitter<FC>;
    on: ({ type, emitter }: EventEmitKey<P, E, C, FP, FC>) => void;
    off: ({ type, emitter }: EventEmitKey<P, E, C, FP, FC>) => void;
    offAll: (key: EventEmitType) => void;
};
//# sourceMappingURL=Event.d.ts.map