import {Context, Node} from "react-mathjax2";
import React from "react";

export default function Formula(props) {
    return (
        <Context>
            <Node inline>{props.tex}</Node>
        </Context>
    );
}