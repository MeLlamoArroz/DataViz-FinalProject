import React, { useState, useEffect } from "react";

import logo from './logo.png';
import './App.css';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const SimpleSelect = () => {
  const classes = useStyles();
  const [directorId, setDirectorId] = React.useState('1');

  const handleChange = (event) => {
    window.updateSunburst(event.target.value);
    
    const sunburstD3 = document.querySelectorAll(".sunburst-d3")[0];
    const bars = document.querySelectorAll("#bars")[0];

    if (document.querySelectorAll(".App .sunburst-d3").length === 0){
      document.getElementsByClassName("App")[0].appendChild(sunburstD3);
      document.getElementsByClassName("App")[0].appendChild(bars);
    }

    setDirectorId(event.target.value);
  };

  return (
    <FormControl className={classes.formControl} style={{
      position: "absolute",
      top: "28vmin",
      left: "15vmin"
    }}>
      <InputLabel id="demo-simple-select-label">Directors</InputLabel>
      <Select
        id="simple-select"
        value={directorId}
        onChange={handleChange}
      >
        <MenuItem value={1}>Damien Chazelle</MenuItem>
        <MenuItem value={2}>Hayao Miyazaki</MenuItem>
        <MenuItem value={3}>Isao Takahata</MenuItem>
        <MenuItem value={4}>Sergei Bondarchuk</MenuItem>
      </Select>
    </FormControl>
  );
}


const App = () => {
  useEffect(
    () => {
      const sunburstD3 = document.querySelectorAll(".sunburst-d3")[0];
      const bars = document.querySelectorAll("#bars")[0];
      document.getElementsByClassName("App")[0].appendChild(sunburstD3);
      document.getElementsByClassName("App")[0].appendChild(bars);
    },
    []
  );

  return (
    <div className="App">
      <div className="App-logo-container">
        <img src={logo} className="App-logo"/>
      </div>
      <SimpleSelect/>
      <p className="selected-scenes">
        Selected Scenes
      </p>
    </div>
  );
}

export default App;