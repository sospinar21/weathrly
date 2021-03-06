import Background from './Background';
import Search from './Search';
import CurrentWeather from './CurrentWeather';
import './styles/App.css';
import React, { Component } from 'react';
import dataCleaner from './dataCleaner';
import Welcome from './Welcome';
import APIKey from './APIKey.js';


class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      location: '',
      welcome: true,
      locationWeather: {},
      error: false
    };

    this.changeWelcomeState = this.changeWelcomeState.bind(this);
    this.setLocationState = this.setLocationState.bind(this);
    this.sendToStorage = this.sendToStorage.bind(this);
  }
 
  setLocationState (selectedLocation) {
    this.setState({
      location: selectedLocation
    });
    this.makeAPICall(selectedLocation);
    setTimeout(this.changeWelcomeState, 750);
    setTimeout(this.sendToStorage, 1000);
  } 

  sendToStorage () {
    let stringifiedLocation = JSON.stringify(
      this.state.locationWeather.currentWeather.currentLocation
    );

    localStorage.setItem(1, stringifiedLocation);
  }

  changeWelcomeState () {
    this.setState({
      welcome: false,
      error: false
    });
  }

  makeAPICall (selectedLocation) {
    fetch(`http://api.wunderground.com/api/${APIKey}/conditions/hourly/forecast10day/geolookup/q/${selectedLocation}.json`)
      .then((response) => {
        response.json()
          .then((weatherData) => {
            this.setState({
              locationWeather: dataCleaner(weatherData)
            });
          }).catch(error => { 
            this.catchError();
          });
      });
  }

  catchError () {
    this.setState({
      welcome: true,
      error: true,
      location: '',
      locationWeather: {}
    });
  }
  
  componentDidMount () {
    if (localStorage.getItem(1)) {
      this.changeWelcomeState();
      let storedLocation = localStorage.getItem(1);
      let parsedLocation = JSON.parse(storedLocation);

      this.makeAPICall(parsedLocation);
    }
  }

  render () {
    if (this.state.error && this.state.welcome) {
      return (
        <div>
          <div className ='error'> X Please Enter a Valid Location </div>
          <Welcome
            changeWelcomeState = {this.changeWelcomeState}
            setLocationState = {this.setLocationState} 
          />
        </div>
      );
    }

    if (this.state.welcome) {
      return (<Welcome 
        setLocationState = {this.setLocationState}
      />);
    } else {
      return (
        <div className ='App'>
          <Background />
          <Search 
            location = {this.state.locationWeather.currentWeather.currentLocation}
            setLocationState = {this.setLocationState}
            date = {this.state.locationWeather.currentWeather.currentDate}
          />
          <CurrentWeather locationWeather = {this.state.locationWeather} />
        </div>
      );
    }
  }
}

export default App;