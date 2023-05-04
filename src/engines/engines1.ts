export const search = (films: string[], search: string) => {
    if(!search || !search.length){
        return [];
    }
    return films.filter(film => film.includes(search));
}
