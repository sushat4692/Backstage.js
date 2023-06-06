import { EventmitHandler } from "eventmit";
import { EventEmitKey, EventEmitType } from "./type";
export declare const prepareEvent: () => {
    on: <K extends EventEmitType>(key: K, emitter: EventmitHandler<EventEmitKey<K>>) => void;
    off: <K_1 extends EventEmitType>(key: K_1, emitter: EventmitHandler<EventEmitKey<K_1>>) => void;
    offAll: (key: EventEmitType) => void;
    emit: <K_2 extends EventEmitType>(key: K_2, value: EventEmitKey<K_2>) => void;
};
//# sourceMappingURL=Event.d.ts.map