document.addEventListener("DOMContentLoaded", () => {
    var serial = document.querySelector("#serial");
    var parallel = document.querySelector("#parallel");
    var log = document.querySelector("#log");

    if (!serial || !parallel || !log) {
        return;
    }

    serial.addEventListener("click", () => {
        startLoading("serial");
    });

    parallel.addEventListener("click", () => {
        startLoading("parallel");
    });

    const clearLog = () => {
        log.value = "";
    };

    const startLoading = (type) => {
        clearLog();
        serial.setAttribute("disabled", "disabled");
        parallel.setAttribute("disabled", "disabled");

        var backstage = Backstage(type, [
            getRandomImage(1),
            getRandomImage(2),
            getRandomImage(3),
            getRandomImage(4),
            getRandomImage(5),
            getRandomImage(6),
            getRandomImage(7),
            getRandomImage(8),
            getRandomImage(9),
            getRandomImage(1),
            getRandomImage(1),
            getRandomImage(1),
            getRandomImage(1),
            getRandomImage(1),
            getRandomImage(1),
            getRandomImage(1),
        ]);

        backstage.on({
            type: "progress",
            emitter: (e) => {
                log.value =
                    log.value + "[PROGRESS] : " + JSON.stringify(e) + "\n";
            },
        });

        backstage.on({
            type: "file_progress",
            emitter: (e) => {
                log.value =
                    log.value + "[FILE PROGRESS] : " + JSON.stringify(e) + "\n";
            },
        });

        backstage.on({
            type: "file_complete",
            emitter: (e) => {
                log.value =
                    log.value + "[FILE LOADED] : " + JSON.stringify(e) + "\n";
            },
        });

        backstage.on({
            type: "complete",
            emitter: (e) => {
                log.value =
                    log.value + "[LOADED] : " + JSON.stringify(e) + "\n";

                serial.removeAttribute("disabled");
                parallel.removeAttribute("disabled");
            },
        });

        backstage.start();
    };
});
