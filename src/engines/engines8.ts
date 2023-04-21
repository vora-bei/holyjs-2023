import {distance} from "fastest-levenshtein";

export const search = (films: string[], search: string) => {
    const tokenizr = (v: string) => v
        .toLocaleLowerCase()
        .split(/[,\. ]/);

    const dist = (v: string, s: string) => Math.min(...tokenizr(v).map(w => distance(tokenizr(s)[0], w)));

    if (search === '') {
        return films;
    }
    return films
        .filter((v, index) => dist(v, search) <= Math.max(search.length - 5, 0));
};
