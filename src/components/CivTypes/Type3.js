import React, {Component} from "react";
import Link from "@material-ui/core/Link";
import * as PropTypes from "prop-types";

export default class Type3 extends Component {
    render() {
        return <div className={"civStyle"}>
            <h2>Type III Civilization - {this.props.tier}</h2>
            <h3>Galaxy Masters</h3>
            <p>
                A civilization in possession of energy at the scale of its own galaxy, with energy consumption at
                ≈4×1044 erg/sec.[1] Lemarchand stated this as a civilization with access to the power comparable to the
                luminosity of the entire Milky Way galaxy, about 4×1044 erg/sec (4×1037 watts).[2]
            </p>
            <ul>
                <li>Use and storage of energy from supermassive black holes</li>
                <li>Use and storage of energy from white holes</li>
                <li>Capture of energy from gamma-ray bursts</li>
                <li>Storage of quasar emissions</li>
                <li>The discovery of alien life at this point is highly likely</li>
                <li>Planetary and Solar System real estate is likely</li>
                <li>Space travel at light speed is a certainty</li>
                <li>Intergalactic war may be commonplace</li>
                <li>"Mom, how come my brother got a planet for his birthday, but not me?"</li>
                <li><Link href={"https://www.youtube.com/watch?v=mr7FXvTSYpA&feature=emb_title\n"}>Advanced
                    Civilizations</Link>
                </li>
            </ul>
            <img src={"t3.png"} className="App-logo" alt="logo"/>
        </div>;
    }
}

Type3.propTypes = {tier: PropTypes.number};