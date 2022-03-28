// Connect to HTML Elements
var searchAreaDiv = document.getElementById('search-area-div');
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var previousSearchesDiv = document.getElementById('previous-searches');
var cityResultsTodayDiv = document.getElementById('city-today-div');
var fiveDayForecastDiv = document.getElementById('five-day-forecast-div');
var fiveDayHeaderDiv = document.getElementById('five-day-header-div');
var previousSearchesUL = document.getElementById('previous-searches-UL');
var clearPreviousSearchesButton = document.getElementById('clear-previous-searches');
var cityTimeHeader = document.getElementById('city-time-header');
var currentTemp = document.getElementById('current-temp');
var currentWind = document.getElementById('current-wind');
var currentHumidity = document.getElementById('current-humidity');
var currentUV = document.getElementById('current-uv');
var currentWeatherIconImg = document.getElementById("current-weather-icon-img");

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
        pageEmpty();
        city = searchInput.value;
        getGeoCodingInfo(city);
        searchInput.value = '';

    } else {
        alert('Please enter a valid city');
    }
}

function getGeoCodingInfo(city) {
    // http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}
    var apiURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + openWeatherAPIKey;

    fetch(apiURL)
        .then(function (response) {
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        storeCityData(data);
                        getCurrentWeather(cityGeoData)
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
}

function displayCurrentWeather(data) {
    console.log(data)

    // Current Weather
    cityTimeHeader.textContent = cityGeoData.name + ' : ' + date;

    var currentIconID = data.current.weather[0].icon;
    var currentIconURL = "https://openweathermap.org/img/wn/" + currentIconID + "@2x.png";
    currentWeatherIconImg.setAttribute("src", currentIconURL);
    currentWeatherIconImg.setAttribute("style", 'display: flex');

    currentTemp.textContent = 'Temp : ' + data.current.temp + " C";
    currentWind.textContent = 'Wind : ' + data.current.wind_speed + " m/s";
    currentHumidity.textContent = 'Humidity : ' + data.current.humidity + " %";
    currentUV.textContent = 'UV Index : ' + data.current.uvi;
    var UVSeverityClass = '';
    if (data.current.uvi < 3) {
        UVSeverityClass = 'btn btn-success';
    } else if (data.current.uvi <= 7) {
        UVSeverityClass = 'btn btn-warning';
    } else {
        UVSeverityClass = 'btn btn-danger';
    }
    currentUV.setAttribute('class', UVSeverityClass);

    // 5 day forecast
    var fiveDayHeader = document.createElement('h3');
    fiveDayHeader.textContent = "Five Day Forecast : ";
    fiveDayHeaderDiv.appendChild(fiveDayHeader);

    for (var i = 0; i < 5; i++) {
        // Get Forecast Variables
        var forecastDay = moment().add(i + 1, 'days').format('DD/MM/YYYY');
        var iconID = data.daily[i].weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";

        // Add each day card
        var thisCardDiv = document.createElement('div');
        thisCardDiv.setAttribute('class', 'card m-0');
        thisCardDiv.setAttribute('style', "width: 13rem;")
        var thisCardDivHeader = document.createElement('h4');
        thisCardDivHeader.textContent = forecastDay;
        var iconImg = document.createElement('img');
        iconImg.setAttribute('src', iconURL);
        iconImg.setAttribute('style', "width:50px;height:60px;");

        var thisCardText = document.createElement('div');
        thisCardText.innerHTML = "<p> Temp : " + data.daily[i].temp.day
            + " C </p> <p> Wind : " + data.daily[i].wind_speed
            + " m/s </p> <p> Humidity : " + data.daily[i].humidity
            + " % </p>";

        // Append Children
        thisCardDiv.appendChild(thisCardDivHeader);
        thisCardDiv.appendChild(iconImg);
        thisCardDiv.appendChild(thisCardText);
        fiveDayForecastDiv.appendChild(thisCardDiv);
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------

function displayPreviousSearches(previousSearchesString) {
    previousSearchesUL.innerHTML = '';
    if (JSON.parse(localStorage.getItem('previousSearches'))) {
        previousSearchesListObject = JSON.parse(localStorage.getItem('previousSearches'));
    }

    for (var i in previousSearchesListObject) {
        var thisListObjectLI = document.createElement('li');
        thisListObjectLI.textContent = i;
        thisListObjectLI.setAttribute('class', 'btn btn-secondary w-100 mb-1');
        previousSearchesUL.appendChild(thisListObjectLI)
    }
}

function getPreviousCity(event) {
    pageEmpty()
    city = event.target.textContent;
    getGeoCodingInfo(city);
    searchInput.value = '';

}

function clearSearches() {
    localStorage.clear();
    previousSearchesUL.innerHTML = '';
    location.reload();
}

function pageEmpty() {
    fiveDayHeaderDiv.innerHTML = '';
    fiveDayForecastDiv.innerHTML = '';
}

function init() {
    // Add event handlers
    searchForm.addEventListener('submit', subitFormHandler);
    previousSearchesUL.addEventListener('click', getPreviousCity);
    clearPreviousSearchesButton.addEventListener('click', clearSearches);


    // Get previous searches on launch
    if (localStorage.getItem('previousSearches')) {
        displayPreviousSearches();
    }

}

init();
