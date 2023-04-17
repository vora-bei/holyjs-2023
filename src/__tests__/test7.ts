import rawFilms from '../data/films1.json'
import {stemmer} from 'stemmer-ru';

const stemmerRu = new stemmer();

const films = rawFilms as string[];

const getWeights = (terms: string[]): { index: number, weight: number }[] => {
    const preSearch: Set<number>[] = terms
        .map(term => index.get(term))
        .filter(Boolean) as Set<number>[];
    const weights = preSearch.reduce((sum, v, k) => {
        v.forEach(num => {
            const count = sum.get(num) || 0;
            sum.set(num, count + 1)
        })
        return sum;
    }, new Map<number, number>());
    const entries = [...weights.entries()]
    entries.sort((a, b) => b[1] - a[1]);
    return entries
        .map((row) => {
            return {index: row[0], weight: row[1]};
        })
}

const gramm3 = (word: string) => {
    const words = [...word].map((w: string, i: number, array: string[]) => {
        if (i - 2 >= 0) {
            return array[i - 2] + array[i - 1] + w
        } else {
            return null;
        }
    }).filter(Boolean) as string[];
    return words;
}
const tokenizr = (film: string) => {
    return film
        .toLocaleLowerCase()
        .split(/[\s\.,!?]/)
        .map((word) => stemmerRu.stemWord(word) || word)
        .filter(Boolean)
        .flatMap((word => gramm3(word as string)));
}

const index: Map<string, Set<number>> = films.reduce((sum, film, row) => {
    tokenizr(film)
        .forEach(term => {
            if (!sum.has(term)) {
                sum.set(term, new Set());
            }
            sum.get(term)!.add(row);
        })
    return sum;
}, new Map<string, Set<number>>());


const search7 = (index: Map<string, Set<number>>, films: string[], search: string) => {
    const terms = tokenizr(search);
    const weights = getWeights(terms);
    return weights
        .filter(term => term.weight > 0.5 * terms.length)
        .map((row) => {
            return films[row.index];
        });
}

describe('Stemmer', () => {
    test("Открытое настеж окно.", () => {
        expect(search7(index, films, "окно"))
            .toStrictEqual(["Открытое настеж окно."]);
    });
    test("Особо важное задание", () => {
        expect(search7(index, films, "особо")).toHaveLength(4);
    });
    test("открытое окно", () => {
        expect(search7(index, films, "открытое окно")).toHaveLength(2);
    });
    test("открытый", () => {
        expect(search7(index, films, "открытый"))
            .toStrictEqual(["Открытое настеж окно.", "Открытый простор"]);
    });
    test("звенящее деревца", () => {
        expect(search7(index, films, "звенящее деревце")).toHaveLength(1);
    });
    test("открытые", () => {
        expect(search7(index, films, "открытые"))
            .toStrictEqual(["Открытое настеж окно.", "Открытый простор"]);
    });
});



const printIndex = [...index.entries()].reduce((sum, v) =>{
    sum[v[0]] = [...v[1]]
    return sum;
} ,{} as  {[key: string]: number[]})
console.log(printIndex);
