const apiKey = "c09cdfe4b5a3dd692c4bd022d5e659c1";

async function initWeather() {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Smolensk,RU&units=metric&lang=ru&appid=${apiKey}`
    );

    const data = await response.json();

    const tempEl = document.getElementById("temperature");
    const locationEl = document.getElementById("location");
    const iconEl = document.getElementById("weather-icon");

    if (!tempEl || !locationEl || !iconEl) {
        console.log("weather elements not found");
        return;
    }

    document.getElementById("temperature").textContent =
        `${Math.round(data.main.temp)}°C`;

    document.getElementById("location").textContent =
        "Россия, Смоленск";

    document.getElementById("weather-icon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

initWeather();