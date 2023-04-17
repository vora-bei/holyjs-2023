import rawFilms from '../data/films1.json'
const films = rawFilms as string[];

const search2 = (films: string[], search: string) => {
    return films.filter(film => {
        const words = new Set(
            film
                .toLocaleLowerCase()
                .split(/[\s.,!?]/)
        );
        const terms = search
            .toLocaleLowerCase()
            .split(/[\s.,!?]/)
        return terms.every(term => words.has(term))
    });
}

describe('Леммитизация', () => {
    test("Открытое настеж окно.", () => {
        expect(search2(films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search2(films, "особо")).toHaveLength(4);
    });
    test("Открытый простор", () => {
        expect(search2(films, "открытый")).toHaveLength(1);
    });
    test("открытое окно", () => {
        expect(search2(films, "открытое окно")).toHaveLength(1);
    });
    test("открытые окна", () => {
        expect(search2(films, "открытые окна")).toHaveLength(1);
    });
});

