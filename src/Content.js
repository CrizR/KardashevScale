import React, {Component} from 'react';
import KardashevEquation from "./components/KardashevEquation";
import Link from "@material-ui/core/Link";
import Type0 from "./components/CivTypes/Type0";
import Type1 from "./components/CivTypes/Type1";
import Type2 from "./components/CivTypes/Type2";
import Type3 from "./components/CivTypes/Type3";
import Type4 from "./components/CivTypes/Type4";
import Type5 from "./components/CivTypes/Type5";
import Type6 from "./components/CivTypes/Type6";


class BaseContent extends Component {
    render() {
        return <div className={"civStyle"}>
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
        </div>;
    }
}

/**
 * @return {null}
 */
function CivTier(props) {
    const tier = parseFloat(props.tier.tier.toFixed(4));
    console.log(tier <= 1);
    console.log(tier <= 2);
    if (tier <= 0) {
        return <BaseContent/>
    } else if (tier < 1) {
        return <Type0 tier={tier}/>
    }  else if (tier < 2) {
        return <Type1 tier={tier}/>
    } else if (tier < 3) {
        return <Type2 tier={tier}/>
    } else if (tier < 4) {
        return <Type3 tier={tier}/>
    } else if (tier < 5) {
        return <Type4 tier={tier}/>
    } else if (tier < 6) {
        return <Type5 tier={tier}/>
    } else if (tier >= 6) {
        return <Type6 tier={tier}/>;
    }

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