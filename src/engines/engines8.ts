import {distance} from "fastest-levenshtein";
import {stemmer} from 'stemmer-ru';
const stemmerRu = new stemmer();

export const search = (films: string[], search: string) => {
    const tokenizr = (v: string) => v
        .toLocaleLowerCase()
        .split(/[,\.: ]/)
        .map((word) => stemmerRu.stemWord(word) || word);

    const dist = (v: string, s: string) => Math.min(...tokenizr(v).map(w => distance(tokenizr(s)[0], w)));

    if (search === '') {
        return [];
    }
    return films
        .filter((v, index) => dist(v, search) <= Math.min(Math.max(search.length - 5, 0), 2));
};
