import * as b from "bobril";
import { useAsyncResource } from "be-resource-cache-bobril/src";
import { fakeResource } from "./fakeResource";
import { useRef, useState } from "bobril";

b.init(App);

function App() {
  const [id, setId] = useState(5);
  return (
    <div>
      <div>
        Id: {id}
        <input type="button" value="+" onClick={() => setId(id + 1)} />
        <input
          type="button"
          value="-"
          onClick={() => setId(Math.max(0, id - 1))}
        />
        , <RenderCounter />
      </div>
      <DisplayValue id={id} />
    </div>
  );
}

function DisplayValue(p: { id: number }) {
  const value = useAsyncResource(fakeResource, p.id)?.data;
  return (
    <div>
      Value: {value ?? "(no value yet)"}, <RenderCounter />
    </div>
  );
}

function RenderCounter() {
  const counter = useRef(0);
  counter(counter.current + 1);
  return <>Component render: {counter.current}</>;
}
