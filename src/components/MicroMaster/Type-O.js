import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class TypeO extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type Omega-Minus</h2>
            <p>Capable of manipulating the basic structure of space and time</p>
        </div>;
    }
}

TypeO.propTypes = {tier: PropTypes.number};
