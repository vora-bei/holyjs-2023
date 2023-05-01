import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {CheckLg, Search, X} from 'react-bootstrap-icons';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Parallax} from 'react-parallax';
import {Badge, Col, Container, Row, Table} from 'react-bootstrap';
import {search as search1} from './engines/engines1';
import {search as search2} from './engines/engines2';
import {search as search3} from './engines/engines3';
import {search as search4} from './engines/engines4';
import {createIndex as createIndex5, search as search5} from './engines/engines5';
import {createIndex as createIndex6, search as search6} from './engines/engines6';
import {createIndex as createIndex7, search as search7} from './engines/engines7';
import {search as search8} from './engines/engines8';
import {contentLength as contentLength9, loadSpreadIndex, search as search9} from './engines/engines9';
import './App.css'
import {getContentLength} from "./lib";

const exampleFilms = [
    "Аватар",
    "Джон уик",
    "Матрица: Перезагрузка",
    "Криминальное чтиво",
    "Помни",
    "Волк с Уолл-стрит",
    "Властелин колец: Возвращение короля",
    "Интерстеллар",
    "Назад в будущее",
    "Иван Васильевич меняет профессию"
];
const index7 = createIndex7(exampleFilms);
const index6 = createIndex6(exampleFilms);
const index5 = createIndex5(exampleFilms);


const algorithms = [
    {value: "simple", label: "Наивый вариант"},
    {value: "lowercase", label: "Lowercase"},
    {value: "stemming", label: "Стеминг"},
    {value: "lemming", label: "Леметизация"},
    {value: "lemming pre-calculate", label: "Леметизация предрасчет"},
    {value: "lemming indexed", label: "Леметизация индекс"},
    {value: "levenshtein", label: "Левенштейн"},
    {value: "n-gram indexed", label: "N-gram индекс"},
    {value: "n-gram spread index", label: "N-gram cdn индекс"}
];

function App() {
    const [films, setFilms] = useState<string[]>([]);
    const [contentLength, setContentLength] = useState<number>(0);
    const [timeStart5, setTimeStart5] = useState<number>(0);
    const [timeStart6, setTimeStart6] = useState<number>(0);
    const [timeStart7, setTimeStart7] = useState<number>(0);
    const [timeStart9, setTimeStart9] = useState<number>(0);
    const [timeLoad9, setTimeLoad9] = useState<number>(0);
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
                getContentLength(res)
                    .then(size => setContentLength(size));
                return res.json()
            })
            .then(films => {
                setFilms(films)
            })
    }, [])
    useEffect(() => {
        if (films.length && !film5Index.length && engine === 'lemming pre-calculate') {
            const t0 = performance.now();
            setFilm5Index(createIndex5(films))
            const t1 = performance.now();
            setTimeStart5(Math.ceil(t1 - t0))
        }
    }, [films.length, film5Index, engine])
    useEffect(() => {
        if (films.length && !film6Index.size && engine === 'lemming indexed') {
            const t01 = performance.now();
            setFilm6Index(createIndex6(films))
            const t11 = performance.now();
            setTimeStart6(Math.ceil(t11 - t01))
        }
    }, [films.length, film6Index, engine])
    useEffect(() => {
        if (films.length && !film7Index.size) {
            const t01 = performance.now();
            setFilm7Index(createIndex7(films))
            const t11 = performance.now();
            setTimeStart7(Math.ceil(t11 - t01))
        }
    }, [films.length, film7Index, engine]);
    useEffect(() => {

        if (engine === 'n-gram spread index') {
            loadSpreadIndex()
                .then(({timeStart}) => {
                    setTimeStart9(timeStart)
                })
                .catch(r => console.error(r))
        }
    }, [engine])

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
                if (!index5L.length)
                    return []
                return search5(index5L, data, search)
            case "lemming indexed":
                if (!index6L.size)
                    return []
                return search6(index6L, data, search)
            case "n-gram indexed":
                if (!index7L.size)
                    return []
                return search7(index7L, data, search)
            case "levenshtein":
                return search8(data, search)
            case "n-gram spread index":
                return search9Result
            default:
                return search1(data, search);
        }
    }, [search, films, search9Result, dataSize, engine, film5Index, film6Index, film7Index]);
    useEffect(() => {
        (async () => {
            const t02 = performance.now();
            setSearch9Result(await search9(search));
            setTimeLoad9(Math.ceil(performance.now() - t02))
        })()
    }, [search])
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
    const missedCount = new Set(resultCompared.filter(film => !resultSet.has(film))).size;
    const successCount = new Set(resultCompared.filter(film => resultSet.has(film))).size;
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
        return <Table hover>
            <thead>
            <tr>
                <th>
                    <NavDropdown
                        title={dataSize === "little" ? "Срез данных" : "Все данные"}
                        defaultValue={dataSize}
                    >
                        <NavDropdown.Item
                            data-value="little"
                            onClick={(e) => setDataSize("little")}>
                            Срез данных
                        </NavDropdown.Item>
                        <NavDropdown.Item
                            onClick={(e) => setDataSize("large")}>
                            Все данные
                        </NavDropdown.Item>
                    </NavDropdown>
                    <div style={{color: "#CBCBCB"}}>
                        {dataSize === "little" ? "10" : "100 000"}
                    </div>
                </th>
                <th>
                    <NavDropdown
                        title={algorithms.find((e) => e.value === engine)?.label}
                        defaultValue={dataSize}
                    >
                        {
                            algorithms.map(({label, value}) => <NavDropdown.Item
                                onClick={(e) => setEngine(value)}>
                                {label}
                            </NavDropdown.Item>)
                        }
                    </NavDropdown>
                    <Badge bg={"secondary"}>{successCount} из {successCount + missedCount}</Badge>
                </th>
            </tr>
            </thead>
            <tbody>
            {
                resortResults
                    .slice(0, 1000)
                    .map((film, i) =>
                        <tr key={i}>
                            <td width={'95%'}>{film}</td>
                            <td width={'5%'} align={"right"}>
                                {color(film, resultSet, comparedSet)}
                            </td>
                        </tr>
                    )
            }
            </tbody>
        </Table>
    }
    const timeSearch = engine === 'n-gram spread index' ? timeLoad9 : Math.ceil(t1 - t0);
    return (
        <>
            <Navbar className={"navbar-custom"}>
                <Container fluid={"lg"}>
                    <Navbar.Brand><img className={"nikita"} src={"nikita.png"}/></Navbar.Brand>
                </Container>
            </Navbar>
            <>
                <div className={"paralax"}>
                    <Container fluid={"xl"}>
                        <Parallax bgImage={"/holyjs_2023_spring_hero_bg 5.png"} >
                            <div style={{height: 315}}>
                                <Container>
                                    <Row className={"margin-header justify-content-md-center"}>
                                        <Col md={9}>
                                            <h1 className={"title"}>Нечеткий поиск</h1>
                                            <h2 className={"subtitle"}>Построение индекса на CDN</h2>
                                            <Form onSubmit={(e) => e.preventDefault()}>
                                                <InputGroup className="mb-3 mt-3 md-4 xs-12">
                                                    <Form.Control
                                                        type={'search'}
                                                        placeholder="Поиск"
                                                        aria-label="Поиск"
                                                        defaultValue={search}
                                                        onBlur={(e) => setSearch(e.currentTarget.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                setSearch(e.currentTarget.value);
                                                            }
                                                        }}
                                                    />
                                                    <InputGroup.Text><Search/></InputGroup.Text>
                                                </InputGroup>
                                            </Form>
                                        </Col>
                                    </Row>


                                </Container>
                            </div>
                        </Parallax>
                    </Container>

                </div>
                <Container fluid={"xxl"}>
                    <Row className={"mb-3 mt-3 justify-content-md-center"} >
                        <Col sm={12} md={3}>
                            <h3 style={{marginTop: "32px"}}>
                                {engine === 'n-gram spread index' ? "Старт (Сеть)" : "Старт (CPU)"}
                                {engine === 'n-gram spread index' ?
                                    <Badge className={"float-end"}
                                           bg={timeStart() > 200 ? "danger" : "success"}>{timeStart()} ms</Badge> :
                                    <Badge className={"float-end"}
                                           bg={timeStart() > 50 ? "danger" : "success"}>{timeStart()} ms</Badge>
                                }
                            </h3>
                        </Col>
                        <Col sm={12} md={3}>
                            <h3 style={{marginTop: "32px"}}>
                                {engine === 'n-gram spread index' ? "Поиск (Сеть)" : "Поиск (CPU)"}
                                {engine === 'n-gram spread index' ?
                                    <Badge
                                        className={"float-end"}
                                        bg={timeSearch > 300 ? "danger" : "success"}>{timeSearch} ms
                                    </Badge> :
                                    <Badge
                                        className={"float-end"}
                                        bg={timeSearch > 50 ? "danger" : "success"}>{timeSearch} ms
                                    </Badge>

                                }
                            </h3>
                        </Col>
                        <Col sm={12} md={3}>
                            <h3 style={{marginTop: "32px"}}>
                                Сеть
                                {engine === 'n-gram spread index' ?
                                    <Badge
                                        bg={(contentLength9 / 1024 / 1024 * 100) / 100 > 1 ? "danger" : "success"}
                                        className={"float-end"}>{Math.ceil(contentLength9 / 1024 / 1024 * 100) / 100} MB</Badge> :
                                    <Badge
                                        bg={(contentLength / 1024 / 1024 * 100) / 100 > 1 ? "danger" : "success"}
                                        className={"float-end"}>{Math.ceil(contentLength / 1024 / 1024 * 100) / 100} MB</Badge>
                                }

                            </h3>
                        </Col>
                    </Row>
                    <Row className={"justify-content-md-center"}>
                        <Col md={9}
                             className={"table-responsive justify-content-md-center"}>
                            {bigRender(dataSize === 'little' ? exampleFilms : films)}
                        </Col>
                    </Row>
                </Container>
            </>
        </>
    )
}

export default App