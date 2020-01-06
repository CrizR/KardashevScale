import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class TypeII extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type II-Minus</h2>
            <p>Capable of manipulating genes and altering the development of living things, transplanting or replacing
                parts of themselves, reading and engineering their genetic code</p>
        </div>;
    }
}

TypeII.propTypes = {tier: PropTypes.number};