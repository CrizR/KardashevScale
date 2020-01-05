import React from 'react';
import logo from "./logo.svg";
import KGraph from "./KGraph";
import KardashevEquation from "./KardashevEquation";
import Link from "@material-ui/core/Link";

/**
 * @return {null}
 */
function CivTier(props) {
    const tier = parseFloat(props.tier.tier.toFixed(4));
    console.log(tier <= 1);
    console.log(tier <= 2);
    if (tier <= 0) {
        return <div className={'civStyle'}>
            <KardashevEquation/>
            <p>
                The Kardashev scale is a method of measuring a civilization's level of technological advancement based
                on
                the amount of energy they are able to use. The measure was proposed by Soviet astronomer Nikolai
                Kardashev
                in 1964. The above formula was proposed by Carl Sagan to allow for intermediate values between
                civilization types.
                Input a value in Megawatts (1 - 10^60) above to see the types of civilizations.
            </p>
        </div>
    } else if (tier >= .7 && tier <= .8) {
        return <div className={'civStyle'}>
            <h1>Type 0 Civilization - {tier}</h1>
            <h2>We are currently here!</h2>
            <h2>A civilization that harnesses the energy of its home planet, but not to its full potential just
                yet.</h2>
            <ul>
                <li>Relies on Fossil Fuels and is dependent on non-renewables</li>
                <li>Inefficiently utilizes resources</li>
            </ul>
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
            <h2>Planet Masters</h2>
            <p>
                The civilization of Type I is usually defined as one that can harness all the energy that falls on a
                planet from its parent star (for Earth–Sun system, this value is close to 1.74×1017 watts), which is
                about four orders of magnitude higher than the amount presently attained on Earth, with energy
                consumption at ≈2×1013 watts. The astronomer Guillermo A. Lemarchand stated this as a level near
                contemporary terrestrial civilization with an energy capability equivalent to the solar insolation on
                Earth, between 1016 and 1017 watts.[2]
            </p>
            <ul>
                <li>Relies almost entirely on renewable energy</li>
                <li>In balance with nature and likely has the capacity to manipulate weather, the environment, and
                    more.
                </li>
                <li>Nuclear Fusion and the usage of antimatter is a probability
                </li>
                <li>Likely has control over volcanoes, the weather, and even earthquakes.
                </li>
            </ul>
            <img src={'t1.png'} className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 3) {
        return <div className={'civStyle'}>
            <h1>Type II Civilization - {tier}</h1>
            <h2>Star Masters</h2>
            <p>
                A civilization capable of harnessing the energy radiated by its own star—for example, the stage of
                successful construction of a Dyson sphere—with energy consumption at ≈4×1033 erg/sec.[1] Lemarchand
                stated this as a civilization capable of using and channeling the entire radiation output of its star.
                The energy use would then be comparable to the luminosity of the Sun, about 4×1033 erg/sec (4×1026
                watts).[2]
            </p>
            <ul>
                <li>Travelling throughout the solar system at this stage is likely effortless</li>
                <li>A <Link href={'https://www.youtube.com/watch?v=pP44EPBMb8A&feature=emb_title'}>Dyson
                    Sphere</Link> may potentially be used to harness a star's energy
                </li>
                <li>May feed a stellar mass into a blackhole, and collect photons emitted by the accretion disc.
                </li>
                <li>Potential for Star lifting, a process of removing a substantial portion of a star's matter in a
                    controlled manner for other uses.
                </li>
                <li>"Mom can we go to Mars for our family vacation?"</li>
            </ul>
            <img src={'t2.png'} className="App-logo" alt="logo"/>
        </div>
    } else if (tier < 4) {
        return <div className={'civStyle'}>
            <h1>Type III Civilization - {tier}</h1>
            <h2>Galaxy Masters</h2>
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
                <li><Link href={'https://www.youtube.com/watch?v=mr7FXvTSYpA&feature=emb_title\n'}>Advanced
                    Civilizations</Link>
                </li>
            </ul>
            <img src={'t3.png'} className="App-logo" alt="logo"/>
        </div>
    } else if (tier < 5) {
        return <div className={'civStyle'}>
            <h1>Type IV Civilization - {tier}</h1>
            <h2>Masters of the Universe</h2>
            <p>A universal civilization, capable of harnessing the energy of the whole universe.</p>
            <ul>
                <li>Some form of teleportation or wormhole-esque space travel is a certainty</li>
                <li>War results in the destruction of galaxies</li>
                <li>Blackholes or Pulsars are a common energy source for a multitude of different tools</li>
                <li>Your understanding of life, death, relationships, and time are dramatically affected by time
                    dilation
                </li>
            </ul>
            <img src={'t4.png'} className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 6) {
        return <div className={'civStyle'}>
            <h1>Type V Civilization - {tier}</h1>
            <h2>Masters of the Multiverse</h2>
            <p>A multiverse culture, capable of harnessing the energy of multiple universes.</p>
            <ul>
                <li>If you are not already a god, you must have met him/her.</li>
            </ul>
            <img src={'t4.png'} className="App-logo" alt="logo"/>

        </div>
    } else if (tier < 7) {
        return <div className={'civStyle'}>
            <h1>Type VI Civilization - {tier}</h1>
            <h2>Masters of Space of Time</h2>
            <p>Exists outside of time and space, and is capable of creating universes and multiverses, and
                destroying them just as easily.</p>
            <ul>
                <li>You are a god.</li>
            </ul>
            <img src={'t4.png'} className="App-logo" alt="logo"/>

        </div>
    } else if (tier >= 7) {
        return <div className={'civStyle'}>
            <h1>Type VI Civilization - {tier}</h1>
            <h2>Masters of Space of Time</h2>
            <p>Exists outside of time and space, and is capable of creating universes and multiverses, and
                destroying them just as easily.</p>
            <ul>
                <li>You are a god.</li>
            </ul>
            <img src={'t4.png'} className="App-logo" alt="logo"/>
        </div>
    }

    return <div className={'civStyle'}>
        < KardashevEquation/>
        <p>
            The Kardashev scale is a method of measuring a civilization's level of technological advancement based on
            the amount of energy they are able to use. The measure was proposed by Soviet astronomer Nikolai Kardashev
            in 1964. Input a value in Megawatts (1 - 10^60) above to see the types of civilizations.
        </p>
    </div>

}

export default class Content extends React.Component {
    constructor(props) {
        super(props);
        this.tier = props;
    }

    render() {
        return <div>
            <CivTier tier={this.tier}/>
            <div style={{paddingBottom: '40px'}}>
                <Link href={'https://en.wikipedia.org/wiki/Kardashev_scale'}><strong>Source</strong></Link>
            </div>
        </div>
    }

}