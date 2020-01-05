import React from 'react';
import './App.css';
import mp3_file from './music/music.mp3';
import Content from "./Content";
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
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
                        value: values.value,
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


function App() {

    const classes = useStyles();
    const [values, setValues] = React.useState({
        numberformat: '0',
    });

    const handleChange = name => event => {
        setValues({
            ...values,
            [name]: event.target.value,
        });


    };

    /**
     * @return {number}
     */

    function RenderContent() {
        const krating = (Math.log10(10**values.numberformat) - 6) / 10;
        console.log(krating);
        return <Content tier={krating}/>
    }

    return (
        <div className="App">
            <audio style={{display: 'none'}} src={mp3_file} controls loop autoPlay/>
            <header className="App-header">
                <h4>Kardashev Scale</h4>
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
                <div style={{paddingBottom: '40px', bottom: '0'}}>
                    <Link href={'https://en.wikipedia.org/wiki/Kardashev_scale'}><strong>Source</strong></Link>
                </div>
            </header>
        </div>
    );
}

export default App;
