import React, {Component} from "react";
import Link from "@material-ui/core/Link";
import * as PropTypes from "prop-types";

export default class TypeIII extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type III-Minus</h2>
            <p>Capable of manipulating molecules and molecular bonds, creating new materials</p>
        </div>;
    }
}

TypeIII.propTypes = {tier: PropTypes.number};