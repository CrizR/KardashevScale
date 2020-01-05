import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class Type4 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type IV Civilization - {this.props.tier}</h2>
            <h3>Masters of the Universe</h3>
            <p>A universal civilization, capable of harnessing the energy of the whole universe.</p>
            <ul>
                <li>Some form of teleportation or wormhole-esque space travel is a certainty</li>
                <li>War results in the destruction of galaxies</li>
                <li>Blackholes or Pulsars are a common energy source for a multitude of different tools</li>
                <li>Your understanding of life, death, relationships, and time are dramatically affected by time
                    dilation
                </li>
            </ul>
            <img src={"t4.png"} className="App-logo" alt="logo"/>

        </div>;
    }
}

Type4.propTypes = {tier: PropTypes.number};