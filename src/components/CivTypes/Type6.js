import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class Type6 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type VI Civilization {this.props.showTier ? - this.props.tier : null}</h2>
            <h3>Masters of Space of Time</h3>
            <p>Exists outside of time and space, and is capable of creating universes and multiverses, and
                destroying them just as easily.</p>
            <ul>
                <li>You are a god</li>
            </ul>
        </div>;
    }
}

Type6.propTypes = {tier: PropTypes.number};
