        const cursor = document.getElementById("cursor");

        let mouseX = 0;
        let mouseY = 0;

        let currentX = 0;
        let currentY = 0;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animate() {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;

            cursor.style.left = currentX + "px";
            cursor.style.top = currentY + "px";

            requestAnimationFrame(animate);
        }

        animate();
        
        document.addEventListener("mouseover", (e) => {
            if (
                e.target.closest(
                    "a, button, .card, input, .tab, .avatar-wrapper, .social-bttn, .dash"
                )
            ) {
                cursor.classList.add("hover");
            }
        });

        document.addEventListener("mouseout", (e) => {
            if (
                e.target.closest(
                    "a, button, .card, input, .tab, .avatar-wrapper, .social-bttn, .dash"
                )
            ) {
                cursor.classList.remove("hover");
            }
        });

        document.addEventListener("mouseleave", () => {
            cursor.classList.add("hidden");
        });

        document.addEventListener("mouseenter", () => {
            cursor.classList.remove("hidden");
        });

        // document.addEventListener("mousedown", () => {
        //     cursor.classList.add("active");
        // });

        // document.addEventListener("mouseup", () => {
        //     cursor.classList.remove("active");
        // });