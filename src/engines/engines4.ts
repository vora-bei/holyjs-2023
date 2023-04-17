import {stemmer} from 'stemmer-ru';
const stemmerRu = new stemmer();

const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s\.,!?]/)
    .map((word) => stemmerRu.stemWord(word) || word);

export const search = (films: string[], search: string) => {
    const terms = tokenizr(search)
    return films.filter(film => {
        const words = new Set(tokenizr(film));
        return terms.every(term => words.has(term))
    });
}
