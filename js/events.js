document.addEventListener("DOMContentLoaded", () => {
    var start = document.querySelector("#start");
    var log = document.querySelector("#log");

    if (!start || !log) {
        return;
    }

    start.addEventListener("click", () => {
        start.setAttribute("disabled", "disabled");

        var t = new Date().getTime();

        var backstage = Backstage([
            "https://picsum.photos/id/1/1600/1600?t=" + t,
            "https://picsum.photos/id/2/1600/1600?t=" + t,
            "https://picsum.photos/id/3/1600/1600?t=" + t,
            "https://picsum.photos/id/4/1600/1600?t=" + t,
            "https://picsum.photos/id/5/1600/1600?t=" + t,
            "https://picsum.photos/id/6/1600/1600?t=" + t,
            "https://picsum.photos/id/7/1600/1600?t=" + t,
            "https://picsum.photos/id/8/1600/1600?t=" + t,
            "https://picsum.photos/id/9/1600/1600?t=" + t,
            "https://picsum.photos/id/10/1600/1600?t=" + t,
            "https://picsum.photos/id/11/1600/1600?t=" + t,
            "https://picsum.photos/id/12/1600/1600?t=" + t,
            "https://picsum.photos/id/13/1600/1600?t=" + t,
            "https://picsum.photos/id/14/1600/1600?t=" + t,
            "https://picsum.photos/id/15/1600/1600?t=" + t,
            "https://picsum.photos/id/16/1600/1600?t=" + t,
        ]);

        backstage.on("progress", (e) => {
            log.value = log.value + "[PROGRESS] : " + JSON.stringify(e) + "\n";
        });

        backstage.on("file_complete", (e) => {
            log.value =
                log.value + "[FILE LOADED] : " + JSON.stringify(e) + "\n";
        });

        backstage.on("complete", (e) => {
            log.value = log.value + "[LOADED] : " + JSON.stringify(e) + "\n";
        });

        backstage.start();
    });
});
