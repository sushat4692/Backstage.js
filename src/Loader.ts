import { LoaderType } from "./type";
import { ParallelLoader } from "./Loader/ParallelLoader";
import { SerialLoader } from "./Loader/SerialLoader";

export const Loader = (type: LoaderType, files: string[]) => {
    switch (type) {
        case "parallel":
            return ParallelLoader(files);
        case "serial":
            return SerialLoader(files);
        default:
            const _exhaustiveCheck: never = type;
            return _exhaustiveCheck;
    }
};
