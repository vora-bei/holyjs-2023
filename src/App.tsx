import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {Alert, Badge, Col, Container, Row} from 'react-bootstrap';
import {search as search1} from './engines/engines1';
import {search as search2} from './engines/engines2';
import {search as search3} from './engines/engines3';
import {search as search4} from './engines/engines4';
import {createIndex as createIndex5, search as search5} from './engines/engines5';
import {createIndex as createIndex6, search as search6} from './engines/engines6';
import {createIndex as createIndex7, search as search7} from './engines/engines7';
import {search as search8} from './engines/engines8';
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
const index5 = createIndex5(exampleFilms);

function App() {
    const [films, setFilms] = useState<string[]>([]);
    const [film5Index, setFilm5Index] = useState<Set<string>[]>([]);
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
                setFilm5Index(createIndex5(films))
                setFilm6Index(createIndex6(films))
                setFilm7Index(createIndex7(films))
            })
    }, [])
    const t0 = performance.now();
    const result = useMemo(() => {
        const data = dataSize === 'little' ? exampleFilms : films;
        const index5L = dataSize === 'little' ? index5 : film5Index;
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
            case "lemming pre-calculate":
                return search5(index5L, data, search)
            case "lemming indexed":
                return search6(index6L, data, search)
            case "n-gram indexed":
                return search7(index7L, data, search)
            case "levenshtein":
                return search8(data, search)
            default:
                return search1(data, search);
        }
    }, [search, films, dataSize, engine]);
    const resultCompared = useMemo(() => {
        return search7(dataSize ==='little' ? index7: film7Index, dataSize ==='little'? exampleFilms : films, search)
    }, [search, films, dataSize, engine]);
    const t1 = performance.now();
    const resultSet = new Set(result);
    const comparedSet = new Set(resultCompared);
    const missedCount = resultCompared.filter(film => !resultSet.has(film)).length;
    const successCount = resultCompared.filter(film => resultSet.has(film)).length;
    const extraCount = result.filter(film => !comparedSet.has(film)).length;
    const bigRender = () => {
        const resultSet = new Set(result);
        const comparedSet = new Set(resultCompared);
        const variant = (film: string) =>{
            if(resultSet.has(film) && comparedSet.has(film)){
                return 'success';
            }
            if(resultSet.has(film)){
                return 'info';
            }
            if(comparedSet.has(film)){
                return 'danger';
            }
            return 'secondary'
        }
        return films
            .filter(film => resultSet.has(film) || comparedSet.has(film))
            .slice(0, 1000)
            .map((film, i) =>
                <Alert key={i} variant={variant(film)}>
                    {film}
                </Alert>);
    }
    const exampleRender = () => {
        const resultSet = new Set(result);
        const comparedSet = new Set(search7(index7, exampleFilms, search));
        const variant = (film: string) =>{
            if(resultSet.has(film) && comparedSet.has(film)){
                return 'success';
            }
            if(resultSet.has(film)){
                return 'info';
            }
            if(comparedSet.has(film)){
                return 'danger';
            }
            return 'secondary'
        }

        return exampleFilms
            .map((film, i) =>
                <Alert key={i} variant={variant(film)}>
                    {film}
                </Alert>);
    }
    const timeSearch = Math.ceil(t1 - t0)
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
                                        <option value="lemming pre-calculate">Леметизация предрасчет</option>
                                        <option value="lemming indexed">Леметизация индекс</option>
                                        <option value="levenshtein">Левенштейн</option>
                                        <option value="n-gram indexed">n-gram индекс</option>
                                        <option value="n-gram spread index">n-gram индекс</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Показать</Form.Label>
                                    <Form.Select defaultValue={dataSize}
                                                 onChange={(e) => setDataSize(e.currentTarget.value)}
                                                 aria-label="Данные">
                                        <option value="little">Срез данных</option>
                                        <option value="large">Все данные</option>
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
                        <Alert variant={"success"}>
                            <h3> Нашло одинаково <Badge className={"float-end"} bg={"success"}>{successCount}</Badge></h3>
                        </Alert>
                        <Alert variant={"danger"}>
                            <h3>
                                Не нашло <Badge className={"float-end"} bg={missedCount > 0 ? "danger" : "success"}>{missedCount}</Badge>
                            </h3>
                        </Alert>
                        <Alert variant={"info"}>
                            <h3>
                                Экстра результаты <Badge
                                className={"float-end"}
                                bg={extraCount > 5000 ? "danger" : "success"}>{extraCount}</Badge>
                            </h3>
                        </Alert>
                        <h3>
                            Время поиска <Badge className={"float-end"} bg={timeSearch > 50 ? "danger" : "success"}>{timeSearch} ms</Badge>
                        </h3>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default App
