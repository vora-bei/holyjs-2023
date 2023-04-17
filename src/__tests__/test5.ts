import rawFilms from '../data/films1.json'
import {stemmer} from 'stemmer-ru';

const stemmerRu = new stemmer();

const films = rawFilms as string[];

const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s\.,!?]/)
    .map((word) => stemmerRu.stemWord(word) || word)
    .filter(Boolean) as string[];

const tokenizedFilms = films.map((film) => new Set(tokenizr(film)));

const search5 = (tokenizedFilms: Set<string>[], films: string[], search: string) => {
    const terms = tokenizr(search)
    return films.filter((film, i) => {
        const tFilm = tokenizedFilms[i];
        return terms.every(term => tFilm.has(term))
    });
}


describe('Stemmer', () => {
    test("Открытое настеж окно.", () => {
        expect(search5(tokenizedFilms, films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search5(tokenizedFilms, films, "особо")).toHaveLength(4);
    });
    test("открытое окно", () => {
        expect(search5(tokenizedFilms, films, "открытое окно")).toHaveLength(1);
    });
    test("открытый", () => {
        expect(search5(tokenizedFilms, films, "открытый"))
            .toStrictEqual(["Открытое настеж окно.", "Открытый простор"]);
    });
    test("звенящее деревца", () => {
        expect(search5(tokenizedFilms, films, "звенящее деревце")).toHaveLength(1);
    });
    test("открытые", () => {
        expect(search5(tokenizedFilms, films, "открытые"))
            .toStrictEqual(["Открытое настеж окно.", "Открытый простор"]);
    });
    test("открытые окна", () => {
        expect(tokenizr("открытые окна")).toStrictEqual(tokenizr("Открытое окно"))
        expect(search5(tokenizedFilms, films, "открытые окна")).toHaveLength(1);
    });
});

