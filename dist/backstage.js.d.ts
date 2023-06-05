import { EventmitHandler } from 'eventmit';

export declare const Backstage: (files: string[]) => {
    on: (event: Event_2) => void;
    off: (event: Event_2) => void;
    offAll: (key: EventEmitType) => void;
    start: () => void;
};

declare type CompreteEvent = {
    key: "complete";
    handler: EventmitHandler<EventEmitKey<"complete">>;
};

declare type ErrorEvent_2 = {
    key: "error";
    handler: EventmitHandler<EventEmitKey<"error">>;
};

declare type Event_2 = ProgressEvent_2 | ErrorEvent_2 | CompreteEvent;

declare type EventEmitKey<K> = K extends "progress" ? {
    total: number;
    current: number;
    ready: boolean;
    per: number;
} : K extends "error" ? Error : K extends "complete" ? {} : unknown;

declare type EventEmitType = "progress" | "error" | "complete";

declare type ProgressEvent_2 = {
    key: "progress";
    handler: EventmitHandler<EventEmitKey<"progress">>;
};

export { }
