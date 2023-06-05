import { EventEmitType, Event, Emit } from "./type";
export declare const prepareEvent: () => {
    on: (event: Event) => void;
    off: (event: Event) => void;
    offAll: (key: EventEmitType) => void;
    emit: (emit: Emit) => void;
};
//# sourceMappingURL=Event.d.ts.map