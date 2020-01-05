import * as recharts from "recharts";
import React from 'react';


const data = [
    {
        "value": 60,
        "name": "Type VI",
        "fill": "#8884d8"
    },
    {
        "value": 50,
        "name": "Type V",
        "fill": "#83a6ed"
    },
    {
        "value": 40,
        "name": "Type IV",
        "fill": "#8dd1e1"
    },
    {
        "value": 30,
        "name": "Type III",
        "fill": "#82ca9d"
    },
    {
        "value": 20,
        "name": "Type II",
        "fill": "#a4de6c"
    },
    {
        "value": 10,
        "name": "Type I",
        "fill": "#a4de6c"
    },
    {
        "value": 1,
        "name": "Type 0",
        "fill": "#a4de6c"
    }
]


export default function KGraph(props) {

    const {ResponsiveContainer, FunnelChart, Tooltip, Funnel, LabelList} = recharts;


    return (
            <FunnelChart width={730} height={250}>
                <Tooltip/>
                <Funnel
                    dataKey="value"
                    data={data}
                    isAnimationActive
                >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name"/>
                </Funnel>
            </FunnelChart>
    )

}