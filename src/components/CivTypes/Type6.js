import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class Type6 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h1>Type VI Civilization - {this.props.tier}</h1>
            <h2>Masters of Space of Time</h2>
            <p>Exists outside of time and space, and is capable of creating universes and multiverses, and
                destroying them just as easily.</p>
            <ul>
                <li>You are a god.</li>
            </ul>
            <img src={"t4.png"} className="App-logo" alt="logo"/>
        </div>;
    }
}

Type6.propTypes = {tier: PropTypes.number};
