import React, {Component} from "react";
import * as PropTypes from "prop-types";


export default class TypeI extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type I-Minus</h2>
            <p>Capable of manipulating objects over the scale of themselves: building structures, mining, joining and breaking solids</p>
        </div>;
    }
}

TypeI.propTypes = {tier: PropTypes.number};
