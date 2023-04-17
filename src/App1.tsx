import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import {distance} from 'fastest-levenshtein';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {stemmer} from 'stemmer-ru';
import './App.css'
import { Alert, Row, Col } from 'react-bootstrap';

const stemmerRu = new stemmer();

const gramm3 = (word: string) => {
    const words = [...word].map((w: string, i: number, array: string[]) => {
        if (i - 2 >= 0) {
            return array[i - 2] + array[i - 1] + w
        } else {
            return null;
        }
    }).filter(Boolean) as string[];
    return new Set<string>(words);
}
const distance3gram = (localSearch: Set<string>, nGrmaCandidate: Set<string>) => {
    let dist = 0;
    for (const ngram of nGrmaCandidate) {
        if (!localSearch.has(ngram)) {
            dist++;
        }
    }
    return dist;
}

const films = [
    "Название фильма",
    "Почти знаменит",
    "Открытое настеж окно.",
    "Открытый простор",
    "Особо важное задание",
    "Особо опасен",
    "Особо опасен",
    "Особо опасен",
    "Поющее звенящее деревце"
];

const search0 = (films: string[], search: string) => {
    return films.filter(film => film.includes(search));
}

search0(films, "окно");
search0(films, "особо");

const search1 = (films: string[], search: string) => {
    return films.filter(film =>
        film.toLocaleLowerCase()
            .includes(
                search.toLocaleLowerCase()
            )
    );
}

search1(films, "окно");
search1(films, "особо");
search1(films, "открытый");
search1(films, "открытое окно");


const search2 = (films: string[], search: string) => {
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

search2(films, "окно");
search2(films, "особо");
search2(films, "открытый");
search2(films, "открытое окно");
search2(films, "открытые окна");


const tokenizr = (film: string) => film
    .toLocaleLowerCase()
    .split(/[\s.,!?]/)
    .map((word) => stemmerRu.stemWord(word));

const search4 = (films: string[], search: string) => {
    return films.filter(film => {
        const words = new Set(tokenizr(film));
        const terms = tokenizr(search)
        return terms.every(term => words.has(term))
    });
}

search4(films, "окно");
search4(films, "особо");
search4(films, "открытый");
search4(films, "открытое окно");
search4(films, "открытые окна");



function App() {
    const [films, setFilms] = useState<string[]>([]);
    const [localSearch, setSearch] = useState("");
    const search = useDeferredValue(localSearch)
    const candidates = useMemo(() => films.map(candidate => candidate), [films]);
    const candidatesNgrams = useMemo(() => films.map(candidate => gramm3(candidate)), [films]);
    const result33 = useMemo(() => {
        const localSearch = gramm3(search);
        return candidates
            .filter((v, i) => distance3gram(localSearch, candidatesNgrams[i]))
    }, [search, films]);
    useEffect(() => {
        fetch("films.json")
            .then(res => res.json())
            .then(setFilms)
    }, [])
    const result0 = useMemo(() => {
        return films.filter(film => film.includes(search))
    }, [search, films]);

    const result1 = useMemo(() => {
        return films.filter(v => v.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    }, [search, films]);

    const result11 = useMemo(() => {
        return films.filter(v => v.toLocaleLowerCase()
            .includes((stemmerRu.stemWord(search) || '')
                .toLocaleLowerCase()))
    }, [search, films]);

    const result2 = useMemo(() => {
        const tokenizr = (v: string) => v.toLocaleLowerCase().split(/[,\. ]/);

        const dist = (v: string, s: string) => Math.min(...tokenizr(v).map(w => distance(tokenizr(s)[0], w)));

        if (search === '') {
            return films;
        }
        return films.slice(0, 100)
            .filter((v, index) => dist(v, search) < Math.max(search.length - 5, 0));
    }, [search, films]);

    const result3 = useMemo(() => {
        const tokenizr2 = (v: string) => v.toLocaleLowerCase().split(/[,\. ]/);

        const dist2 = (v: string, s: string) => Math.min(...tokenizr2(v).map(w => distance(tokenizr2(s)[0], w)));

        if (search === '') {
            return films;
        }
        return films.slice(0, 100)
            .filter((v, index) => dist2(v, search) < 3);
    }, [search, films]);

    return (
        <div className="App">
            <Form>
                <Row>
                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Стратегия поиска</Form.Label>
                        <Form.Select value={1} aria-label="Стратегия поиска">
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Данные</Form.Label>
                        <Form.Select aria-label="Данные">
                            <option value="1">Немного данных</option>
                            <option value="2">100 000</option>
                        </Form.Select>
                    </Form.Group>
                </Row>
            </Form>
            <InputGroup className="mb-3 mt-3">
                <Form.Control
                    type={'search'}
                    placeholder="Поиск"
                    aria-label="Поиск"
                    onInput={(e) => setSearch(e.currentTarget.value)}
                />
            </InputGroup>
            <div>{
                result2
                    .slice(0, 100)
                    .map((film, i) =>
                        <Alert key={i} variant={'success'}>
                            {film}
                        </Alert>)}
            </div>
        </div>
    )
}

export default App
