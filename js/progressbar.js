document.addEventListener("DOMContentLoaded", () => {
    var loading = document.querySelector("#loading");
    var gage = document.querySelector("#gage");

    if (!loading || !gage) {
        return;
    }

    var backstage = Backstage("parallel", [
        "https://picsum.photos/id/1/1600/1600",
        "https://picsum.photos/id/2/1600/1600",
        "https://picsum.photos/id/3/1600/1600",
        "https://picsum.photos/id/4/1600/1600",
        "https://picsum.photos/id/5/1600/1600",
        "https://picsum.photos/id/6/1600/1600",
        "https://picsum.photos/id/7/1600/1600",
        "https://picsum.photos/id/8/1600/1600",
        "https://picsum.photos/id/9/1600/1600",
        "https://picsum.photos/id/10/1600/1600",
        "https://picsum.photos/id/11/1600/1600",
        "https://picsum.photos/id/12/1600/1600",
        "https://picsum.photos/id/13/1600/1600",
        "https://picsum.photos/id/14/1600/1600",
        "https://picsum.photos/id/15/1600/1600",
        "https://picsum.photos/id/16/1600/1600",
    ]);

    backstage.on({
        type: "progress",
        emitter: (e) => {
            console.log(e);
            gage.style.width = e.per * 100 + "%";
        },
    });

    backstage.on({
        type: "file_complete",
        emitter: (e) => {
            console.log(e);
        },
    });

    backstage.on({
        type: "complete",
        emitter: (e) => {
            console.log(e);
            loading.classList.add("is-loaded");
        },
    });

    backstage.start();
});
