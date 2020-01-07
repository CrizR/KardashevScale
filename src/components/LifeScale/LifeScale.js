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
import planets from '../../videos/planets.mp4'
import multiverse from '../../videos/multiverse.mp4'
import galaxy from '../../videos/galaxy.mp4'
import galaxies from '../../videos/galaxies.mp4'
import deep from '../../videos/deep.mp4'
import earth from '../../videos/earth.mp4'
import time from '../../videos/time.mp4'
import skyline from '../../videos/skylinep.mp4'
import star from '../../videos/star.mp4'
import base from '../../videos/base.mp4'
import Link from "@material-ui/core/Link";
import Type6 from "../CivTypes/Type6";
import $ from 'jquery';


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
                            <div className={"civStyle"}>
                                <h1>Kardashev Scale</h1>
                                <p>
                                    The Kardashev scale is a method of measuring a civilization's level of technological
                                    advancement
                                    based on the amount of energy they are able to use. The measure was
                                    proposed by Soviet astronomer Nikolai Kardashev in 1964. The above formula was
                                    proposed by Carl Sagan to allow for
                                    intermediate values between civilization types. Scroll up to see the different
                                    civilization levels or use the
                                    <Link style={{ color: 'purple !important'}} href={'/calculator'}> calculator</Link>.
                                </p>

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
                                    <Link href='https://en.wikipedia.org/wiki/Kardashev_scale'><strong>Source</strong></Link>
                                </div>
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