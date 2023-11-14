/*!
  backstage.js v0.0.2
  https://github.com/sushat4692/backstage.js#readme
  Released under the MIT License.
*/
var Backstage = (function () {
    'use strict';

    var eventmit = function eventmit() {
      var set = new Set();
      return {
        on: function on(handler) {
          set.add(handler);
        },
        off: function off(handler) {
          set["delete"](handler);
        },
        offAll: function offAll() {
          set.clear();
        },
        emit: function emit(value) {
          set.forEach(function (handler) {
            return handler(value);
          });
        }
      };
    };

    var useLoaderEmitter = function () {
        var progress = eventmit();
        var error = eventmit();
        var complete = eventmit();
        var fileProgress = eventmit();
        var fileComplete = eventmit();
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

    return Backstage;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3N0YWdlLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZXZlbnRtaXQvbW9kdWxlL2V2ZW50bWl0LmpzIiwiLi4vc3JjL0xvYWRlci9FdmVudC50cyIsIi4uL3NyYy9Mb2FkZXIvRmlsZUxvYWRlci50cyIsIi4uL3NyYy9Mb2FkZXIvUGFyYWxsZWxMb2FkZXIudHMiLCIuLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiLi4vc3JjL0xvYWRlci9TZXJpYWxMb2FkZXIudHMiLCIuLi9zcmMvTG9hZGVyLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBldmVudG1pdCA9ICgpID0+IHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24oaGFuZGxlcikge1xuICAgICAgICAgICAgc2V0LmFkZChoYW5kbGVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgb2ZmKGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldC5kZWxldGUoaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZkFsbCgpIHtcbiAgICAgICAgICAgIHNldC5jbGVhcigpO1xuICAgICAgICB9LFxuICAgICAgICBlbWl0KHZhbHVlKSB7XG4gICAgICAgICAgICBzZXQuZm9yRWFjaCgoaGFuZGxlcikgPT4gaGFuZGxlcih2YWx1ZSkpO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRtaXQuanMubWFwIiwiaW1wb3J0IHsgZXZlbnRtaXQgfSBmcm9tIFwiZXZlbnRtaXRcIjtcbmltcG9ydCB7IEV2ZW50RW1pdFR5cGUsIEV2ZW50RW1pdEtleSB9IGZyb20gXCIuLi90eXBlXCI7XG5cbmV4cG9ydCBjb25zdCB1c2VMb2FkZXJFbWl0dGVyID0gPFxuICAgIFAgPSBudWxsLFxuICAgIEUgPSBudWxsLFxuICAgIEMgPSBudWxsLFxuICAgIEZQID0gbnVsbCxcbiAgICBGQyA9IG51bGxcbj4oKSA9PiB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBldmVudG1pdDxQPigpO1xuICAgIGNvbnN0IGVycm9yID0gZXZlbnRtaXQ8RT4oKTtcbiAgICBjb25zdCBjb21wbGV0ZSA9IGV2ZW50bWl0PEM+KCk7XG4gICAgY29uc3QgZmlsZVByb2dyZXNzID0gZXZlbnRtaXQ8RlA+KCk7XG4gICAgY29uc3QgZmlsZUNvbXBsZXRlID0gZXZlbnRtaXQ8RkM+KCk7XG5cbiAgICBjb25zdCBvbiA9ICh7IHR5cGUsIGVtaXR0ZXIgfTogRXZlbnRFbWl0S2V5PFAsIEUsIEMsIEZQLCBGQz4pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vbihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub24oZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9wcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5vbihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX2NvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9mZiA9ICh7IHR5cGUsIGVtaXR0ZXIgfTogRXZlbnRFbWl0S2V5PFAsIEUsIEMsIEZQLCBGQz4pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9wcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9jb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2ZmQWxsID0gKGtleTogRXZlbnRFbWl0VHlwZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3Mub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGNvbXBsZXRlLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZpbGVfcHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBmaWxlUHJvZ3Jlc3Mub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9jb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGNvbXBsZXRlLFxuICAgICAgICBmaWxlUHJvZ3Jlc3MsXG4gICAgICAgIGZpbGVDb21wbGV0ZSxcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHtcbiAgICBGaWxlTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICBGaWxlTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICBGaWxlTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbn0gZnJvbSBcIi4uL3R5cGVcIjtcbmltcG9ydCB7IHVzZUxvYWRlckVtaXR0ZXIgfSBmcm9tIFwiLi9FdmVudFwiO1xuXG5leHBvcnQgY29uc3QgRmlsZUxvYWRlciA9IChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIGxldCBjdXJyZW50ID0gMDtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICBsZXQgeGhyID0gbnVsbCBhcyBYTUxIdHRwUmVxdWVzdCB8IG51bGw7XG5cbiAgICAvLyBFdmVudCBFbWl0dGVyXG4gICAgY29uc3QgeyBwcm9ncmVzcywgZXJyb3IsIGNvbXBsZXRlLCBvbiwgb2ZmLCBvZmZBbGwgfSA9IHVzZUxvYWRlckVtaXR0ZXI8XG4gICAgICAgIEZpbGVMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxuICAgICAgICBGaWxlTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICAgICAgRmlsZUxvYWRlckVtaXRDb21wbGV0ZVR5cGVcbiAgICA+KCk7XG5cbiAgICBjb25zdCBzdGFydCA9ICgpID0+IHtcbiAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHhoci5vcGVuKFwiZ2V0XCIsIGZpbGUsIHRydWUpO1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XG5cbiAgICAgICAgeGhyLm9ubG9hZHN0YXJ0ID0gKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuXG4gICAgICAgICAgICByZWFkeSA9IHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gZS5sb2FkZWQ7XG5cbiAgICAgICAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCA9IGUudG90YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9ncmVzcy5lbWl0KHsgdG90YWwsIGN1cnJlbnQsIHBlcjogY3VycmVudCAvIHRvdGFsIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5vbnByb2dyZXNzID0gKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuXG4gICAgICAgICAgICBjdXJyZW50ID0gZS5sb2FkZWQ7XG5cbiAgICAgICAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCA9IGUudG90YWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb2dyZXNzLmVtaXQoeyB0b3RhbCwgY3VycmVudCwgcGVyOiBjdXJyZW50IC8gdG90YWwgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLm9ubG9hZCA9IChlKSA9PiB7XG4gICAgICAgICAgICBjb21wbGV0ZS5lbWl0KHsgdG90YWwsIGZpbGU6IHsgZmlsZSwgc2l6ZTogdG90YWwgfSB9KTtcbiAgICAgICAgICAgIGFib3J0KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICAgICAgZXJyb3IuZW1pdChuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkICR7ZmlsZX1gKSk7XG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5zZW5kKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGFib3J0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXhocikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgIHhociA9IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGFib3J0LFxuICAgIH07XG59O1xuZXhwb3J0IHR5cGUgRmlsZUxvYWRlclR5cGUgPSBSZXR1cm5UeXBlPHR5cGVvZiBGaWxlTG9hZGVyPjtcbiIsImltcG9ydCB7XG4gICAgTG9hZGVkRmlsZSxcbiAgICBQYXJhbGxlbExvYWRlckVtaXRDb21wbGV0ZVR5cGUsXG4gICAgUGFyYWxsZWxMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgIFBhcmFsbGVsTG9hZGVyRW1pdEZpbGVDb21wbGV0ZVR5cGUsXG4gICAgUGFyYWxsZWxMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxufSBmcm9tIFwiLi4vdHlwZVwiO1xuaW1wb3J0IHsgRmlsZUxvYWRlciwgRmlsZUxvYWRlclR5cGUgfSBmcm9tIFwiLi9GaWxlTG9hZGVyXCI7XG5pbXBvcnQgeyB1c2VMb2FkZXJFbWl0dGVyIH0gZnJvbSBcIi4vRXZlbnRcIjtcblxuZXhwb3J0IGNvbnN0IFBhcmFsbGVsTG9hZGVyID0gKGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IGZpbGVMZW5ndGggPSBmaWxlcy5sZW5ndGg7XG4gICAgbGV0IGxvYWRlZEZpbGVMZW5ndGggPSAwO1xuXG4gICAgLy8gRXZlbnQgRW1pdHRlclxuICAgIGNvbnN0IHsgcHJvZ3Jlc3MsIGVycm9yLCBjb21wbGV0ZSwgZmlsZUNvbXBsZXRlLCBvbiwgb2ZmLCBvZmZBbGwgfSA9XG4gICAgICAgIHVzZUxvYWRlckVtaXR0ZXI8XG4gICAgICAgICAgICBQYXJhbGxlbExvYWRlckVtaXRQcm9ncmVzc1R5cGUsXG4gICAgICAgICAgICBQYXJhbGxlbExvYWRlckVtaXRFcnJvclR5cGUsXG4gICAgICAgICAgICBQYXJhbGxlbExvYWRlckVtaXRDb21wbGV0ZVR5cGUsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUGFyYWxsZWxMb2FkZXJFbWl0RmlsZUNvbXBsZXRlVHlwZVxuICAgICAgICA+KCk7XG5cbiAgICBjb25zdCBsb2FkZXJzOiBGaWxlTG9hZGVyVHlwZVtdID0gW107XG4gICAgY29uc3QgZmlsZVJlc3VsdHM6IExvYWRlZEZpbGVbXSA9IFtdO1xuXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSBGaWxlTG9hZGVyKGZpbGUpO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcInByb2dyZXNzXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoXykgPT4ge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudDogbG9hZGVkRmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgcGVyOiBsb2FkZWRGaWxlTGVuZ3RoIC8gZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcImNvbXBsZXRlXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRlZEZpbGVMZW5ndGggKz0gMTtcbiAgICAgICAgICAgICAgICBmaWxlUmVzdWx0cy5wdXNoKGUuZmlsZSk7XG5cbiAgICAgICAgICAgICAgICBmaWxlQ29tcGxldGUuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBlLmZpbGUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkRmlsZUxlbmd0aCA+PSBmaWxlTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZmlsZVJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoZSkgPT4gZXJyb3IuZW1pdChlKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVycy5wdXNoKGxvYWRlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICBvZmZBbGwsXG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICBsb2FkZXJzLmZvckVhY2goKGxvYWRlcikgPT4gbG9hZGVyLnN0YXJ0KCkpO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY3JlYXRlQmluZGluZyhvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHtcbiAgICBMb2FkZWRGaWxlLFxuICAgIFNlcmlhbExvYWRlckVtaXRDb21wbGV0ZVR5cGUsXG4gICAgU2VyaWFsTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICBTZXJpYWxMb2FkZXJFbWl0RmlsZUNvbXBsZXRlVHlwZSxcbiAgICBTZXJpYWxMb2FkZXJFbWl0RmlsZVByb2dyZXNzVHlwZSxcbiAgICBTZXJpYWxMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxufSBmcm9tIFwiLi4vdHlwZVwiO1xuaW1wb3J0IHsgRmlsZUxvYWRlciwgRmlsZUxvYWRlclR5cGUgfSBmcm9tIFwiLi9GaWxlTG9hZGVyXCI7XG5pbXBvcnQgeyB1c2VMb2FkZXJFbWl0dGVyIH0gZnJvbSBcIi4vRXZlbnRcIjtcblxuZXhwb3J0IGNvbnN0IFNlcmlhbExvYWRlciA9IChmaWxlczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBmaWxlTGVuZ3RoID0gZmlsZXMubGVuZ3RoO1xuICAgIGxldCBsb2FkZWRGaWxlTGVuZ3RoID0gMDtcbiAgICBsZXQgY3VycmVudEluZGV4ID0gMDtcblxuICAgIC8vIEV2ZW50IEVtaXR0ZXJcbiAgICBjb25zdCB7XG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgY29tcGxldGUsXG4gICAgICAgIGZpbGVQcm9ncmVzcyxcbiAgICAgICAgZmlsZUNvbXBsZXRlLFxuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICBvZmZBbGwsXG4gICAgfSA9IHVzZUxvYWRlckVtaXR0ZXI8XG4gICAgICAgIFNlcmlhbExvYWRlckVtaXRQcm9ncmVzc1R5cGUsXG4gICAgICAgIFNlcmlhbExvYWRlckVtaXRFcnJvclR5cGUsXG4gICAgICAgIFNlcmlhbExvYWRlckVtaXRDb21wbGV0ZVR5cGUsXG4gICAgICAgIFNlcmlhbExvYWRlckVtaXRGaWxlUHJvZ3Jlc3NUeXBlLFxuICAgICAgICBTZXJpYWxMb2FkZXJFbWl0RmlsZUNvbXBsZXRlVHlwZVxuICAgID4oKTtcblxuICAgIGNvbnN0IGxvYWRlcnM6IEZpbGVMb2FkZXJUeXBlW10gPSBbXTtcbiAgICBjb25zdCBmaWxlUmVzdWx0czogTG9hZGVkRmlsZVtdID0gW107XG5cbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IEZpbGVMb2FkZXIoZmlsZSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwicHJvZ3Jlc3NcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZmlsZVByb2dyZXNzLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICAuLi5lLFxuICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBsb2FkZWRGaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBwZXI6IGxvYWRlZEZpbGVMZW5ndGggLyBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVyLm9uKHtcbiAgICAgICAgICAgIHR5cGU6IFwiY29tcGxldGVcIixcbiAgICAgICAgICAgIGVtaXR0ZXI6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZGVkRmlsZUxlbmd0aCArPSAxO1xuICAgICAgICAgICAgICAgIGZpbGVSZXN1bHRzLnB1c2goZS5maWxlKTtcblxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IGUuZmlsZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChsb2FkZWRGaWxlTGVuZ3RoID49IGZpbGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBmaWxlUmVzdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEluZGV4ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcnNbY3VycmVudEluZGV4XS5zdGFydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoZSkgPT4gZXJyb3IuZW1pdChlKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9hZGVycy5wdXNoKGxvYWRlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICBvZmZBbGwsXG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICBsb2FkZXJzW2N1cnJlbnRJbmRleF0uc3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IExvYWRlclR5cGUgfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBQYXJhbGxlbExvYWRlciB9IGZyb20gXCIuL0xvYWRlci9QYXJhbGxlbExvYWRlclwiO1xuaW1wb3J0IHsgU2VyaWFsTG9hZGVyIH0gZnJvbSBcIi4vTG9hZGVyL1NlcmlhbExvYWRlclwiO1xuXG5leHBvcnQgY29uc3QgTG9hZGVyID0gKHR5cGU6IExvYWRlclR5cGUsIGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwicGFyYWxsZWxcIjpcbiAgICAgICAgICAgIHJldHVybiBQYXJhbGxlbExvYWRlcihmaWxlcyk7XG4gICAgICAgIGNhc2UgXCJzZXJpYWxcIjpcbiAgICAgICAgICAgIHJldHVybiBTZXJpYWxMb2FkZXIoZmlsZXMpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc3QgX2V4aGF1c3RpdmVDaGVjazogbmV2ZXIgPSB0eXBlO1xuICAgICAgICAgICAgcmV0dXJuIF9leGhhdXN0aXZlQ2hlY2s7XG4gICAgfVxufTtcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL0xvYWRlclwiO1xuaW1wb3J0IHsgTG9hZGVyVHlwZSB9IGZyb20gXCIuL3R5cGVcIjtcblxuZXhwb3J0IGNvbnN0IEJhY2tzdGFnZSA9ICh0eXBlOiBMb2FkZXJUeXBlLCBmaWxlczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBsb2FkZXIgPSBMb2FkZXIodHlwZSwgZmlsZXMpO1xuICAgIHJldHVybiBsb2FkZXI7XG59O1xuIl0sIm5hbWVzIjpbImV2ZW50bWl0Iiwic2V0IiwiU2V0Iiwib24iLCJoYW5kbGVyIiwiYWRkIiwib2ZmIiwib2ZmQWxsIiwiY2xlYXIiLCJlbWl0IiwidmFsdWUiLCJmb3JFYWNoIiwiX19hc3NpZ24iLCJPYmplY3QiLCJhc3NpZ24iLCJ0IiwicyIsImkiLCJuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImFwcGx5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQXFCTyxJQUFNQSxRQUFRLEdBQTRCLFNBQXBDQSxRQUFRQSxHQUFvQztJQUNyRCxFQUFBLElBQU1DLEdBQUcsR0FBRyxJQUFJQyxHQUFHLEVBQXNCLENBQUE7TUFDekMsT0FBTztRQUNIQyxFQUFFLEVBQUEsU0FBQUEsR0FBQ0MsT0FBMkIsRUFBQTtJQUMxQkgsTUFBQUEsR0FBRyxDQUFDSSxHQUFHLENBQUNELE9BQU8sQ0FBQyxDQUFBO1NBQ25CO1FBQ0RFLEdBQUcsRUFBQSxTQUFBQSxJQUFDRixPQUEyQixFQUFBO1VBQzNCSCxHQUFHLENBQUEsUUFBQSxDQUFPLENBQUNHLE9BQU8sQ0FBQyxDQUFBO1NB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
