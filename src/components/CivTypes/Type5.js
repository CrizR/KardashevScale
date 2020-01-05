import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class Type5 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h1>Type V Civilization - {this.props.tier}</h1>
            <h2>Masters of the Multiverse</h2>
            <p>A multiverse culture, capable of harnessing the energy of multiple universes.</p>
            <ul>
                <li>If you are not already a god, you must have met him/her.</li>
            </ul>
            <img src={"t4.png"} className="App-logo" alt="logo"/>
        </div>;
    }
}

Type5.propTypes = {tier: PropTypes.number};