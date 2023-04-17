import rawFilms from '../data/films1.json'
const films = rawFilms as string[];

const search1 = (films: string[], search: string) => {
    return films.filter(film =>
        film.toLocaleLowerCase()
            .includes(
                search.toLocaleLowerCase()
            )
    );
}

describe('Lowercase', () => {
    test("Открытое настеж окно.", () => {
        expect(search1(films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search1(films, "особо")).toHaveLength(4);
    });
    test("Открытый простор", () => {
        expect(search1(films, "открытый")).toHaveLength(1);
    });
    test("открытое окно", () => {
        expect(search1(films, "открытое окно")).toHaveLength(1);
    });
});





