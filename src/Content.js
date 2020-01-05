import React from 'react';
import logo from "./logo.svg";
import {makeStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        margin: theme.spacing(4, 0, 2),
    },
}));

/**
 * @return {null}
 */
function CivTier(props) {
    const classes = useStyles;
    const tier = parseFloat(props.tier.tier.toFixed(4));
    console.log(tier <= 1);
    console.log(tier <= 2);
    if (tier <= 0) {
        return <div className={'civStyle'}>
            <img src={logo} className="App-logo" alt="logo"/>
        </div>
    } else if (tier < 1) {
        return <div className={'civStyle'}>
            <h1>Type 0 Civilization - {tier}</h1>
            <h2>A civilization that harnesses the energy of its home planet, but not to its full potential just
                yet.</h2>
            <ul>
                <li>Relies on Fossil Fuels and is dependent on non-renewables</li>
                <li>Inefficiently utilizes resources</li>
            </ul>
            <img src={logo} className="App-logo" alt="logo"/>
        </div>
    } else if (tier < 2) {
        return <div className={'civStyle'}>
            <h1>Type I Civilization - {tier}</h1>
            <h2>A civilization that is capable of harnessing the total energy of its home planet.</h2>
            <ul>
                <li>Relies almost entirely on renewable energy</li>
                <li>In balance with nature and likely has the capacity to manipulate weather, the environment, and
                    more.
                </li>
            </ul>
            <img src='t1.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 3) {
        return <div className={'civStyle'}>
            <h1>Type II Civilization - {tier}</h1>
            <h2>An interstellar civilization, capable of harnessing the total energy output of a star.</h2>
            <ul>
                <li>Travelling throughout the solar system at this stage is likely effortless</li>
                <li>A Dyson Sphere may potentially be used to harness a star's energy</li>
                <li>"Mom can we go to Mars for our family vacation?"</li>
            </ul>
            <img src='t2.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 4) {
        return <div className={'civStyle'}>
            <h1>Type III Civilization - {tier}</h1>
            <h2>A galactic civilization, capable of inhabiting and harnessing the energy of an entire galaxy.</h2>
            <ul>
                <li>The discovery of alien life at this point is highly likely</li>
                <li>Planetary and Solar System real estate is likely</li>
                <li>Space travel at light speed is a certainty</li>
                <li>Intergalactic war may be commonplace</li>
                <li>"Mom, how come my brother got a planet for his birthday, but not me?"</li>
            </ul>
            <img src='t3.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 5) {
        return <div className={'civStyle'}>
            <h1>Type IV Civilization - {tier}</h1>
            <h2>A universal civilization, capable of harnessing the energy of the whole universe.</h2>
            <ul>
                <li>Some form of teleportation or wormhole-esque space travel is a certainty</li>
                <li>War results in the destruction of galaxies</li>
                <li>Blackholes or Pulsars are a common energy source for a multitude of different tools</li>
                <li>Your understanding of life, death, relationships, and time are dramatically affected by time
                    dilation
                </li>
            </ul>
            <img src='t4.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 6) {
        return <div className={'civStyle'}>
            <h1>Type V Civilization - {tier}</h1>
            <h2>A multiverse culture, capable of harnessing the energy of multiple universes.</h2>
            <ul>
                <li>If you are not already a god, you must have met him/her.</li>
            </ul>
            <img src='t4.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 7) {
        return <div className={'civStyle'}>
            <h1>Type VI Civilization - {tier}</h1>
            <h2>Exists outside of time and space, and is capable of creating universes and multiverses, <br/> and
                destroying them just as easily.</h2>
            <ul>
                <li>You are a god.</li>
            </ul>
            <img src='t4.png' className="App-logo" alt="logo"/>

        </div>
    } else if (tier > 7) {
        return <div className={'civStyle'}>
            <h1>Type VI Civilization - {tier}</h1>
            <h2>Exists outside of time and space, and is capable of creating universes and multiverses, <br/> and
                destroying them just as easily.</h2>
            <ul>
                <li>You are a god.</li>
            </ul>
            <img src='t4.png' className="App-logo" alt="logo"/>
        </div>
    }

    return <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/e1f2c4790c04a5b34e487a948cc0e151cea09140"
                className="mwe-math-fallback-image-inline" aria-hidden="true"
                style={{height: '6ex'}} alt="K = \frac{\log_{10}P - 6} {10}">
    </img>
}

export default class Content extends React.Component {
    constructor(props) {
        super(props);
        this.tier = props;
    }

    render() {
        return <CivTier tier={this.tier}/>
    }

}