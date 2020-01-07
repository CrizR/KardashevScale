import React from 'react';
import './index.css';
import Calculator from "./components/Calculator/Calculator";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Switch} from "react-bootstrap";
import LifeScale from "./components/LifeScale/LifeScale";


const mp3_file = "https://kardashev-calc.s3.amazonaws.com/music.mp3";

function App() {

    return (
        <div className="App">
            <audio src={mp3_file} loop autoPlay/>
            <Router>
                <Switch>
                    <Route path="/calculator" exact component={Calculator}/>
                    <Route path="/" exact component={LifeScale}/>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
