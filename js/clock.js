function updateBirthdayCountdown() {
    const timerContainer = document.getElementById("bdayCountdown");
    if (!timerContainer) return;

    const timerEl = document.getElementById("bdayTimer");
    const titleEl = timerContainer.querySelector(".bday-title");

    const now = new Date();

    // Moscow is UTC+3 (no daylight saving, fixed UTC+3)
    const moscowOffsetMs = 3 * 60 * 60 * 1000;
    const nowMoscow = new Date(now.getTime() + moscowOffsetMs);

    const moscowYear = nowMoscow.getUTCFullYear();
    const moscowMonth = nowMoscow.getUTCMonth(); // 0-indexed, 8 is September
    const moscowDate = nowMoscow.getUTCDate();

    // Check if today is September 20 in Moscow timezone
    if (moscowMonth === 8 && moscowDate === 20) {
        if (titleEl) titleEl.textContent = "🎉 Сегодня мой день рождения! 🎉";
        if (timerEl) {
            timerEl.innerHTML = '<span class="bday-celebration">🎂 С др меня! Исполнилось 17 годиков! 🎈</span>';
        }
        return;
    }

    // Target year: if past Sept 20 in Moscow, target next year
    let targetYear = moscowYear;
    if (moscowMonth > 8 || (moscowMonth === 8 && moscowDate > 20)) {
        targetYear = moscowYear + 1;
    }

    // Target: September 20 00:00:00 Moscow time (which is Sept 19 21:00:00 UTC)
    const targetUtcTimestamp = Date.UTC(targetYear, 8, 20, 0, 0, 0) - moscowOffsetMs;
    const diff = targetUtcTimestamp - now.getTime();

    if (diff <= 0) {
        if (titleEl) titleEl.textContent = "🎉 Сегодня мой день рождения! 🎉";
        if (timerEl) {
            timerEl.innerHTML = '<span class="bday-celebration">🎂 С др меня! Исполнилось 17 годиков! 🎈</span>';
        }
        return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const daysEl = document.getElementById("bdayDays");
    const hoursEl = document.getElementById("bdayHours");
    const minsEl = document.getElementById("bdayMinutes");
    const secsEl = document.getElementById("bdaySeconds");

    if (daysEl && hoursEl && minsEl && secsEl) {
        daysEl.textContent = days;
        hoursEl.textContent = String(hours).padStart(2, "0");
        minsEl.textContent = String(mins).padStart(2, "0");
        secsEl.textContent = String(secs).padStart(2, "0");
    } else if (timerEl) {
        timerEl.innerHTML = `
            <span class="bday-segment"><span id="bdayDays">${days}</span><span class="bday-unit">д</span></span>
            <span class="bday-sep">:</span>
            <span class="bday-segment"><span id="bdayHours">${String(hours).padStart(2, "0")}</span><span class="bday-unit">ч</span></span>
            <span class="bday-sep">:</span>
            <span class="bday-segment"><span id="bdayMinutes">${String(mins).padStart(2, "0")}</span><span class="bday-unit">м</span></span>
            <span class="bday-sep">:</span>
            <span class="bday-segment"><span id="bdaySeconds">${String(secs).padStart(2, "0")}</span><span class="bday-unit">с</span></span>
        `;
    }
}

function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString("ru-RU", {
        timeZone: "Europe/Moscow",
        hour: "2-digit",
        minute: "2-digit"
    });

    const timeEl = document.getElementById("time");
    if (timeEl) timeEl.textContent = time;

    const tzEl = document.getElementById("timezone");
    if (tzEl) tzEl.textContent = "UTC+03";

    updateBirthdayCountdown();
}

setInterval(updateClock, 1000);
updateClock();

window.updateBirthdayCountdown = updateBirthdayCountdown;
window.updateClock = updateClock;