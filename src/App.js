import React from 'react';
import './index.css';
import Calculator from "./components/Calculator/Calculator";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Switch} from "react-bootstrap";
import LifeScale from "./components/LifeScale/LifeScale";
import mp3_file from "./music.mp3"


function App() {

    return (
        <>
            <audio
                autoPlay={true}>
                <source type="audio/mp3" src={mp3_file}/>
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
