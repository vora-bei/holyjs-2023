import rawFilms from '../data/films1.json'
import {stemmer} from 'stemmer-ru';
const stemmerRu = new stemmer();

const films = rawFilms as string[];

const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s\.,!?]/)
    .map((word) => stemmerRu.stemWord(word));

const search4 = (films: string[], search: string) => {
    const terms = tokenizr(search)
    return films.filter(film => {
        const words = new Set(tokenizr(film));
        return terms.every(term => words.has(term))
    });
}

describe('Stemmer', () => {
    test("Открытое настеж окно.", () => {
        expect(search4(films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search4(films, "особо")).toHaveLength(4);
    });
    test("открытое окно", () => {
        expect(search4(films, "открытое окно")).toHaveLength(1);
    });
    test("открытый", () => {
        expect(search4(films, "открытый"))
            .toStrictEqual(["Открытое настеж окно.", "Открытый простор"]);
    });
    test("звенящее деревца", () => {
        expect(search4(films, "звенящее деревце")).toHaveLength(1);
    });
    test("открытые", () => {
        expect(search4(films, "открытые"))
            .toStrictEqual(  ["Открытое настеж окно.", "Открытый простор"]);
    });
    test("открытые окна", () => {
        expect(tokenizr("открытые окна")).toStrictEqual(tokenizr("Открытое окно"))
        expect(search4(films, "открытые окна")).toHaveLength(1);
    });
});

