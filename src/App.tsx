import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {stemmer} from 'stemmer-ru';
import './App.css'
import {Alert, Col, Row} from 'react-bootstrap';
import {search as search1} from './engines/engines1';
import {search as search2} from './engines/engines2';
import {search as search4} from './engines/engines4';
import {search as search6} from './engines/engines6';
import {search as search7, createIndex} from './engines/engines7';

const stemmerRu = new stemmer();

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
const index7 = createIndex(exampleFilms);
console.log(index7)
function App() {
    const [films, setFilms] = useState<string[]>([]);
    const [localSearch, setSearch] = useState("");
    const [engine, setEngine] = useState("simple");
    const [dataSize, setDataSize] = useState("little");
    const search = useDeferredValue(localSearch)
    useEffect(() => {
        fetch("films.json")
            .then(res => res.json())
            .then(setFilms)
    }, [])
    const result = useMemo(() => {
        const data = dataSize === 'little' ? exampleFilms : films;
        switch (engine) {
            case "simple":
                return search1(data, search);
            case "lowercase":
                return search2(data, search)
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
        const variant = (film: string)=> resultSet.has(film) ? 'success' :  comparedSet.has(film) ? 'danger' : 'secondary'
        return exampleFilms
            .map((film, i) =>
                <Alert key={i} variant={ variant(film) }>
                    {film}
                </Alert>);
    }

    return (
        <div className="App">
            <Form>
                <Row>
                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Стратегия поиска</Form.Label>
                        <Form.Select defaultValue={engine} onChange={(e) => setEngine(e.currentTarget.value)} aria-label="Стратегия поиска">
                            <option value="simple">Наивый вариант</option>
                            <option value="lowercase">Lowercase</option>
                            <option value="lowercase">Three</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Данные</Form.Label>
                        <Form.Select defaultValue={dataSize} onChange={(e) => setDataSize(e.currentTarget.value)} aria-label="Данные">
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
            <div>{dataSize==='little'? exampleRender() : bigRender()}</div>
        </div>
    )
}

export default App
