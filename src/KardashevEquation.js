import React from 'react';
import Formula from "./Formula";

export default function KardashevEquation() {
    const question = <Formula tex={`K = (log_10 W - 6) / 10`}/>;
    return (
        <div>
            {question}
        </div>
    );
}