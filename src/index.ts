import { Loader } from "./Loader";
import { LoaderType } from "./type";

export const Backstage = (type: LoaderType, files: string[]) => {
    const loader = Loader(type, files);
    return loader;
};
