import {stemmer} from 'stemmer-ru';
import {getContentLength} from "../lib";

const stemmerRu = new stemmer();

const gramm3 = (word: string) => {
    const words = [...(" " + word)].map((w: string, i: number, array: string[]) => {
        if (i - 2 >= 0) {
            return ((array[i - 2] + array[i - 1] + w))
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
        .flatMap((word => gramm3(word as string)))
        .filter(Boolean) as string[];
}

export let timeStart = 0;
export let contentLength = 0;
const LIMIT_CHUNK_INDEX = 20;
const LIMIT_CHUNK_DATA = 30;
let index: [string, string][];
let data: { [name: string]: string } = {}
const dataIds = new Set<number>();
let indexes: Map<number, Map<string, Set<number>>> = new Map<number, Map<string, Set<number>>>();

function loadChunk(index: number) {
    return fetch(`./index/index-${index}.json`)
        .then(res => {
            getContentLength(res)
                .then(size => contentLength += size);
            return res.json();
        })
        .then(res => res as { [name: string]: number[] })
        .then(res => {
            const chunk = Object.keys(res).slice(0, LIMIT_CHUNK_INDEX).reduce((sum, key) => {
                sum.set(key, new Set(res[key]));
                return sum;
            }, new Map<string, Set<number>>());
            indexes.set(index, chunk)
            return chunk;
        });
}

export const loadSpreadIndex = async () => {
    if (!index) {
        const time0 = performance.now();
        const res = await fetch("index-slice.json");
        getContentLength(res)
            .then(size => contentLength = size);
        index = await res.json();
        timeStart = Math.ceil(performance.now() - time0);
        return ({timeStart, res: index})
    }
    return {timeStart, res: index};
}
export const loadIndex = async (tokens: string[]) => {
    if (!index && tokens.length) {
        index = (await loadSpreadIndex()).res;
    }
    const chunkIds = tokens.flatMap((token) => {
        return index
            .map((v, i) => [v[0], [v[1]], i])
            .filter(([a, b]) => token >= a && token <= b)
            .map(([a, b, i]) => i as number);
    });
    return await Promise.all(chunkIds
        .map((index) => indexes.get(index) || loadChunk(index))
    );

}

function sortWeights(weights: Map<number, number>) {
    const entries = [...weights.entries()]
    entries.sort((a, b) => b[1] - a[1]);
    return entries
        .map((row) => {
            return {index: row[0], weight: row[1]};
        })
}

const getWeights = (terms: string[], index: Map<string, Set<number>>) => {
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
    return weights;
}

function getTotalWeight(weights: Map<number, number>[]) {
    return weights.reduce((sum, chunkWeight) => {
        [...chunkWeight.entries()].forEach(([id, weight]) => {
            sum.set(id, (sum.get(id) || 0) + weight)
        })
        return sum;
    }, new Map<number, number>());
}

export const search = async (search: string) => {
    const terms = tokenizr(search);
    const indexes = await loadIndex(terms)
    const weights = indexes.map((chunk) => getWeights(terms, chunk))
    const totalWeight = getTotalWeight(weights)
    const sortedWeight = sortWeights(totalWeight);
    const orderedWeight = sortedWeight.filter(({index, weight}) => weight > Math.max(0, terms.length - 2));
    const localDataIds = new Set(orderedWeight.map(({index}) => (index - (index % 100)) / 100).filter(i => !dataIds.has(i)));
    debugger;
    const dataList = await Promise.all([...localDataIds.keys()]
        .slice(0, LIMIT_CHUNK_DATA)
        .map((dataId) => {
            return fetch(`./data/data-${dataId}.json`)
                .then(res => {
                    getContentLength(res)
                        .then(size => contentLength += size);
                    return res.json()
                })
                .then(res => ({data: res, id: dataId}))
        }));
    data = dataList.reduce((sum, value) => {
        dataIds.add(value.id)
        return {...sum, ...value.data};
    }, data);

    return orderedWeight.map((row) => {
        return data[row.index];
    }).filter(Boolean)
}
