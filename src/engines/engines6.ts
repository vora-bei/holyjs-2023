import {stemmer} from 'stemmer-ru';

const stemmerRu = new stemmer();

const tokenizr = (film: string) => {
    return film
        .toLocaleLowerCase()
        .split(/[\s\.,!?]/)
        .map((word) => stemmerRu.stemWord(word) || word)
        .filter(Boolean) as string[];
}
export const createIndex: (films: string[]) => Map<string, Set<number>> = (films: string[]) => films
    .reduce((sum, film, row) => {
        tokenizr(film)
            .forEach(term => {
                if (!sum.has(term)) {
                    sum.set(term, new Set());
                }
                sum.get(term)!.add(row);
            })
        return sum;
    }, new Map<string, Set<number>>());
const getWeights = (terms: string[], index: Map<string, Set<number>>): { index: number, weight: number }[] => {
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
        .filter((w) => w.weight === terms.length)
}

export const search = (index: Map<string, Set<number>>, films: string[], search: string) => {
    if (!search || !search.length) {
        return [];
    }
    const terms = tokenizr(search);
    const weights = getWeights(terms, index);
    return weights
        .map((row) => {
            return films[row.index];
        });
}
