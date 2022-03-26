// Connect to HTML Elements
var searchAreaDiv = document.getElementById('search-area-div');
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var previousSearchesDiv = document.getElementById('previous-searches');
var cityResultsTodayDiv = document.getElementById('city-today-div');
var fiveDayForecastDiv = document.getElementById('five-day-forecast-div');
var previousSearchesUL = document.getElementById('previous-searches-UL');
var clearPreviousSearchesButton = document.getElementById('clear-previous-searches');
var cityTimeHeader = document.getElementById('city-time-header');
var currentTemp = document.getElementById('current-temp');
var currentWind = document.getElementById('current-wind');
var currentHumidity = document.getElementById('current-humidity');
var currentUV = document.getElementById('current-uv');


// global variables
var openWeatherAPIKey = 'a667932ac6ff632247e4626d841090bd';
var time = moment().format("hh:mm:ss");
var date = moment().format("dddd, DD MMMM YYYY");
var currentDay = moment().format("DD");
var currentMonthAndYear = moment().format("MM/YYYY");
var cityGeoData = {};
var previousSearchesListObject = {};
var city = '';

function subitFormHandler(event) {
    event.preventDefault();
    if (searchInput.value) {
        city = searchInput.value;
        getGeoCodingInfo(city);
        searchInput.textContent = '';

    } else {
        alert('Please enter a valid city');
    }
}

function getGeoCodingInfo(city) {
    // http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
    // http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}
    var apiURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + openWeatherAPIKey;

    fetch(apiURL)
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        storeCityData(data);
                        getCurrentWeather(cityGeoData)
                        getFiveDayForecast(cityGeoData)
                        displayPreviousSearches()

                    })
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        })
}


function storeCityData(data) {
    cityGeoData.lat = data[0].lat;
    cityGeoData.lon = data[0].lon;
    cityGeoData.name = data[0].name;
    previousSearchesListObject[city] = cityGeoData;
    localStorage.setItem('previousSearches', JSON.stringify(previousSearchesListObject));
}

// Current Weather ------------------------------------------------------------------------------------------------------------------
function getCurrentWeather(cityGeoData) {

    // https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid={API key}

    var apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityGeoData.lat + "&lon=" + cityGeoData.lon + "&appid=" + openWeatherAPIKey + "&exclude=hourly&exclude=minutely&exclude=alerts&units=metric";

    fetch(apiURL)
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        displayCurrentWeather(data);
                    })
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        })

    return;
}

function displayCurrentWeather(data) {
    console.log(data)
    // Current Weather
    cityTimeHeader.textContent = cityGeoData.name + ' : ' + date;
    currentTemp.textContent = 'Temp : ' + data.current.temp;
    currentWind.textContent = 'Wind : ' + data.current.wind_speed;
    currentHumidity.textContent = 'Humidity : ' + data.current.humidity;
    currentUV.textContent = 'UV Index : ' + data.current.uvi;

    // 5 day forecast
    for (var i = 0; i < 5; i++) {
        // Get Forecast Variables
        var forecastDay = parseInt(currentDay) + i;

        // Add each day card
        var thisCardDiv = document.createElement('div');
        thisCardDiv.setAttribute('style', 'card w-15');
        var thisCardDivHeader = document.createElement('h4');
        thisCardDivHeader.textContent = forecastDay + "/" + currentMonthAndYear;





        // Append Children
        thisCardDiv.appendChild(thisCardDivHeader);
        fiveDayForecastDiv.appendChild(thisCardDiv);



    }


}


// ----------------------------------------------------------------------------------------------------------------------------------

function getFiveDayForecast(geoCode) {
    return;
}

function displayPreviousSearches(previousSearchesString) {
    previousSearchesUL.innerHTML = '';
    if (JSON.parse(localStorage.getItem('previousSearches'))) {
        previousSearchesListObject = JSON.parse(localStorage.getItem('previousSearches'));
    }

    for (var i in previousSearchesListObject) {
        var thisListObjectLI = document.createElement('li');
        thisListObjectLI.textContent = i;
        thisListObjectLI.setAttribute('style', 'panel panel-default');
        previousSearchesUL.appendChild(thisListObjectLI)
    }

}

function clearSearches() {
    localStorage.clear();
    previousSearchesUL.innerHTML = '';
    location.reload();
}


function init() {
    // Add event handlers
    searchForm.addEventListener('submit', subitFormHandler);
    clearPreviousSearchesButton.addEventListener('click', clearSearches);

    if (localStorage.getItem('previousSearches')) {
        displayPreviousSearches();
    }
}

init();
