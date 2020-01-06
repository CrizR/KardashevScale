import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class Type5 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type V Civilization {this.props.showTier ? - this.props.tier : null}</h2>
            <h3>Masters of the Multiverse</h3>
            <p>A multiverse culture, capable of harnessing the energy of multiple universes.</p>
            <ul>
                <li>If you are not already a god, you must have met him/her.</li>
            </ul>
        </div>;
    }
}

Type5.propTypes = {tier: PropTypes.number};
