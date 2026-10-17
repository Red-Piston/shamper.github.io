const projectsMap = new Map();

async function loadProjects() {
    const files = ["my-site.yml", "termos-messenger.yml", "bubblemc.yml", "gdps-spherium.yml", "shampurradio.yml", "youtube.yml", "previews.yml", "cuboid-teleport.yml", "isveryfun.yml", "dontstay.yml", "easyfreezy.yml"];

    const results = await Promise.all(
        files.map(async (f) => {
            const res = await fetch("data/projects/" + f, { cache: "no-cache" });
            const text = await res.text();
            return jsyaml.load(text);
        })
    );

    results.forEach(p => projectsMap.set(p.id, p));
}

// 👇 ВАЖНО
window.loadProjects = loadProjects;
window.projectsMap = projectsMap;