/*!
  backstage.js v0.0.3
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
                current = e.loaded;
                if (e.lengthComputable) {
                    total = e.total;
                }
                progress.emit({ total: total, current: current, per: current / total });
            };
            xhr.onprogress = function (e) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3N0YWdlLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZXZlbnRtaXQvbW9kdWxlL2V2ZW50bWl0LmpzIiwiLi4vc3JjL0xvYWRlci9FdmVudC50cyIsIi4uL3NyYy9Mb2FkZXIvRmlsZUxvYWRlci50cyIsIi4uL3NyYy9Mb2FkZXIvUGFyYWxsZWxMb2FkZXIudHMiLCIuLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiLi4vc3JjL0xvYWRlci9TZXJpYWxMb2FkZXIudHMiLCIuLi9zcmMvTG9hZGVyLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBldmVudG1pdCA9ICgpID0+IHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24oaGFuZGxlcikge1xuICAgICAgICAgICAgc2V0LmFkZChoYW5kbGVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgb2ZmKGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldC5kZWxldGUoaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZkFsbCgpIHtcbiAgICAgICAgICAgIHNldC5jbGVhcigpO1xuICAgICAgICB9LFxuICAgICAgICBlbWl0KHZhbHVlKSB7XG4gICAgICAgICAgICBzZXQuZm9yRWFjaCgoaGFuZGxlcikgPT4gaGFuZGxlcih2YWx1ZSkpO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRtaXQuanMubWFwIiwiaW1wb3J0IHsgZXZlbnRtaXQgfSBmcm9tIFwiZXZlbnRtaXRcIjtcbmltcG9ydCB7IEV2ZW50RW1pdFR5cGUsIEV2ZW50RW1pdEtleSB9IGZyb20gXCIuLi90eXBlXCI7XG5cbmV4cG9ydCBjb25zdCB1c2VMb2FkZXJFbWl0dGVyID0gPFxuICAgIFAgPSBudWxsLFxuICAgIEUgPSBudWxsLFxuICAgIEMgPSBudWxsLFxuICAgIEZQID0gbnVsbCxcbiAgICBGQyA9IG51bGxcbj4oKSA9PiB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBldmVudG1pdDxQPigpO1xuICAgIGNvbnN0IGVycm9yID0gZXZlbnRtaXQ8RT4oKTtcbiAgICBjb25zdCBjb21wbGV0ZSA9IGV2ZW50bWl0PEM+KCk7XG4gICAgY29uc3QgZmlsZVByb2dyZXNzID0gZXZlbnRtaXQ8RlA+KCk7XG4gICAgY29uc3QgZmlsZUNvbXBsZXRlID0gZXZlbnRtaXQ8RkM+KCk7XG5cbiAgICBjb25zdCBvbiA9ICh7IHR5cGUsIGVtaXR0ZXIgfTogRXZlbnRFbWl0S2V5PFAsIEUsIEMsIEZQLCBGQz4pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vbihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub24oZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9wcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5vbihlbWl0dGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX2NvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLm9uKGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9mZiA9ICh7IHR5cGUsIGVtaXR0ZXIgfTogRXZlbnRFbWl0S2V5PFAsIEUsIEMsIEZQLCBGQz4pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9wcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9jb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5vZmYoZW1pdHRlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2ZmQWxsID0gKGtleTogRXZlbnRFbWl0VHlwZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3Mub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGNvbXBsZXRlLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZpbGVfcHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBmaWxlUHJvZ3Jlc3Mub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9jb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGZpbGVDb21wbGV0ZS5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGNvbXBsZXRlLFxuICAgICAgICBmaWxlUHJvZ3Jlc3MsXG4gICAgICAgIGZpbGVDb21wbGV0ZSxcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHtcbiAgICBGaWxlTG9hZGVyRW1pdENvbXBsZXRlVHlwZSxcbiAgICBGaWxlTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICBGaWxlTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbn0gZnJvbSBcIi4uL3R5cGVcIjtcbmltcG9ydCB7IHVzZUxvYWRlckVtaXR0ZXIgfSBmcm9tIFwiLi9FdmVudFwiO1xuXG5leHBvcnQgY29uc3QgRmlsZUxvYWRlciA9IChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIGxldCBjdXJyZW50ID0gMDtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICBsZXQgeGhyID0gbnVsbCBhcyBYTUxIdHRwUmVxdWVzdCB8IG51bGw7XG5cbiAgICAvLyBFdmVudCBFbWl0dGVyXG4gICAgY29uc3QgeyBwcm9ncmVzcywgZXJyb3IsIGNvbXBsZXRlLCBvbiwgb2ZmLCBvZmZBbGwgfSA9IHVzZUxvYWRlckVtaXR0ZXI8XG4gICAgICAgIEZpbGVMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxuICAgICAgICBGaWxlTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICAgICAgRmlsZUxvYWRlckVtaXRDb21wbGV0ZVR5cGVcbiAgICA+KCk7XG5cbiAgICBjb25zdCBzdGFydCA9ICgpID0+IHtcbiAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHhoci5vcGVuKFwiZ2V0XCIsIGZpbGUsIHRydWUpO1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XG5cbiAgICAgICAgeGhyLm9ubG9hZHN0YXJ0ID0gKGUpID0+IHtcbiAgICAgICAgICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBlLmxvYWRlZDtcblxuICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICAgIHRvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2dyZXNzLmVtaXQoeyB0b3RhbCwgY3VycmVudCwgcGVyOiBjdXJyZW50IC8gdG90YWwgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgeGhyLm9ucHJvZ3Jlc3MgPSAoZSkgPT4ge1xuICAgICAgICAgICAgY3VycmVudCA9IGUubG9hZGVkO1xuXG4gICAgICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgdG90YWwgPSBlLnRvdGFsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9ncmVzcy5lbWl0KHsgdG90YWwsIGN1cnJlbnQsIHBlcjogY3VycmVudCAvIHRvdGFsIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgY29tcGxldGUuZW1pdCh7IHRvdGFsLCBmaWxlOiB7IGZpbGUsIHNpemU6IHRvdGFsIH0gfSk7XG4gICAgICAgICAgICBhYm9ydCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgICAgICAgIGVycm9yLmVtaXQobmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCAke2ZpbGV9YCkpO1xuICAgICAgICAgICAgYWJvcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4aHIuc2VuZCgpO1xuICAgIH07XG5cbiAgICBjb25zdCBhYm9ydCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF4aHIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICB4aHIgPSBudWxsO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbixcbiAgICAgICAgb2ZmLFxuICAgICAgICBvZmZBbGwsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBhYm9ydCxcbiAgICB9O1xufTtcbmV4cG9ydCB0eXBlIEZpbGVMb2FkZXJUeXBlID0gUmV0dXJuVHlwZTx0eXBlb2YgRmlsZUxvYWRlcj47XG4iLCJpbXBvcnQge1xuICAgIExvYWRlZEZpbGUsXG4gICAgUGFyYWxsZWxMb2FkZXJFbWl0Q29tcGxldGVUeXBlLFxuICAgIFBhcmFsbGVsTG9hZGVyRW1pdEVycm9yVHlwZSxcbiAgICBQYXJhbGxlbExvYWRlckVtaXRGaWxlQ29tcGxldGVUeXBlLFxuICAgIFBhcmFsbGVsTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbn0gZnJvbSBcIi4uL3R5cGVcIjtcbmltcG9ydCB7IEZpbGVMb2FkZXIsIEZpbGVMb2FkZXJUeXBlIH0gZnJvbSBcIi4vRmlsZUxvYWRlclwiO1xuaW1wb3J0IHsgdXNlTG9hZGVyRW1pdHRlciB9IGZyb20gXCIuL0V2ZW50XCI7XG5cbmV4cG9ydCBjb25zdCBQYXJhbGxlbExvYWRlciA9IChmaWxlczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBmaWxlTGVuZ3RoID0gZmlsZXMubGVuZ3RoO1xuICAgIGxldCBsb2FkZWRGaWxlTGVuZ3RoID0gMDtcblxuICAgIC8vIEV2ZW50IEVtaXR0ZXJcbiAgICBjb25zdCB7IHByb2dyZXNzLCBlcnJvciwgY29tcGxldGUsIGZpbGVDb21wbGV0ZSwgb24sIG9mZiwgb2ZmQWxsIH0gPVxuICAgICAgICB1c2VMb2FkZXJFbWl0dGVyPFxuICAgICAgICAgICAgUGFyYWxsZWxMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxuICAgICAgICAgICAgUGFyYWxsZWxMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgICAgICAgICAgUGFyYWxsZWxMb2FkZXJFbWl0Q29tcGxldGVUeXBlLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFBhcmFsbGVsTG9hZGVyRW1pdEZpbGVDb21wbGV0ZVR5cGVcbiAgICAgICAgPigpO1xuXG4gICAgY29uc3QgbG9hZGVyczogRmlsZUxvYWRlclR5cGVbXSA9IFtdO1xuICAgIGNvbnN0IGZpbGVSZXN1bHRzOiBMb2FkZWRGaWxlW10gPSBbXTtcblxuICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gRmlsZUxvYWRlcihmaWxlKTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJwcm9ncmVzc1wiLFxuICAgICAgICAgICAgZW1pdHRlcjogKF8pID0+IHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGxvYWRlZEZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHBlcjogbG9hZGVkRmlsZUxlbmd0aCAvIGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJjb21wbGV0ZVwiLFxuICAgICAgICAgICAgZW1pdHRlcjogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkZWRGaWxlTGVuZ3RoICs9IDE7XG4gICAgICAgICAgICAgICAgZmlsZVJlc3VsdHMucHVzaChlLmZpbGUpO1xuXG4gICAgICAgICAgICAgICAgZmlsZUNvbXBsZXRlLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogZS5maWxlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZEZpbGVMZW5ndGggPj0gZmlsZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZS5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGZpbGVSZXN1bHRzLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgICAgICAgZW1pdHRlcjogKGUpID0+IGVycm9yLmVtaXQoZSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlcnMucHVzaChsb2FkZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgbG9hZGVycy5mb3JFYWNoKChsb2FkZXIpID0+IGxvYWRlci5zdGFydCgpKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NyZWF0ZUJpbmRpbmcobywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHByaXZhdGVNYXApIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJpdmF0ZU1hcC5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBzZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlTWFwLnNldChyZWNlaXZlciwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbiIsImltcG9ydCB7XG4gICAgTG9hZGVkRmlsZSxcbiAgICBTZXJpYWxMb2FkZXJFbWl0Q29tcGxldGVUeXBlLFxuICAgIFNlcmlhbExvYWRlckVtaXRFcnJvclR5cGUsXG4gICAgU2VyaWFsTG9hZGVyRW1pdEZpbGVDb21wbGV0ZVR5cGUsXG4gICAgU2VyaWFsTG9hZGVyRW1pdEZpbGVQcm9ncmVzc1R5cGUsXG4gICAgU2VyaWFsTG9hZGVyRW1pdFByb2dyZXNzVHlwZSxcbn0gZnJvbSBcIi4uL3R5cGVcIjtcbmltcG9ydCB7IEZpbGVMb2FkZXIsIEZpbGVMb2FkZXJUeXBlIH0gZnJvbSBcIi4vRmlsZUxvYWRlclwiO1xuaW1wb3J0IHsgdXNlTG9hZGVyRW1pdHRlciB9IGZyb20gXCIuL0V2ZW50XCI7XG5cbmV4cG9ydCBjb25zdCBTZXJpYWxMb2FkZXIgPSAoZmlsZXM6IHN0cmluZ1tdKSA9PiB7XG4gICAgY29uc3QgZmlsZUxlbmd0aCA9IGZpbGVzLmxlbmd0aDtcbiAgICBsZXQgbG9hZGVkRmlsZUxlbmd0aCA9IDA7XG4gICAgbGV0IGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAvLyBFdmVudCBFbWl0dGVyXG4gICAgY29uc3Qge1xuICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGNvbXBsZXRlLFxuICAgICAgICBmaWxlUHJvZ3Jlc3MsXG4gICAgICAgIGZpbGVDb21wbGV0ZSxcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgIH0gPSB1c2VMb2FkZXJFbWl0dGVyPFxuICAgICAgICBTZXJpYWxMb2FkZXJFbWl0UHJvZ3Jlc3NUeXBlLFxuICAgICAgICBTZXJpYWxMb2FkZXJFbWl0RXJyb3JUeXBlLFxuICAgICAgICBTZXJpYWxMb2FkZXJFbWl0Q29tcGxldGVUeXBlLFxuICAgICAgICBTZXJpYWxMb2FkZXJFbWl0RmlsZVByb2dyZXNzVHlwZSxcbiAgICAgICAgU2VyaWFsTG9hZGVyRW1pdEZpbGVDb21wbGV0ZVR5cGVcbiAgICA+KCk7XG5cbiAgICBjb25zdCBsb2FkZXJzOiBGaWxlTG9hZGVyVHlwZVtdID0gW107XG4gICAgY29uc3QgZmlsZVJlc3VsdHM6IExvYWRlZEZpbGVbXSA9IFtdO1xuXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSBGaWxlTG9hZGVyKGZpbGUpO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcInByb2dyZXNzXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGZpbGVQcm9ncmVzcy5lbWl0KHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHByb2dyZXNzLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICB0b3RhbDogZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudDogbG9hZGVkRmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgcGVyOiBsb2FkZWRGaWxlTGVuZ3RoIC8gZmlsZUxlbmd0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlci5vbih7XG4gICAgICAgICAgICB0eXBlOiBcImNvbXBsZXRlXCIsXG4gICAgICAgICAgICBlbWl0dGVyOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxvYWRlZEZpbGVMZW5ndGggKz0gMTtcbiAgICAgICAgICAgICAgICBmaWxlUmVzdWx0cy5wdXNoKGUuZmlsZSk7XG5cbiAgICAgICAgICAgICAgICBmaWxlQ29tcGxldGUuZW1pdCh7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBmaWxlOiBlLmZpbGUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobG9hZGVkRmlsZUxlbmd0aCA+PSBmaWxlTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlLmVtaXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGZpbGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZmlsZVJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXJzW2N1cnJlbnRJbmRleF0uc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBsb2FkZXIub24oe1xuICAgICAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgICAgICAgZW1pdHRlcjogKGUpID0+IGVycm9yLmVtaXQoZSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvYWRlcnMucHVzaChsb2FkZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgbG9hZGVyc1tjdXJyZW50SW5kZXhdLnN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBMb2FkZXJUeXBlIH0gZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgUGFyYWxsZWxMb2FkZXIgfSBmcm9tIFwiLi9Mb2FkZXIvUGFyYWxsZWxMb2FkZXJcIjtcbmltcG9ydCB7IFNlcmlhbExvYWRlciB9IGZyb20gXCIuL0xvYWRlci9TZXJpYWxMb2FkZXJcIjtcblxuZXhwb3J0IGNvbnN0IExvYWRlciA9ICh0eXBlOiBMb2FkZXJUeXBlLCBmaWxlczogc3RyaW5nW10pID0+IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBcInBhcmFsbGVsXCI6XG4gICAgICAgICAgICByZXR1cm4gUGFyYWxsZWxMb2FkZXIoZmlsZXMpO1xuICAgICAgICBjYXNlIFwic2VyaWFsXCI6XG4gICAgICAgICAgICByZXR1cm4gU2VyaWFsTG9hZGVyKGZpbGVzKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnN0IF9leGhhdXN0aXZlQ2hlY2s6IG5ldmVyID0gdHlwZTtcbiAgICAgICAgICAgIHJldHVybiBfZXhoYXVzdGl2ZUNoZWNrO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9Mb2FkZXJcIjtcbmltcG9ydCB7IExvYWRlclR5cGUgfSBmcm9tIFwiLi90eXBlXCI7XG5cbmV4cG9ydCBjb25zdCBCYWNrc3RhZ2UgPSAodHlwZTogTG9hZGVyVHlwZSwgZmlsZXM6IHN0cmluZ1tdKSA9PiB7XG4gICAgY29uc3QgbG9hZGVyID0gTG9hZGVyKHR5cGUsIGZpbGVzKTtcbiAgICByZXR1cm4gbG9hZGVyO1xufTtcbiJdLCJuYW1lcyI6WyJldmVudG1pdCIsInNldCIsIlNldCIsIm9uIiwiaGFuZGxlciIsImFkZCIsIm9mZiIsIm9mZkFsbCIsImNsZWFyIiwiZW1pdCIsInZhbHVlIiwiZm9yRWFjaCIsIl9fYXNzaWduIiwiT2JqZWN0IiwiYXNzaWduIiwidCIsInMiLCJpIiwibiIsImFyZ3VtZW50cyIsImxlbmd0aCIsInAiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJhcHBseSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFxQk8sSUFBTUEsUUFBUSxHQUE0QixTQUFwQ0EsUUFBUUEsR0FBb0M7SUFDckQsRUFBQSxJQUFNQyxHQUFHLEdBQUcsSUFBSUMsR0FBRyxFQUFzQixDQUFBO01BQ3pDLE9BQU87UUFDSEMsRUFBRSxFQUFBLFNBQUFBLEdBQUNDLE9BQTJCLEVBQUE7SUFDMUJILE1BQUFBLEdBQUcsQ0FBQ0ksR0FBRyxDQUFDRCxPQUFPLENBQUMsQ0FBQTtTQUNuQjtRQUNERSxHQUFHLEVBQUEsU0FBQUEsSUFBQ0YsT0FBMkIsRUFBQTtVQUMzQkgsR0FBRyxDQUFBLFFBQUEsQ0FBTyxDQUFDRyxPQUFPLENBQUMsQ0FBQTtTQUN0QjtJQUNERyxJQUFBQSxNQUFNLFdBQUFBLE1BQUEsR0FBQTtVQUNGTixHQUFHLENBQUNPLEtBQUssRUFB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
