import fs from "fs";
import util from "util";
import {stemmer} from 'stemmer-ru';

const stemmerRu = new stemmer();

const gramm3 = (word: string) => {
    const words = [...(" " + word)].map((w, i, array) => {
        if (i - 2 >= 0) {
            return array[i - 2] + array[i - 1] + w
        } else {
            return null;
        }
    }).filter(Boolean);
    return words;
}

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
// @ts-ignore
const films = JSON.parse(await readFile('./public/films.json'));
const tokenizr = (film: string): string[] => {
    return film
        .toLocaleLowerCase()
        .split(/[\s\.,!?]/)
        .map((word) => stemmerRu.stemWord(word) || word)
        .flatMap((word => gramm3(word)))
        .filter(Boolean) as string[];
}
export const createIndex = (films: string[]) => films
    .reduce((sum, film, row) => {
        tokenizr(film)
            .forEach(term => {
                if (!sum[term]) {
                    sum[term!] = [];
                }
                sum[term].push(row);
            })
        return sum;
    }, {} as { [key: string]: number[] });

export const splitIndex = (index: { [key: string]: number[] }) => {
    const keys = Object.keys(index);
    const chunks: { index: { [key: string]: number[] }, slice: [string, string] }[] = [];
    const chunkSize = 10;
    keys.sort((a, b) => {
        if (a >= b) {
            return 1;
        } else {
            return -1
        }
    });
    keys.forEach((key, i) => {
        const chunkNumber = (i - i % chunkSize) / chunkSize

        if (!chunks[chunkNumber]) {
            chunks[chunkNumber] = {index: {}, slice: [key, key]};
        }
        chunks[chunkNumber]["index"][key] = index[key];
        chunks[chunkNumber]["slice"][1] = key;
    })
    return chunks;
}
export const splitData = (films: string[]) => {
    const chunkSize = 100;
    const chunks: { [name: number]: string }[] = [];
    films.forEach((key, i) => {
        const chunkNumber = (i - i % chunkSize) / chunkSize

        if (!chunks[chunkNumber]) {
            chunks[chunkNumber] = {};
        }
        chunks[chunkNumber][i] = key;
    })
    return chunks;
}

const index = createIndex(films);
const chunkIndex = splitIndex(index);
const chunkData = splitData(films);
chunkIndex.forEach(async (value, index) => {
    await writeFile(`./public/index/index-${index}.json`, JSON.stringify(value.index));
});
chunkData.forEach(async (value, index) => {
    await writeFile(`./public/data/data-${index}.json`, JSON.stringify(value));
});
await writeFile(`./public/index-slice.json`,
    JSON.stringify(chunkIndex.map((value, index) => value.slice))
);
