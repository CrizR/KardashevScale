import React, {Component} from "react";
import * as PropTypes from "prop-types";
import Link from "@material-ui/core/Link";

export default class Type1 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type I Civilization {this.props.showTier ? - this.props.tier : null}</h2>
            <h3>Planet Masters</h3>
            <p>
                The civilization of Type I is usually defined as one that can harness all the energy that falls on a
                planet from its parent star (for Earth–Sun system, this value is close to 1.74×1017 watts), which is
                about four orders of magnitude higher than the amount presently attained on Earth, with energy
                consumption at ≈2×1013 watts. The astronomer Guillermo A. Lemarchand stated this as a level near
                contemporary terrestrial civilization with an energy capability equivalent to the solar insolation on
                Earth, between 1016 and 1017 watts.
            </p>
            <ul>
                <li>Relies almost entirely on renewable energy</li>
                <li>In balance with nature and likely has the capacity to manipulate weather, natural disasters, the environment, and
                    more
                </li>
                <li>Nuclear fusion or the usage of antimatter is a probability
                </li>
                <li><Link href={"https://www.youtube.com/watch?v=HEpNiOM6lto"}>Becoming Type 1</Link></li>
            </ul>
        </div>;
    }
}

Type1.propTypes = {tier: PropTypes.number};