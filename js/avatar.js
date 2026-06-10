window.initAvatar = function () {
    const avatarWrapper = document.querySelector(".avatar-wrapper");

    if (!avatarWrapper) return;

    avatarWrapper.addEventListener("click", () => {
        avatarWrapper.classList.add("avatar-rotating");

        setTimeout(() => {
            avatarWrapper.classList.remove("avatar-rotating");
        }, 1000);
    });
};