import { prepareEvent } from "./Event";
import { Loader } from "./Loader";

export const Backstage = (files: string[]) => {
    const { on, off, offAll, emit } = prepareEvent();
    const loader = Loader(files, emit);

    return {
        on,
        off,
        offAll,
        start: loader.start,
    };
};
