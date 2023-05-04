import {stemmer} from 'stemmer-ru';
const stemmerRu = new stemmer();

const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s\.,!?]/)
    .map((word) => stemmerRu.stemWord(word) || word)
    .filter(Boolean) as string[];

export const createIndex: (films: string[]) => Set<string>[] = (films: string[]) =>
    films.map(film=> new Set<string>(tokenizr(film)));

export const search = (index: Set<string>[], films: string[], search: string) => {
    if(!search || !search.length){
        return [];
    }
    const terms = tokenizr(search)
    return films.filter((film, i) => {
        return terms.every(term => index[i].has(term))
    });
}
