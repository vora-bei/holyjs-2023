import {useMemo} from "react";
import {distance} from "fastest-levenshtein";


// const result2 = useMemo(() => {
//     const tokenizr = (v: string) => v.toLocaleLowerCase().split(/[,\. ]/);
//
//     const dist = (v: string, s: string) => Math.min(...tokenizr(v).map(w => distance(tokenizr(s)[0], w)));
//
//     if (search === '') {
//         return films;
//     }
//     return films.slice(0, 100)
//         .filter((v, index) => dist(v, search) < Math.max(search.length - 5, 0));
// }, [search, films]);
