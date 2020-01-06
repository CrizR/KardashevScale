import {makeStyles} from "@material-ui/core";
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import React from "react";
import CalcContent from "./CalcContent";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(3),
            width: '80%',
        },
    },
    floatingLabelFocusStyle: {
        color: "white",
        fontSize: '14px'
    },
    multilineColor: {
        color: 'white',
        fontSize: '16px'
    }
}));


function NumberFormatCustom(props) {
    const {inputRef, onChange, ...other} = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values === null ? 0 : values.value,
                    },
                });
            }}
            isNumericString={false}
            prefix="10^"
            suffix=" W"
        />
    );
}

NumberFormatCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};


export default function Calculator(props) {

    const classes = useStyles();
    const [values, setValues] = React.useState({
        numberformat: '1',
    });

    const handleChange = name => event => {
        setValues({
            ...values,
            [name]: event.target.value,
        });
    };

    function RenderContent() {
        const krating = (Math.log10(10 ** values.numberformat) - 6) / 10;
        console.log(krating);
        return <CalcContent tier={krating}/>
    }

    return (
        <header className="App-header">
            <h2 style={{marginTop: '40px'}}>Kardashev Scale</h2>
            <form className={classes.root}>
                <TextField
                    color='secondary'
                    label="Energy Usage"
                    value={values.numberformat}
                    onChange={handleChange('numberformat')}
                    id="formatted-numberformat-input"
                    InputLabelProps={{
                        className: classes.floatingLabelFocusStyle,
                    }}
                    InputProps={{
                        inputComponent: NumberFormatCustom,
                        className: classes.multilineColor,
                    }}
                />
            </form>
            <RenderContent/>
        </header>
    )
}