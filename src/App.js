import React from 'react';
import './index.css';
import mp3_file from './music/music.mp3';
import Calculator from "./components/Calculator/Calculator";
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Switch} from "react-bootstrap";
import LifeScale from "./components/LifeScale/LifeScale";


function App() {

    return (
        <div className="App">
            <audio style={{display: 'none'}} src={mp3_file} controls loop autoPlay/>
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
