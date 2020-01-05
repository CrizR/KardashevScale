import React, {Component} from "react";
import * as PropTypes from "prop-types";


export default class Type0 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h1>Type 0 Civilization - {this.props.tier}</h1>
            <h2>We are currently Type 0 (0.7)!</h2>
            <h2>A civilization that harnesses the energy of its home planet, but not to its full potential just
                yet.</h2>
            <ul>
                <li>Relies on Fossil Fuels and is dependent on non-renewables</li>
                <li>Inefficiently utilizes resources</li>
            </ul>
            <img src={"t1.png"} className="App-logo" alt="logo"/>
        </div>;
    }
}

Type0.propTypes = {tier: PropTypes.number};
