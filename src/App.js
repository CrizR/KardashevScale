import React from 'react';
import './index.css';
import Calculator from "./components/Calculator/Calculator";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Switch} from "react-bootstrap";
import LifeScale from "./components/LifeScale/LifeScale";


function App() {

    return (
        <>
            <audio
                autoPlay={true}>
                <source type="audio/mp3"
                        src={"https://kardashev-calc.s3.amazonaws.com/music.mp3"}/>
            </audio>
            <div className="App">
                <Router>
                    <Switch>
                        <Route path="/calculator" exact component={Calculator}/>
                        <Route path="/" exact component={LifeScale}/>
                    </Switch>
                </Router>
            </div>
        </>
    );
}

export default App;
