document.addEventListener("DOMContentLoaded", () => {
    var loading = document.querySelector("#loading");
    var gage = document.querySelector("#gage");

    if (!loading || !gage) {
        return;
    }

    var backstage = Backstage([
        "https://picsum.photos/id/1/500/500",
        "https://picsum.photos/id/2/500/500",
        "https://picsum.photos/id/3/500/500",
        "https://picsum.photos/id/4/500/500",
        "https://picsum.photos/id/5/500/500",
        "https://picsum.photos/id/6/500/500",
        "https://picsum.photos/id/7/500/500",
        "https://picsum.photos/id/8/500/500",
    ]);

    backstage.on({
        key: "progress",
        handler: (e) => {
            console.log(e);
            gage.style.width = e.per * 100 + "%";
        },
    });

    backstage.on({
        key: "complete",
        handler: () => {
            console.log("Finished");
            loading.classList.add("is-loaded");
        },
    });

    backstage.start();
});
