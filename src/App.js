import React from 'react';
import './App.css';
import mp3_file from './music/music.mp3';
import Content from "./Content";
import TextField from "@material-ui/core/TextField";
import {makeStyles} from "@material-ui/core";
import NumberFormat from "react-number-format";
import PropTypes from "prop-types";
import Formula from "./components/Formula";
import {Text} from "react-mathjax2";

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(3),
            width: '300px',
        },
    },
    floatingLabelFocusStyle: {
        color: "white",
        fontSize: '18px'
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
            thousandSeparator
            isNumericString={false}
            suffix=" MW"
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
        numberformat: '1',
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
        const krating = (Math.log10(values.numberformat * 1000000) - 6) / 10;
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
            </header>
        </div>
    );
}

export default App;
