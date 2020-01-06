import React, {Component} from "react";
import * as PropTypes from "prop-types";

export default class TypeVI extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type VI-Minus</h2>
            <p>Capable of manipulating the most elementary particles of matter (quarks and leptons) to create organized complexity among populations of elementary particles</p>
        </div>;
    }
}

TypeVI.propTypes = {tier: PropTypes.number};
