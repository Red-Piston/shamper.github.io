    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff00fb";
        ctx.font = `${fontSize}px Manrope`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];

            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (
                drops[i] * fontSize > canvas.height &&
                Math.random() > 0.975
            ) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(draw, 33);

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });