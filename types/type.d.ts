import { EventmitHandler } from "eventmit";
export type EventEmitType = "progress" | "error" | "complete";
export type EventEmitKey<K> = K extends "progress" ? {
    total: number;
    current: number;
    ready: boolean;
    per: number;
} : K extends "error" ? Error : K extends "complete" ? {} : unknown;
export type Event = ProgressEvent | ErrorEvent | CompreteEvent;
export type ProgressEvent = {
    key: "progress";
    handler: EventmitHandler<EventEmitKey<"progress">>;
};
export type ErrorEvent = {
    key: "error";
    handler: EventmitHandler<EventEmitKey<"error">>;
};
export type CompreteEvent = {
    key: "complete";
    handler: EventmitHandler<EventEmitKey<"complete">>;
};
export type Emit = ProgressEmit | ErrorEmit | CompleteEmit;
export type ProgressEmit = {
    key: "progress";
    value: EventEmitKey<"progress">;
};
export type ErrorEmit = {
    key: "error";
    value: EventEmitKey<"error">;
};
export type CompleteEmit = {
    key: "complete";
    value: EventEmitKey<"complete">;
};
//# sourceMappingURL=type.d.ts.map