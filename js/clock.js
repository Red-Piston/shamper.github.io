function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString("ru-RU", {
        timeZone: "Europe/Moscow",
        hour: "2-digit",
        minute: "2-digit"
    });

    document.getElementById("time").textContent = time;
    document.getElementById("timezone").textContent = "UTC+03";
}

setInterval(updateClock, 1000);
updateClock();