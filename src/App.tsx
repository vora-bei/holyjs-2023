import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {HandIndexFill, HandThumbsDownFill, HandThumbsUpFill, CheckLg, X} from 'react-bootstrap-icons';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {Badge, Col, Container, Row, Table} from 'react-bootstrap';
import {search as search1} from './engines/engines1';
import {search as search2} from './engines/engines2';
import {search as search3} from './engines/engines3';
import {search as search4} from './engines/engines4';
import {createIndex as createIndex5, search as search5} from './engines/engines5';
import {createIndex as createIndex6, search as search6} from './engines/engines6';
import {createIndex as createIndex7, search as search7} from './engines/engines7';
import {search as search8} from './engines/engines8';
import {search as search9, timeStart as timeStart9, contentLength as contentLength9} from './engines/engines9';
import './App.css'

const exampleFilms = [
    "Аватар",
    "Джон уик",
    "Матрица: Перезагрузка",
    "Смурфики. Волшебная игла портного",
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
    const [contentLength, setContentLength] = useState<number>(0);
    const [timeStart5, setTimeStart5] = useState<number>(0);
    const [timeStart6, setTimeStart6] = useState<number>(0);
    const [timeStart7, setTimeStart7] = useState<number>(0);
    const [search9Result, setSearch9Result] = useState<string[]>([]);
    const [film5Index, setFilm5Index] = useState<Set<string>[]>([]);
    const [film6Index, setFilm6Index] = useState<Map<string, Set<number>>>(new Map());
    const [film7Index, setFilm7Index] = useState<Map<string, Set<number>>>(new Map());
    const [localSearch, setSearch] = useState("");
    const [engine, setEngine] = useState("simple");
    const [dataSize, setDataSize] = useState("little");
    const search = useDeferredValue(localSearch)
    useEffect(() => {
        fetch("films.json")
            .then(res => {
                setContentLength(parseInt(res.headers.get("Content-Length") || "0"));
                return res.json()
            })
            .then(films => {
                setFilms(films)

                const t0 = performance.now();
                setFilm5Index(createIndex5(films))
                const t1 = performance.now();
                setTimeStart5(Math.ceil(t1 - t0))

                const t01 = performance.now();
                setFilm6Index(createIndex6(films))
                const t11 = performance.now();
                setTimeStart6(Math.ceil(t11 - t01))

                const t02 = performance.now();
                setFilm7Index(createIndex7(films))
                const t12 = performance.now();
                setTimeStart7(Math.ceil(t12 - t02))

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
            case "n-gram spread index":
                return search9Result
            default:
                return search1(data, search);
        }
    }, [search, films, search9Result, dataSize, engine]);
    useEffect(() => {
        (async () => {
            setSearch9Result(await search9(search));
        })()
    }, [search, films])
    const resultCompared = useMemo(() => {
        return search7(dataSize === 'little' ? index7 : film7Index, dataSize === 'little' ? exampleFilms : films, search)
    }, [search, films, dataSize, engine]);
    const color = (film: string, resultSet: Set<string>, comparedSet: Set<string>) => {
        if (resultSet.has(film) && comparedSet.has(film)) {
            return <CheckLg size={30} color={"green"}/>
        }
        if (resultSet.has(film)) {
            return <X size={30} color={"red"}/>;
        }
        if (comparedSet.has(film)) {
            return <X size={30} color={"red"}/>;
        }
        return null;
    }
    const t1 = performance.now();
    const resultSet = new Set(result);
    const missedCount = resultCompared.filter(film => !resultSet.has(film)).length;
    const successCount = resultCompared.filter(film => resultSet.has(film)).length;
    const timeStart = () => {
        if (dataSize === 'little') {
            return 1;
        }
        switch (engine) {
            case "lemming pre-calculate":
                return timeStart5;
            case "lemming indexed":
                return timeStart6;
            case "n-gram indexed":
                return timeStart7;
            case "n-gram spread index":
                return timeStart9;
            default:
                return 1;
        }
    }
    const bigRender = (films: string[]) => {
        const resultSet = new Set(result);
        const comparedSet = new Set(resultCompared);
        const success = films
            .filter(film => resultSet.has(film) && comparedSet.has(film))
        const errors = films
            .filter(film => !resultSet.has(film) && comparedSet.has(film))
        const extras = films
            .filter(film => resultSet.has(film) && !comparedSet.has(film))
        const others = films
            .filter(film => !resultSet.has(film) && !comparedSet.has(film))
        const resortResults = [...success, ...errors, ...extras, ...others];
        return <Table bordered hover>
            <thead>
            <tr>
                <th>Фильм</th>
                <th>{engine} алгоритм <Badge>{result.length}</Badge></th>
                <th>Секретный алгоритм <Badge>{resultCompared.length}</Badge></th>
                <th className={'d-none d-md-block'} >Совпадения <Badge>{successCount} из {successCount + missedCount}</Badge></th>
            </tr>
            </thead>
            <tbody>
            {
                resortResults
                    .slice(0, 1000)
                    .map((film, i) =>
                        <tr key={i}>
                            <td width={'40%'}>{film}</td>
                            <td align={"center"}>{resultSet.has(film) ? <CheckLg size={30} color={"green"}/> : null}</td>
                            <td align={"center"}>{comparedSet.has(film) ?
                                <CheckLg size={30} color={"green"}/> : null}</td>
                            <td className={'d-none d-md-block'} align={"center"}>
                                {color(film, resultSet, comparedSet)}
                            </td>
                        </tr>
                    )
            }
            </tbody>
        </Table>
    }
    const timeSearch = Math.ceil(t1 - t0)
    return (
        <div className="App">
            <Container>
                <h1 className={"text-center"}>Полигон</h1>
                <Form>
                    <Row className={'align-items-end'}>
                        <Form.Group as={Col} md={6} controlId="formGridEmail" className={"mb-3 mt-3"} >
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
                                <option value="n-gram spread index">n-gram cdn индекс</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col}  md={6} className={"mb-3"}  >
                            <Form.Label>Показать</Form.Label>
                            <Form.Select defaultValue={dataSize}
                                         onChange={(e) => setDataSize(e.currentTarget.value)}
                                         aria-label="Данные">
                                <option value="little">Срез данных</option>
                                <option value="large">Все данные</option>
                            </Form.Select>
                        </Form.Group>
                    </Row>
                    <InputGroup className="mb-3 mt-3 md-4 xs-12">
                        <Form.Control
                            type={'search'}
                            placeholder="Поиск"
                            aria-label="Поиск"
                            defaultValue={search}
                            onInput={(e) => setSearch(e.currentTarget.value)}
                        />
                    </InputGroup>
                    {dataSize !== 'little'?

                    <Row className={"mb-3 mt-3"}>
                        <Col sm={12} md={4}>
                            <h3 style={{marginTop: "32px"}}>
                                Старт
                                <Badge className={"float-end"} bg={timeStart() > 50 ? "danger" : "success"}>{timeStart()} ms</Badge>
                            </h3>
                        </Col>
                        <Col sm={12} md={4}>
                                <h3 style={{marginTop: "32px"}}>
                                    Искало <Badge
                                    className={"float-end"}
                                    bg={timeSearch > 50 ? "danger" : "success"}>{timeSearch} ms
                                </Badge>
                                </h3>
                        </Col>
                        <Col sm={12} md={4}>
                                <h3 style={{marginTop: "32px"}}>
                                    Скачалось
                                    {engine === 'n-gram spread index' ?
                                        <Badge className={"float-end"}>{Math.ceil(contentLength9 / 1024 / 1024 * 100) / 100} MB</Badge>:
                                        <Badge className={"float-end"}>{Math.ceil(contentLength / 1024 / 1024 * 100) / 100} MB</Badge>
                                    }

                                </h3>
                        </Col>
                    </Row>: null}
                </Form>
                <div  className={"table-responsive"}>{bigRender(dataSize === 'little' ? exampleFilms : films)}</div>
            </Container>
        </div>
    )
}

export default App
