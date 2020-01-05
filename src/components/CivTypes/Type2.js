import React, {Component} from "react";
import Link from "@material-ui/core/Link";
import * as PropTypes from "prop-types";

export default class Type2 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type II Civilization - {this.props.tier}</h2>
            <h3>Star Masters</h3>
            <p>
                A civilization capable of harnessing the energy radiated by its own star—for example, the stage of
                successful construction of a Dyson sphere—with energy consumption at ≈4×1033 erg/sec.[1] Lemarchand
                stated this as a civilization capable of using and channeling the entire radiation output of its star.
                The energy use would then be comparable to the luminosity of the Sun, about 4×1033 erg/sec (4×1026
                watts).
            </p>
            <ul>
                <li>Travelling throughout the solar system at this stage is likely effortless</li>
                <li>A <Link href={"https://www.youtube.com/watch?v=pP44EPBMb8A&feature=emb_title"}>Dyson
                    Sphere</Link> may potentially be used to harness a star's energy
                </li>
                <li>May feed a stellar mass into a blackhole, and collect photons emitted by the accretion disc.
                </li>
                <li>Potential for Star lifting, a process of removing a substantial portion of a star's matter in a
                    controlled manner for other uses.
                </li>
                <li>"Mom can we go to Mars for our family vacation?"</li>
            </ul>
            <img src={"t2.png"} className="App-logo" alt="logo"/>
        </div>;
    }
}

Type2.propTypes = {tier: PropTypes.number};