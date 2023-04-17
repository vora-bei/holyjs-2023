import rawFilms from '../data/films1.json'
const films = rawFilms as string[];

export const search0 = (films: string[], search: string) => {
    return films.filter(film => film.includes(search));
}

describe('Наивная реализация', () => {
    test("Открытое настеж окно.", () => {
        expect(search0(films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search0(films, "особо")).toHaveLength(4);
    });
});








