import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class TypeIV extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type IV-Minus</h2>
            <p>Capable of manipulating individual atoms, creating nanotechnologies on the atomic scale and creating complex forms of artificial life</p>
        </div>;
    }
}

TypeIV.propTypes = {tier: PropTypes.number};