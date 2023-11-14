/*!
  backstage.js v0.0.2
  https://github.com/sushat4692/backstage.js#readme
  Released under the MIT License.
*/
'use strict';

var eventmit = require('eventmit');

var useLoaderEmitter = function () {
    var progress = eventmit.eventmit();
    var error = eventmit.eventmit();
    var complete = eventmit.eventmit();
    var fileProgress = eventmit.eventmit();
    var fileComplete = eventmit.eventmit();
    var on = function (_a) {
        var type = _a.type, emitter = _a.emitter;
        switch (type) {
            case "progress":
                progress.on(emitter);
                break;
            case "error":
                error.on(emitter);
                break;
            case "complete":
                complete.on(emitter);
                break;
            case "file_progress":
                fileProgress.on(emitter);
                break;
            case "file_complete":
                fileComplete.on(emitter);
                break;
        }
    };
    var off = function (_a) {
        var type = _a.type, emitter = _a.emitter;
        switch (type) {
            case "progress":
                progress.off(emitter);
                break;
            case "error":
                error.off(emitter);
                break;
            case "complete":
                complete.off(emitter);
                break;
            case "file_progress":
                fileProgress.off(emitter);
                break;
            case "file_complete":
                fileComplete.off(emitter);
                break;
        }
    };
    var offAll = function (key) {
        switch (key) {
            case "progress":
                progress.offAll();
                break;
            case "error":
                error.offAll();
                break;
            case "complete":
                complete.offAll();
                break;
            case "file_progress":
                fileProgress.offAll();
                break;
            case "file_complete":
                fileComplete.offAll();
                break;
        }
    };
    return {
        progress: progress,
        error: error,
        complete: complete,
        fileProgress: fileProgress,
        fileComplete: fileComplete,
        on: on,
        off: off,
        offAll: offAll,
    };
};

var FileLoader = function (file) {
    var total = 0;
    var current = 0;
    var xhr = null;
    // Event Emitter
    var _a = useLoaderEmitter(), progress = _a.progress, error = _a.error, complete = _a.complete, on = _a.on, off = _a.off, offAll = _a.offAll;
    var start = function () {
        xhr = new XMLHttpRequest();
        xhr.open("get", file, true);
        xhr.responseType = "blob";
        xhr.onloadstart = function (e) {
            console.log(e);
            current = e.loaded;
            if (e.lengthComputable) {
                total = e.total;
            }
            progress.emit({ total: total, current: current, per: current / total });
        };
        xhr.onprogress = function (e) {
            console.log(e);
            current = e.loaded;
            if (e.lengthComputable) {
                total = e.total;
            }
            progress.emit({ total: total, current: current, per: current / total });
        };
        xhr.onload = function (e) {
            complete.emit({ total: total, file: { file: file, size: total } });
            abort();
        };
        xhr.onerror = function (e) {
            error.emit(new Error("Failed to load ".concat(file)));
            abort();
        };
        xhr.send();
    };
    var abort = function () {
        if (!xhr) {
            return;
        }
        xhr.abort();
        xhr = null;
    };
    return {
        on: on,
        off: off,
        offAll: offAll,
        start: start,
        abort: abort,
    };
};

var ParallelLoader = function (files) {
    var fileLength = files.length;
    var loadedFileLength = 0;
    // Event Emitter
    var _a = useLoaderEmitter(), progress = _a.progress, error = _a.error, complete = _a.complete, fileComplete = _a.fileComplete, on = _a.on, off = _a.off, offAll = _a.offAll;
    var loaders = [];
    var fileResults = [];
    files.forEach(function (file) {
        var loader = FileLoader(file);
        loader.on({
            type: "progress",
            emitter: function (_) {
                progress.emit({
                    total: fileLength,
                    current: loadedFileLength,
                    per: loadedFileLength / fileLength,
                });
            },
        });
        loader.on({
            type: "complete",
            emitter: function (e) {
                loadedFileLength += 1;
                fileResults.push(e.file);
                fileComplete.emit({
                    total: fileLength,
                    file: e.file,
                });
                if (loadedFileLength >= fileLength) {
                    complete.emit({
                        total: fileLength,
                        files: fileResults,
                    });
                }
            },
        });
        loader.on({
            type: "error",
            emitter: function (e) { return error.emit(e); },
        });
        loaders.push(loader);
    });
    return {
        on: on,
        off: off,
        offAll: offAll,
        start: function () {
            loaders.forEach(function (loader) { return loader.start(); });
        },
    };
};

var _assign = function __assign() {
  _assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return _assign.apply(this, arguments);
};

var SerialLoader = function (files) {
    var fileLength = files.length;
    var loadedFileLength = 0;
    var currentIndex = 0;
    // Event Emitter
    var _a = useLoaderEmitter(), progress = _a.progress, error = _a.error, complete = _a.complete, fileProgress = _a.fileProgress, fileComplete = _a.fileComplete, on = _a.on, off = _a.off, offAll = _a.offAll;
    var loaders = [];
    var fileResults = [];
    files.forEach(function (file) {
        var loader = FileLoader(file);
        loader.on({
            type: "progress",
            emitter: function (e) {
                fileProgress.emit(_assign(_assign({}, e), { file: file }));
                progress.emit({
                    total: fileLength,
                    current: loadedFileLength,
                    per: loadedFileLength / fileLength,
                });
            },
        });
        loader.on({
            type: "complete",
            emitter: function (e) {
                loadedFileLength += 1;
                fileResults.push(e.file);
                fileComplete.emit({
                    total: fileLength,
                    file: e.file,
                });
                if (loadedFileLength >= fileLength) {
                    complete.emit({
                        total: fileLength,
                        files: fileResults,
                    });
                }
                else {
                    currentIndex += 1;
                    loaders[currentIndex].start();
                }
            },
        });
        loader.on({
            type: "error",
            emitter: function (e) { return error.emit(e); },
        });
        loaders.push(loader);
    });
    return {
        on: on,
        off: off,
        offAll: offAll,
        start: function () {
            loaders[currentIndex].start();
        },
    };
};

var Loader = function (type, files) {
    switch (type) {
        case "parallel":
            return ParallelLoader(files);
        case "serial":
            return SerialLoader(files);
        default:
            var _exhaustiveCheck = type;
            return _exhaustiveCheck;
    }
};

var Backstage = function (type, files) {
    var loader = Loader(type, files);
    return loader;
};

exports.Backstage = Backstage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Mb2FkZXIvRXZlbnQudHMiLCIuLi8uLi9zcmMvTG9hZGVyL0ZpbGVMb2FkZXIudHMiLCIuLi8uLi9zcmMvTG9hZGVyL1BhcmFsbGVsTG9hZGVyLnRzIiwiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uLy4uL3NyYy9Mb2FkZXIvU2VyaWFsTG9hZGVyLnRzIiwiLi4vLi4vc3JjL0xvYWRlci50cyIsIi4uLy4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBldmVudG1pdCB9IGZyb20gXCJldmVudG1pdFwiO1xuaW1wb3J0IHsgRXZlbnRFbWl0VHlwZSwgRXZlbnRFbWl0S2V5IH0gZnJvbSBcIi4uL3R5cGVcIjtcblxuZXhwb3J0IGNvbnN0IHVzZUxvYWRlckVtaXR0ZXIgPSA8XG4gICAgUCA9IG51bGwsXG4gICAgRSA9IG51bGwsXG4gICAgQyA9IG51bGwsXG4gICAgRlAgPSBudWxsLFxuICAgIEZDID0gbnVsbFxuPigpID0+IHtcbiAgICBjb25zdCBwcm9ncmVzcyA9IGV2ZW50bWl0PFA+KCk7XG4gICAgY29uc3QgZXJyb3IgPSBldmVudG1pdDxFPigpO1xuICAgIGNvbnN0IGNvbXBsZXRlID0gZXZlbnRtaXQ8Qz4oKTtcbiAgICBjb25zdCBmaWxlUHJvZ3Jlc3MgPSBldmVudG1pdDxGUD4oKTtcbiAgICBjb25zdCBmaWxlQ29tcGxldGUgPSBldmVudG1pdDxGQz4oKTtcblxuICAgIGNvbnN0IG9uID0gKHsgdHlwZSwgZW1pdHRlciB9OiBFdmVudEVtaXRLZXk8UCwgRSwgQywgRlAsIEZDPikgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJwcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIHByb2dyZXNzLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgZXJyb3Iub24oZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vbihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX3Byb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgZmlsZVByb2dyZXNzLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZpbGVfY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBmaWxlQ29tcGxldGUub24oZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2ZmID0gKHsgdHlwZSwgZW1pdHRlciB9OiBFdmVudEVtaXRLZXk8UCwgRSwgQywgRlAsIEZDPikgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJwcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIHByb2dyZXNzLm9mZihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9mZihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGNvbXBsZXRlLm9mZihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX3Byb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgZmlsZVByb2dyZXNzLm9mZihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX2NvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLm9mZihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvZmZBbGwgPSAoa2V5OiBFdmVudEVtaXRUeXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9wcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX2NvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgY29tcGxldGUsXG4gICAgICAgIGZpbGVQcm9ncmVzcyxcbiAgICAgICAgZmlsZUNvbXBsZXRlLFxuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICBvZmZBbGwsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQge1xuICAgIEZpbGVMb2FkZXJFbWl0Q29tcGxldGVUeXBlLFxuICAgIEZpbGVMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgIEZpbGVMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxufSBmcm9tIFwiLi4vdHlwZVwiO1xuaW1wb3J0IHsgdXNlTG9hZGVyRW1pdHRlciB9IGZyb20gXCIuL0V2ZW50XCI7XG5cbmV4cG9ydCBjb25zdCBGaWxlTG9hZGVyID0gKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGxldCB0b3RhbCA9IDA7XG4gICAgbGV0IGN1cnJlbnQgPSAwO1xuICAgIGxldCByZWFkeSA9IGZhbHNlO1xuICAgIGxldCB4aHIgPSBudWxsIGFzIFhNTEh0dHBSZXF1ZXN0IHwgbnVsbDtcblxuICAgIC8vIEV2ZW50IEVtaXR0ZXJcbiAgICBjb25zdCB7IHByb2dyZXNzLCBlcnJvciwgY29tcGxldGUsIG9uLCBvZmYsIG9mZkFsbCB9ID0gdXNlTG9hZGVyRW1pdHRlcjxcbiAgICAgICAgRmlsZUxvYWRlckVtaXRQcm9ncmVzc1R5cGUsXG4gICAgICAgIEZpbGVMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgICAgICBGaWxlTG9hZGVyRW1pdENvbXBsZXRlVHlwZVxuICAgID4oKTtcblxuICAgIGNvbnN0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgeGhyLm9wZW4oXCJnZXRcIiwgZmlsZSwgdHJ1ZSk7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcblxuICAgICAgICB4aHIub25sb2Fkc3RhcnQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG5cbiAgICAgICAgICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBlLmxvYWRlZDtcblxuICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHRvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2dyZXNzLmVtaXQoeyB0b3RhbCwgY3VycmVudCwgcGVyOiBjdXJyZW50IC8gdG90YWwgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLm9ucHJvZ3Jlc3MgPSAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG5cbiAgICAgICAgICAgIGN1cnJlbnQgPSBlLmxvYWRlZDtcblxuICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHRvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvZ3Jlc3MuZW1pdCh7IHRvdGFsLCBjdXJyZW50LCBwZXI6IGN1cnJlbnQgLyB0b3RhbCB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgIGNvbXBsZXRlLmVtaXQoeyB0b3RhbCwgZmlsZTogeyBmaWxlLCBzaXplOiB0b3RhbCB9IH0pO1xuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgICAgICBlcnJvci5lbWl0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgJHtmaWxlfWApKTtcbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgIGlmICgheGhyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgeGhyID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgYWJvcnQsXG4gICAgfTtcbn07XG5leHBvcnQgdHlwZSBGaWxlTG9hZGVyVHlwZSA9IFJldHVyblR5cGU8dHlwZW9mIEZpbGVMb2FkZXI+O1xuIiwiaW1wb3J0IHtcbiAgICBMb2FkZWRGaWxlLFxuICAgIFBhcmFsbGVsTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICBQYXJhbGxlbExvYWRlckVtaXRFcnJvclR5cGUsXG4gICAgUGFyYWxsZWxMb2FkZXJFbWl0RmlsZUNvbXBsZXRlVHlwZSxcbiAgICBQYXJhbGxlbExvYWRlckVtaXRQcm9ncmVzc1R5cGUsXG59IGZyb20gXCIuLi90eXBlXCI7XG5pbXBvcnQgeyBGaWxlTG9hZGVyLCBGaWxlTG9hZGVyVHlwZSB9IGZyb20gXCIuL0ZpbGVMb2FkZXJcIjtcbmltcG9ydCB7IHVzZUxvYWRlckVtaXR0ZXIgfSBmcm9tIFwiLi9FdmVudFwiO1xuXG5leHBvcnQgY29uc3QgUGFyYWxsZWxMb2FkZXIgPSAoZmlsZXM6IHN0cmluZ1tdKSA9PiB7XG4gICAgY29uc3QgZmlsZUxlbmd0aCA9IGZpbGVzLmxlbmd0aDtcbiAgICBsZXQgbG9hZGVkRmlsZUxlbmd0aCA9IDA7XG5cbiAgICAvLyBFdmVudCBFbWl0dGVyXG4gICAgY29uc3QgeyBwcm9ncmVzcywgZXJyb3IsIGNvbXBsZXRlLCBmaWxlQ29tcGxldGUsIG9uLCBvZmYsIG9mZkFsbCB9ID1cbiAgICAgICAgdXNlTG9hZGVyRW1pdHRlcjxcbiAgICAgICAgICAgIFBhcmFsbGVsTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbiAgICAgICAgICAgIFBhcmFsbGVsTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICAgICAgICAgIFBhcmFsbGVsTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBQYXJhbGxlbExvYWRlckVtaXRGaWxlQ29tcGxldGVUeXBlXG4gICAgICAgID4oKTtcblxuICAgIGNvbnN0IGxvYWRlcnM6IEZpbGVMb2FkZXJUeXBlW10gPSBbXTtcbiAgICBjb25zdCBmaWxlUmVzdWx0czogTG9hZGVkRmlsZVtdID0gW107XG5cbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IEZpbGVMb2FkZXIoZmlsZSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwicHJvZ3Jlc3NcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChfKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBsb2FkZWRGaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBwZXI6IGxvYWRlZEZpbGVMZW5ndGggLyBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiY29tcGxldGVcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZGVkRmlsZUxlbmd0aCArPSAxO1xuICAgICAgICAgICAgICAgIGZpbGVSZXN1bHRzLnB1c2goZS5maWxlKTtcblxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IGUuZmlsZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChsb2FkZWRGaWxlTGVuZ3RoID49IGZpbGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBmaWxlUmVzdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChlKSA9PiBlcnJvci5lbWl0KGUpLFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXJzLnB1c2gobG9hZGVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgc3RhcnQ6ICgpID0+IHtcbiAgICAgICAgICAgIGxvYWRlcnMuZm9yRWFjaCgobG9hZGVyKSA9PiBsb2FkZXIuc3RhcnQoKSk7XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jcmVhdGVCaW5kaW5nKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIHJlc3VsdFtrXSA9IG1vZFtrXTtcclxuICAgIHJlc3VsdC5kZWZhdWx0ID0gbW9kO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByaXZhdGVNYXAuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHByaXZhdGVNYXAsIHZhbHVlKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gc2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZU1hcC5zZXQocmVjZWl2ZXIsIHZhbHVlKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG4iLCJpbXBvcnQge1xuICAgIExvYWRlZEZpbGUsXG4gICAgU2VyaWFsTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICBTZXJpYWxMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgIFNlcmlhbExvYWRlckVtaXRGaWxlQ29tcGxldGVUeXBlLFxuICAgIFNlcmlhbExvYWRlckVtaXRGaWxlUHJvZ3Jlc3NUeXBlLFxuICAgIFNlcmlhbExvYWRlckVtaXRQcm9ncmVzc1R5cGUsXG59IGZyb20gXCIuLi90eXBlXCI7XG5pbXBvcnQgeyBGaWxlTG9hZGVyLCBGaWxlTG9hZGVyVHlwZSB9IGZyb20gXCIuL0ZpbGVMb2FkZXJcIjtcbmltcG9ydCB7IHVzZUxvYWRlckVtaXR0ZXIgfSBmcm9tIFwiLi9FdmVudFwiO1xuXG5leHBvcnQgY29uc3QgU2VyaWFsTG9hZGVyID0gKGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IGZpbGVMZW5ndGggPSBmaWxlcy5sZW5ndGg7XG4gICAgbGV0IGxvYWRlZEZpbGVMZW5ndGggPSAwO1xuICAgIGxldCBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgLy8gRXZlbnQgRW1pdHRlclxuICAgIGNvbnN0IHtcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBjb21wbGV0ZSxcbiAgICAgICAgZmlsZVByb2dyZXNzLFxuICAgICAgICBmaWxlQ29tcGxldGUsXG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICB9ID0gdXNlTG9hZGVyRW1pdHRlcjxcbiAgICAgICAgU2VyaWFsTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbiAgICAgICAgU2VyaWFsTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICAgICAgU2VyaWFsTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICAgICAgU2VyaWFsTG9hZGVyRW1pdEZpbGVQcm9ncmVzc1R5cGUsXG4gICAgICAgIFNlcmlhbExvYWRlckVtaXRGaWxlQ29tcGxldGVUeXBlXG4gICAgPigpO1xuXG4gICAgY29uc3QgbG9hZGVyczogRmlsZUxvYWRlclR5cGVbXSA9IFtdO1xuICAgIGNvbnN0IGZpbGVSZXN1bHRzOiBMb2FkZWRGaWxlW10gPSBbXTtcblxuICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gRmlsZUxvYWRlcihmaWxlKTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJwcm9ncmVzc1wiLFxuICAgICAgICAgICAgZW1pdHRlcjogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBmaWxlUHJvZ3Jlc3MuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgIC4uLmUsXG4gICAgICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGxvYWRlZEZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHBlcjogbG9hZGVkRmlsZUxlbmd0aCAvIGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJjb21wbGV0ZVwiLFxuICAgICAgICAgICAgZW1pdHRlcjogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkZWRGaWxlTGVuZ3RoICs9IDE7XG4gICAgICAgICAgICAgICAgZmlsZVJlc3VsdHMucHVzaChlLmZpbGUpO1xuXG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogZS5maWxlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZEZpbGVMZW5ndGggPj0gZmlsZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVSZXN1bHRzLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyc1tjdXJyZW50SW5kZXhdLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChlKSA9PiBlcnJvci5lbWl0KGUpLFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXJzLnB1c2gobG9hZGVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgc3RhcnQ6ICgpID0+IHtcbiAgICAgICAgICAgIGxvYWRlcnNbY3VycmVudEluZGV4XS5zdGFydCgpO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgTG9hZGVyVHlwZSB9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IFBhcmFsbGVsTG9hZGVyIH0gZnJvbSBcIi4vTG9hZGVyL1BhcmFsbGVsTG9hZGVyXCI7XG5pbXBvcnQgeyBTZXJpYWxMb2FkZXIgfSBmcm9tIFwiLi9Mb2FkZXIvU2VyaWFsTG9hZGVyXCI7XG5cbmV4cG9ydCBjb25zdCBMb2FkZXIgPSAodHlwZTogTG9hZGVyVHlwZSwgZmlsZXM6IHN0cmluZ1tdKSA9PiB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJwYXJhbGxlbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFBhcmFsbGVsTG9hZGVyKGZpbGVzKTtcbiAgICAgICAgY2FzZSBcInNlcmlhbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFNlcmlhbExvYWRlcihmaWxlcyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zdCBfZXhoYXVzdGl2ZUNoZWNrOiBuZXZlciA9IHR5cGU7XG4gICAgICAgICAgICByZXR1cm4gX2V4aGF1c3RpdmVDaGVjaztcbiAgICB9XG59O1xuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vTG9hZGVyXCI7XG5pbXBvcnQgeyBMb2FkZXJUeXBlIH0gZnJvbSBcIi4vdHlwZVwiO1xuXG5leHBvcnQgY29uc3QgQmFja3N0YWdlID0gKHR5cGU6IExvYWRlclR5cGUsIGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IGxvYWRlciA9IExvYWRlcih0eXBlLCBmaWxlcyk7XG4gICAgcmV0dXJuIGxvYWRlcjtcbn07XG4iXSwibmFtZXMiOlsiZXZlbnRtaXQiLCJfX2Fzc2lnbiIsIk9iamVjdCIsImFzc2lnbiIsInQiLCJzIiwiaSIsIm4iLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJwIiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiYXBwbHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUdPLElBQU0sZ0JBQWdCLEdBQUcsWUFBQTtBQU81QixJQUFBLElBQU0sUUFBUSxHQUFHQSxpQkFBUSxFQUFLLENBQUM7QUFDL0IsSUFBQSxJQUFNLEtBQUssR0FBR0EsaUJBQVEsRUFBSyxDQUFDO0FBQzVCLElBQUEsSUFBTSxRQUFRLEdBQUdBLGlCQUFRLEVBQUssQ0FBQztBQUMvQixJQUFBLElBQU0sWUFBWSxHQUFHQSxpQkFBUSxFQUFNLENBQUM7QUFDcEMsSUFBQSxJQUFNLFlBQVksR0FBR0EsaUJBQVEsRUFBTSxDQUFDO0lBRXBDLElBQU0sRUFBRSxHQUFHLFVBQUMsRUFBZ0QsRUFBQTtZQUE5QyxJQUFJLEdBQUEsRUFBQSxDQUFBLElBQUEsRUFBRSxPQUFPLEdBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUN2QixRQUFBLFFBQVEsSUFBSTtBQUNSLFlBQUEsS0FBSyxVQUFVO0FBQ1gsZ0JBQUEsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsTUFBTTtBQUNWLFlBQUEsS0FBSyxPQUFPO0FBQ1IsZ0JBQUEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEIsTUFBTTtBQUNWLFlBQUEsS0FBSyxVQUFVO0FBQ1gsZ0JBQUEsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsTUFBTTtBQUNWLFlBQUEsS0FBSyxlQUFlO0FBQ2hCLGdCQUFBLFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU07QUFDVixZQUFBLEtBQUssZUFBZTtBQUNoQixnQkFBQSxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QixNQUFNO0FBQ2IsU0FBQTtBQUNMLEtBQUMsQ0FBQztJQUVGLElBQU0sR0FBRyxHQUFHLFVBQUMs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
