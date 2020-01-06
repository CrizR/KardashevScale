import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class TypeV extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type V-Minus</h2>
            <p>Capable of manipulating the atomic nucleus and engineering the nucleons that compose it</p>
        </div>;
    }
}

TypeV.propTypes = {tier: PropTypes.number};