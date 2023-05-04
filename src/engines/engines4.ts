import {stemmer} from 'stemmer-ru';
const stemmerRu = new stemmer();

const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s\.,!?:;]/)
    .map((word) => stemmerRu.stemWord(word) || word)
    .filter(Boolean) as string[];

export const search = (films: string[], search: string) => {
    if(!search || !search.length){
        return [];
    }
    const terms = tokenizr(search)
    return films.filter(film => {
        const words = new Set(tokenizr(film));
        return terms.every(term => words.has(term))
    });
}
