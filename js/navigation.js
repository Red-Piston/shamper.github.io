const windowEl = document.getElementById("window");
const tabs = document.querySelectorAll(".tab");

let contentDoc = null;

// загружаем HTML один раз
fetch("content.html")
    .then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        contentDoc = parser.parseFromString(html, "text/html");

        navigate("about"); // стартовая вкладка
    });

function render(tab) {
    const section = contentDoc.getElementById(tab);

    if (!section) return;

    // fade out
    windowEl.classList.add("hide");

    setTimeout(() => {
        windowEl.innerHTML = section.innerHTML;

        // fade in
        windowEl.classList.remove("hide");
    }, 200);

    // const avatarWrapper = document.querySelector(".avatar-wrapper");

    // if (avatarWrapper) {
    //     avatarWrapper.addEventListener("click", () => {
    //         avatarWrapper.classList.add("avatar-rotating");

    //         setTimeout(() => {
    //             avatarWrapper.classList.remove("avatar-rotating");
    //         }, 1000);
    //     });
    // }

    // initAvatar();
    updateLastUpdate();

    if (tab === "about") {
        // initClock();
        initWeather();
    }
}

function navigate(tab) {
    render(tab);

    tabs.forEach(t => {
        t.classList.toggle("active", t.dataset.tab === tab);
    });

    history.replaceState({}, "", `?tab=${tab}`);
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        navigate(tab.dataset.tab);
    });
});

document.addEventListener("click", (e) => {
    const avatar = e.target.closest(".avatar-wrapper");

    if (!avatar) return;

    avatar.classList.add("avatar-rotating");

    setTimeout(() => {
        avatar.classList.remove("avatar-rotating");
    }, 1000);
});