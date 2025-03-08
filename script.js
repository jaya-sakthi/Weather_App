const apiKey = 'fc3de41454cf886be623de9c0ee519ad';

let map = L.map('weather-visual').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let layers = {
    clouds: L.tileLayer(`https://{s}.tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`).addTo(map), // Default layer
    temperature: L.tileLayer(`https://{s}.tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`),
    precipitation: L.tileLayer(`https://{s}.tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`),
    wind: L.tileLayer(`https://{s}.tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`)
};

L.control.layers(null, layers).addTo(map);

function getWeather() {
    let city = document.getElementById('city').value;
    let lang = document.getElementById('language').value;
    if (!city) return;

    document.getElementById('loading').style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading').style.display = 'none';
        if (data.cod !== 200) {
            document.getElementById('weather-info').innerHTML = '<p>City not found.</p>';
            return;
        }
        document.getElementById('weather-info').innerHTML = `
            <h3>${data.name}</h3>
            <img class="weather-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp}°C (Feels Like: ${data.main.feels_like}°C)</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Pressure: ${data.main.pressure} hPa</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <p>Visibility: ${data.visibility / 1000} km</p>
            <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString(lang)}</p>
            <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString(lang)}</p>
        `;
        map.setView([data.coord.lat, data.coord.lon], 10);
        getForecast(city, lang);
    });
}

function getForecast(city, lang) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`)
    .then(response => response.json())
    .then(data => {
        let forecastHTML = '';
        data.list.forEach((item, index) => {
            if (index % 8 === 0) {
                forecastHTML += `
                    <div>
                        <h4>${item.dt_txt.split(' ')[0]}</h4>
                        <img class="weather-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather icon">
                        <p>${item.weather[0].description}</p>
                        <p>Temp: ${item.main.temp}°C</p>
                        <p>Humidity: ${item.main.humidity}%</p>
                    </div>
                `;
            }
        });
        document.getElementById('forecast-info').innerHTML = forecastHTML;
    });
}

function fetchWeatherAlerts() {
    let rssFeeds = [
        'https://news.google.com/rss/search?q=India+weather+alerts&hl=ta-IN&gl=IN&ceid=IN:ta',
        'https://news.google.com/rss/search?q=weather+alerts&hl=en',
    ];
    
    let alertsHTML = "";
    rssFeeds.forEach(feed => {
        fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(feed))
            .then(response => response.json())
            .then(data => {
                let parser = new DOMParser();
                let xml = parser.parseFromString(data.contents, "text/xml");
                let items = xml.querySelectorAll("item");
                items.forEach((item, index) => {
                    if (index < 5) {
                        let title = item.querySelector("title").textContent;
                        let link = item.querySelector("link").textContent;
                        alertsHTML += `<p><a href="${link}" target="_blank">${title}</a></p>`;
                    }
                });
                document.getElementById("weather-alerts-info").innerHTML = alertsHTML;
            });
    });
}

fetchWeatherAlerts();
