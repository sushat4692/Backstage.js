export declare const Backstage: (files: string[]) => {
    on: <K extends import("./type").EventEmitType>(key: K, emitter: import("eventmit").EventmitHandler<import("./type").EventEmitKey<K>>) => void;
    off: <K_1 extends import("./type").EventEmitType>(key: K_1, emitter: import("eventmit").EventmitHandler<import("./type").EventEmitKey<K_1>>) => void;
    offAll: (key: import("./type").EventEmitType) => void;
    start: () => void;
};
//# sourceMappingURL=index.d.ts.map