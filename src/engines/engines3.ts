export const search = (films: string[], search: string) => {
    if(!search || !search.length){
        return films;
    }
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
