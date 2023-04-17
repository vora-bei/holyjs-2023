export const search = (films: string[], search: string) => {
    return films.filter(film => film.includes(search));
}
