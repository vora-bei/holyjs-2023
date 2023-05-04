const tokenizr= (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s.,!?:;]/)

export const search = (films: string[], search: string) => {
    if(!search || !search.length){
        return [];
    }
    const terms = tokenizr(search);
    return films.filter(film => {
        const words = new Set(tokenizr(film));
        return terms.every(term => words.has(term))
    });
}
