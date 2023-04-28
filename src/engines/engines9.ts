import {stemmer} from 'stemmer-ru';

const stemmerRu = new stemmer();

const gramm3 = (word: string) => {
    const words = [...(" " + word)].map((w: string, i: number, array: string[]) => {
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
        .flatMap((word => gramm3(word as string)))
        .filter(Boolean) as string[];
}

export let timeStart = 0;
export let contentLength = 0;
let index: [string, string][];
let data: { [name: string]: string } = {}
const dataIds = new Set<number>();
let indexes: Map<number, Map<string, Set<number>>> = new Map<number, Map<string, Set<number>>>();

function loadChunk(index: number) {
    return fetch(`./index/index-${index}.json`)
        .then(res => {
            contentLength += parseInt(res.headers.get("Content-Length") || "0")
            return res.json();
        })
        .then(res => res as { [name: string]: number[] })
        .then(res => {
            const chunk = Object.keys(res).reduce((sum, key) => {
                sum.set(key, new Set(res[key]));
                return sum;
            }, new Map<string, Set<number>>());
            indexes.set(index, chunk)
            return chunk;
        });
}

export const loadIndex = async (tokens: string[]) => {
    if (!index && tokens.length) {
        const time0 = performance.now();
        index = await fetch("index-slice.json")
            .then(res => {
                contentLength = parseInt(res.headers.get("Content-Length") || "0")
                const json = res.json();
                timeStart = Math.ceil(performance.now() - time0);
                return json;
            })
            .then(res => res as [string, string][]);
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
    const localDataIds = new Set(orderedWeight.map(({index}) => (index - (index % 10)) / 10).filter(i => !dataIds.has(i)));
    const dataList = await Promise.all([...localDataIds.keys()]
        .map((dataId) => {
            return fetch(`./data/data-${dataId}.json`)
                .then(res => {
                    contentLength += parseInt(res.headers.get("Content-Length") || "0")
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
    })
}
