import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, useParams } from "react-router-dom";
import { StateMachineProvider, createStore } from "little-state-machine";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Result from "./Result";
import Invalid from "./Invalid";
import Used from "./Used";
import Crew from "./Crew";

import "./styles.css";

createStore({});

function App() {
  return (
    <StateMachineProvider>
      {/* <h1>Trevarefest 2021</h1> */}
      <img
        className="center"
        alt="Trevarefest logo"
        src="https://drive.google.com/uc?export=view&id=1G4kUkBNzDuAELOHk30KNcSaTn5HgimIZ"
      />

      <Router>
        <Route exact path="/" component={Step1} />
        <Route exact path="/crew" component={Crew} />
        <Route path="/step2" component={Step2} />
        <Route path="/result" component={Result} />
        <Route path="/invalid" component={Invalid} />
        <Route path="/used" component={Used} />
        <Route path="/code/:code" component={Used} />
      </Router>
    </StateMachineProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
