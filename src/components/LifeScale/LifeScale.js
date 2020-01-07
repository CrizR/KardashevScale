import React from "react";
import ReactPageScroller from 'react-page-scroller'

import "../../index.css";
import Type0 from "../CivTypes/Type0";
import Type5 from "../CivTypes/Type5";
import Type4 from "../CivTypes/Type4";
import Type3 from "../CivTypes/Type3";
import Type2 from "../CivTypes/Type2";
import Type1 from "../CivTypes/Type1";
import TypeO from "../MicroMaster/Type-O";
import TypeVI from "../MicroMaster/Type-VI";
import TypeV from "../MicroMaster/Type-V";
import TypeIV from "../MicroMaster/Type-IV";
import TypeIII from "../MicroMaster/Type-III";
import TypeII from "../MicroMaster/Type-II";
import TypeI from "../MicroMaster/Type-I";

import Link from "@material-ui/core/Link";
import Type6 from "../CivTypes/Type6";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

const planets = 'http://kardashev-calc.s3.amazonaws.com/star.mp4';
const multiverse = 'https://kardashev-calc.s3.amazonaws.com/multiverse.mp4';
const galaxy = 'http://kardashev-calc.s3.amazonaws.com/galaxy.mp4';
const galaxies = 'http://kardashev-calc.s3.amazonaws.com/galaxies.mp4';
const deep = 'http://kardashev-calc.s3.amazonaws.com/deep.mp4';
const earth = 'http://kardashev-calc.s3.amazonaws.com/earth.mp4';
const time = 'http://kardashev-calc.s3.amazonaws.com//time.mp4';
const skyline = 'http://kardashev-calc.s3.amazonaws.com/skylinep.mp4';
const star = 'http://kardashev-calc.s3.amazonaws.com/star.mp4';
const base = 'http://kardashev-calc.s3.amazonaws.com/base.mp4';


export default class LifeScale extends React.Component {


    constructor(props) {
        super(props);
        const localStoragePage = JSON.parse(localStorage.getItem('currentPage'));
        // this.state = {currentPage: localStoragePage === undefined ?  6 : localStoragePage.currentPage};
        this.state = {currentPage: 7};
    }

    handlePageChange = number => {
        // this.setState({currentPage: number}); // set currentPage number, to reset it from the previous selected.
        console.log(this.state.currentPage);
        localStorage.setItem('currentPage', JSON.stringify(this.state));

    };

    render() {
        return (
            <div style={{backgroundColor: 'black'}}>
                <React.Fragment>
                    <ReactPageScroller
                        pageOnChange={this.handlePageChange}
                        customPageNumber={this.state.currentPage}
                    >
                        <div className="component component-0">
                            <video src={time} autoPlay={true} muted={true} loop={true}/>
                            <Type6/>
                        </div>

                        <div className="component component-1">
                            <video src={multiverse} autoPlay={true} muted={true} loop={true}/>
                            <Type5/>
                        </div>


                        <div className="component component-2">
                            <video src={deep} autoPlay={true} muted={true} loop={true}/>
                            <Type4/>
                        </div>

                        <div className="component component-3">
                            <video src={galaxies} autoPlay={true} muted={true} loop={true}/>
                            <Type3/>
                        </div>

                        <div className="component component-4">
                            <video src={star} autoPlay={true} muted={true} loop={true}/>
                            <Type2/>
                        </div>

                        <div className="component component-5">
                            <video src={planets} autoPlay={true} muted={true} loop={true}/>
                            <Type1/>
                        </div>

                        <div className="component component-6">
                            <video src={earth} autoPlay={true} muted={true} loop={true}/>
                            <Type0/>
                        </div>

                        <div className="component component-7">
                            <video src={base} autoPlay={true} muted={true} loop={true}/>
                            <div style={{marginTop: '100px'}} className={"civStyle"}>
                                <ArrowUpwardIcon fontSize={'large'}/>
                                <h1>Kardashev Scale</h1>
                                <p>
                                    The Kardashev scale is a method of measuring a civilization's level of technological
                                    advancement
                                    based on the amount of energy they are able to use. The measure was
                                    proposed by Soviet astronomer Nikolai Kardashev in 1964. The above formula was
                                    proposed by Carl Sagan to allow for
                                    intermediate values between civilization types. Scroll up to see the different
                                    civilization levels or use the
                                    <Link style={{color: 'purple !important'}} href={'/calculator'}> calculator</Link>.
                                </p>
                            </div>

                            <div className={"civStyle"}>
                                <h1>Micro-Dimensional Mastery</h1>
                                <p>John D. Barrow, going by the fact that humans
                                    have found it more cost-effective to extend any abilities to manipulate their
                                    environment over increasingly smaller dimensions rather than increasingly larger
                                    ones,
                                    reverses the classification downward from Type I-minus to Type Omega-minus.
                                </p>
                                <p>
                                    According to this scale, humans, having wide expertise in various branches of
                                    chemistry and biology, have passed the stage of Type III-minus. Type IV-minus
                                    technologies (that have had practical and widespread applications) have been seen in
                                    areas like nanotechnology, semiconductors, materials science and genetic
                                    engineering,
                                    whereas Type V-minus has seen large scale application in the field and subfields of
                                    nuclear physics. Type VI-minus has had tentative research in the field of particle
                                    physics with particle colliders such as the Large Hadron Collider.
                                </p>
                                <div style={{padding: '50px', bottom: '0', position: "relative"}}>
                                    <Link
                                        href='https://en.wikipedia.org/wiki/Kardashev_scale'><strong>Source</strong></Link>
                                </div>
                                <ArrowDownwardIcon fontSize={'large'}/>
                            </div>

                        </div>


                        <div className="component component-8">
                            <video src={skyline} autoPlay={true} muted={true} loop={true}/>
                            <TypeI/>
                        </div>
                        <div className="component component-9">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeII/>
                        </div>
                        <div className="component component-10">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeIII/>
                        </div>
                        <div className="component component-11">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeIV/>
                        </div>
                        <div className="component 12">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeV/>
                        </div>
                        <div className="component component-13">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeVI/>
                        </div>
                        <div className="component component-14">
                            <video src={galaxy} autoPlay={true} muted={true} loop={true}/>
                            <TypeO/>
                        </div>

                    </ReactPageScroller>
                </React.Fragment>
            </div>
        );
    }
}