let lastUpdate = "Загрузка...";

fetch("https://api.github.com/repos/Red-Piston/shamper.github.io")
    .then(response => response.json())
    .then(data => {
        const date = new Date(data.pushed_at);

        if (isNaN(date.getTime())) {
            lastUpdate = "Не удалось получить дату обновления";
            return;
        }

        const formattedDate = date.toLocaleString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        lastUpdate = `Последнее обновление: ${formattedDate}`;

        updateLastUpdate();
    })
    .catch(() => {
        lastUpdate = "Не удалось получить дату обновления";
        updateLastUpdate();
    });

function updateLastUpdate() {
    const element = document.querySelector("#last-update");

    if (element) {
        element.textContent = lastUpdate;
    }
}