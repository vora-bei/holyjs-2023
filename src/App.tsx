import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {search as search1} from './engines/engines1';
import {search as search2} from './engines/engines2';
import {search as search3} from './engines/engines3';
import {search as search4} from './engines/engines4';
import {search as search6, createIndex as createIndex6} from './engines/engines6';
import {search as search7, createIndex as createIndex7} from './engines/engines7';
import './App.css'

const exampleFilms = [
    "Почти знаменит",
    "Открытое настеж окно.",
    "Открытый простор",
    "Особо важное задание",
    "Особо опасен 1",
    "Особо опасен 2",
    "Особо опасен 3",
    "Поющее звенящее деревце"
];
const index7 = createIndex7(exampleFilms);
const index6 = createIndex6(exampleFilms);

function App() {
    const [films, setFilms] = useState<string[]>([]);
    const [film6Index, setFilm6Index] = useState<Map<string, Set<number>>>(new Map());
    const [film7Index, setFilm7Index] = useState<Map<string, Set<number>>>(new Map());
    const [localSearch, setSearch] = useState("");
    const [engine, setEngine] = useState("simple");
    const [dataSize, setDataSize] = useState("little");
    const search = useDeferredValue(localSearch)
    useEffect(() => {
        fetch("films.json")
            .then(res => res.json())
            .then(films => {
                setFilms(films)
                setFilm6Index(createIndex6(films))
                setFilm7Index(createIndex7(films))
            })
    }, [])
    const result = useMemo(() => {
        const data = dataSize === 'little' ? exampleFilms : films;
        const index7L = dataSize === 'little' ? index7 : film7Index;
        const index6L = dataSize === 'little' ? index6 : film6Index;
        switch (engine) {
            case "simple":
                return search1(data, search);
            case "lowercase":
                return search2(data, search)
            case "stemming":
                return search3(data, search)
            case "lemming":
                return search4(data, search)
            case "lemming indexed":
                return search6(index6L, data, search)
            case "n-gram indexed":
                return search7(index7L, data, search)
            default:
                return search1(data, search);
        }

    }, [search, films, dataSize, engine]);

    const bigRender = () => result
        .slice(0, 100)
        .map((film, i) =>
            <Alert key={i} variant={'secondary'}>
                {film}
            </Alert>);
    const exampleRender = () => {
        const resultSet = new Set(result);
        const comparedSet = new Set(search7(index7, exampleFilms, search));
        const variant = (film: string) => resultSet.has(film) ? 'success' : comparedSet.has(film) ? 'danger' : 'secondary'
        return exampleFilms
            .map((film, i) =>
                <Alert key={i} variant={variant(film)}>
                    {film}
                </Alert>);
    }

    return (
        <div className="App">
            <Container>
                <Row>
                    <Col>
                        <Form>
                            <Row>
                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Стратегия поиска</Form.Label>
                                    <Form.Select defaultValue={engine}
                                                 onChange={(e) => setEngine(e.currentTarget.value)}
                                                 aria-label="Стратегия поиска">
                                        <option value="simple">Наивый вариант</option>
                                        <option value="lowercase">Lowercase</option>
                                        <option value="stemming">Стеминг</option>
                                        <option value="lemming">Леметизация</option>
                                        <option value="lemming indexed">Леметизация индекс</option>
                                        <option value="n-gram indexed">n-gram индекс</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Данные</Form.Label>
                                    <Form.Select defaultValue={dataSize}
                                                 onChange={(e) => setDataSize(e.currentTarget.value)}
                                                 aria-label="Данные">
                                        <option value="little">Немного данных</option>
                                        <option value="large">100 000</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                        </Form>
                        <InputGroup className="mb-3 mt-3">
                            <Form.Control
                                type={'search'}
                                placeholder="Поиск"
                                aria-label="Поиск"
                                defaultValue={search}
                                onInput={(e) => setSearch(e.currentTarget.value)}
                            />
                        </InputGroup>
                        <div>{dataSize === 'little' ? exampleRender() : bigRender()}</div>
                    </Col>
                    <Col>
                        <h2 className={"center"}>Легенда</h2>
                        {dataSize === 'little' ? <>
                            <p>
                                В этом режиме мы сравниваем выбранный поиск с лучшим вариантом поиска
                            </p>
                            <Alert variant={"success"}>
                                Успех
                            </Alert>
                            <Alert variant={"danger"}>
                                Не найден
                            </Alert>
                            <Alert variant={"secondary"}>
                                Не подходит под критерии поиска
                            </Alert>
                        </> : null}
                        {dataSize !== 'little' ? <>
                            <p>
                                В этом режиме мы меряем скорость
                            </p>

                        </> : null}

                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default App
