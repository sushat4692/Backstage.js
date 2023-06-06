/*!
  backstage.js v0.0.1
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

    var prepareEvent = function () {
        var progress = eventmit();
        var error = eventmit();
        var file_complete = eventmit();
        var complete = eventmit();
        var on = function (key, emitter) {
            switch (key) {
                case "progress":
                    progress.on(emitter);
                    break;
                case "error":
                    error.on(emitter);
                    break;
                case "file_complete":
                    file_complete.on(emitter);
                    break;
                case "complete":
                    complete.on(emitter);
                    break;
            }
        };
        var off = function (key, emitter) {
            switch (key) {
                case "progress":
                    progress.off(emitter);
                    break;
                case "error":
                    error.off(emitter);
                    break;
                case "file_complete":
                    file_complete.off(emitter);
                    break;
                case "complete":
                    complete.off(emitter);
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
                case "file_complete":
                    file_complete.offAll();
                    break;
                case "complete":
                    complete.offAll();
                    break;
            }
        };
        var emit = function (key, value) {
            switch (key) {
                case "progress":
                    return progress.emit(value);
                case "error":
                    return error.emit(value);
                case "file_complete":
                    return file_complete.emit(value);
                case "complete":
                    return complete.emit(value);
            }
        };
        return {
            on: on,
            off: off,
            offAll: offAll,
            emit: emit,
        };
    };

    var SingleLoader = function (file, progress, complete, error) {
        var _total = 0;
        var _current = 0;
        var _ready = false;
        return {
            start: function () {
                var xhr = new XMLHttpRequest();
                xhr.open("get", file, true);
                xhr.responseType = "blob";
                xhr.onprogress = function (e) {
                    if (!e.lengthComputable) {
                        return;
                    }
                    _ready = true;
                    _total = e.total;
                    _current = e.loaded;
                    progress();
                };
                xhr.onload = function (e) {
                    complete(file, _total);
                };
                xhr.onerror = function (e) {
                    error();
                };
                xhr.send();
            },
            total: function () {
                return _total;
            },
            current: function () {
                return _current;
            },
            ready: function () {
                return _ready;
            },
        };
    };
    var Loader = function (files, emit) {
        var fileLength = files.length;
        var loaders = [];
        var fileResults = files.map(function (file) { return ({ file: file, size: 0 }); });
        files.forEach(function (file) {
            var loader = SingleLoader(file, function () {
                var ready = true;
                var result = loaders.reduce(function (acc, cur) {
                    acc.total += cur.total();
                    acc.current += cur.current();
                    ready = ready && cur.ready();
                    return acc;
                }, { total: 0, current: 0, per: 0 });
                if (ready) {
                    result.per = result.current / result.total;
                    emit("progress", result);
                }
            }, function (file, size) {
                emit("file_complete", { file: file, size: size });
                var total = 0;
                fileResults = fileResults.map(function (res) {
                    var _size = file === res.file ? size : res.size;
                    total += _size;
                    return {
                        file: res.file,
                        size: _size,
                    };
                });
                fileLength -= 1;
                if (fileLength <= 0) {
                    emit("complete", { total: total, files: fileResults });
                }
            }, function () {
                emit("error", new Error("error"));
            });
            loaders.push(loader);
        });
        return {
            start: function () {
                loaders.forEach(function (loader) {
                    loader.start();
                });
            },
        };
    };

    var Backstage = function (files) {
        var _a = prepareEvent(), on = _a.on, off = _a.off, offAll = _a.offAll, emit = _a.emit;
        var loader = Loader(files, emit);
        return {
            on: on,
            off: off,
            offAll: offAll,
            start: loader.start,
        };
    };

    return Backstage;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3N0YWdlLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZXZlbnRtaXQvbW9kdWxlL2V2ZW50bWl0LmpzIiwiLi4vc3JjL0V2ZW50LnRzIiwiLi4vc3JjL0xvYWRlci50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZXZlbnRtaXQgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldCgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uKGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldC5hZGQoaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZihoYW5kbGVyKSB7XG4gICAgICAgICAgICBzZXQuZGVsZXRlKGhhbmRsZXIpO1xuICAgICAgICB9LFxuICAgICAgICBvZmZBbGwoKSB7XG4gICAgICAgICAgICBzZXQuY2xlYXIoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW1pdCh2YWx1ZSkge1xuICAgICAgICAgICAgc2V0LmZvckVhY2goKGhhbmRsZXIpID0+IGhhbmRsZXIodmFsdWUpKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50bWl0LmpzLm1hcCIsImltcG9ydCB7IGV2ZW50bWl0LCBFdmVudG1pdEhhbmRsZXIgfSBmcm9tIFwiZXZlbnRtaXRcIjtcbmltcG9ydCB7IEV2ZW50RW1pdEtleSwgRXZlbnRFbWl0VHlwZSB9IGZyb20gXCIuL3R5cGVcIjtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVFdmVudCA9ICgpID0+IHtcbiAgICBjb25zdCBwcm9ncmVzcyA9IGV2ZW50bWl0PEV2ZW50RW1pdEtleTxcInByb2dyZXNzXCI+PigpO1xuICAgIGNvbnN0IGVycm9yID0gZXZlbnRtaXQ8RXZlbnRFbWl0S2V5PFwiZXJyb3JcIj4+KCk7XG4gICAgY29uc3QgZmlsZV9jb21wbGV0ZSA9IGV2ZW50bWl0PEV2ZW50RW1pdEtleTxcImZpbGVfY29tcGxldGVcIj4+KCk7XG4gICAgY29uc3QgY29tcGxldGUgPSBldmVudG1pdDxFdmVudEVtaXRLZXk8XCJjb21wbGV0ZVwiPj4oKTtcblxuICAgIGNvbnN0IG9uID0gPEsgZXh0ZW5kcyBFdmVudEVtaXRUeXBlPihcbiAgICAgICAga2V5OiBLLFxuICAgICAgICBlbWl0dGVyOiBFdmVudG1pdEhhbmRsZXI8RXZlbnRFbWl0S2V5PEs+PlxuICAgICkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3Mub24oXG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIgYXMgRXZlbnRtaXRIYW5kbGVyPEV2ZW50RW1pdEtleTxcInByb2dyZXNzXCI+PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vbihlbWl0dGVyIGFzIEV2ZW50bWl0SGFuZGxlcjxFdmVudEVtaXRLZXk8XCJlcnJvclwiPj4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZpbGVfY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBmaWxlX2NvbXBsZXRlLm9uKFxuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyIGFzIEV2ZW50bWl0SGFuZGxlcjxFdmVudEVtaXRLZXk8XCJmaWxlX2NvbXBsZXRlXCI+PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vbihcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlciBhcyBFdmVudG1pdEhhbmRsZXI8RXZlbnRFbWl0S2V5PFwiY29tcGxldGVcIj4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvZmYgPSA8SyBleHRlbmRzIEV2ZW50RW1pdFR5cGU+KFxuICAgICAgICBrZXk6IEssXG4gICAgICAgIGVtaXR0ZXI6IEV2ZW50bWl0SGFuZGxlcjxFdmVudEVtaXRLZXk8Sz4+XG4gICAgKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmYoXG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIgYXMgRXZlbnRtaXRIYW5kbGVyPEV2ZW50RW1pdEtleTxcInByb2dyZXNzXCI+PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmYoZW1pdHRlciBhcyBFdmVudG1pdEhhbmRsZXI8RXZlbnRFbWl0S2V5PFwiZXJyb3JcIj4+KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaWxlX2NvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgZmlsZV9jb21wbGV0ZS5vZmYoXG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIgYXMgRXZlbnRtaXRIYW5kbGVyPEV2ZW50RW1pdEtleTxcImZpbGVfY29tcGxldGVcIj4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGNvbXBsZXRlLm9mZihcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlciBhcyBFdmVudG1pdEhhbmRsZXI8RXZlbnRFbWl0S2V5PFwiY29tcGxldGVcIj4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvZmZBbGwgPSAoa2V5OiBFdmVudEVtaXRUeXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZpbGVfY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBmaWxlX2NvbXBsZXRlLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgZW1pdCA9IDxLIGV4dGVuZHMgRXZlbnRFbWl0VHlwZT4oa2V5OiBLLCB2YWx1ZTogRXZlbnRFbWl0S2V5PEs+KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3MuZW1pdCh2YWx1ZSBhcyBFdmVudEVtaXRLZXk8XCJwcm9ncmVzc1wiPik7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IuZW1pdCh2YWx1ZSBhcyBFdmVudEVtaXRLZXk8XCJlcnJvclwiPik7XG4gICAgICAgICAgICBjYXNlIFwiZmlsZV9jb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlX2NvbXBsZXRlLmVtaXQoXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlIGFzIEV2ZW50RW1pdEtleTxcImZpbGVfY29tcGxldGVcIj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRlLmVtaXQodmFsdWUgYXMgRXZlbnRFbWl0S2V5PFwiY29tcGxldGVcIj4pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgZW1pdCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IEV2ZW50RW1pdEtleSwgRXZlbnRFbWl0VHlwZSwgTG9hZGVkRmlsZSB9IGZyb20gXCIuL3R5cGVcIjtcblxuY29uc3QgU2luZ2xlTG9hZGVyID0gKFxuICAgIGZpbGU6IHN0cmluZyxcbiAgICBwcm9ncmVzczogKCkgPT4gdm9pZCxcbiAgICBjb21wbGV0ZTogKGZpbGU6IHN0cmluZywgc2l6ZTogbnVtYmVyKSA9PiB2b2lkLFxuICAgIGVycm9yOiAoKSA9PiB2b2lkXG4pID0+IHtcbiAgICBsZXQgX3RvdGFsID0gMDtcbiAgICBsZXQgX2N1cnJlbnQgPSAwO1xuICAgIGxldCBfcmVhZHkgPSBmYWxzZTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKFwiZ2V0XCIsIGZpbGUsIHRydWUpO1xuICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuXG4gICAgICAgICAgICB4aHIub25wcm9ncmVzcyA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcmVhZHkgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgX3RvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgICAgICBfY3VycmVudCA9IGUubG9hZGVkO1xuICAgICAgICAgICAgICAgIHByb2dyZXNzKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZShmaWxlLCBfdG90YWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICB9LFxuICAgICAgICB0b3RhbDogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF90b3RhbDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF9jdXJyZW50O1xuICAgICAgICB9LFxuICAgICAgICByZWFkeTogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFkeTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbnR5cGUgU2luZ2xlTG9hZGVyVHlwZSA9IFJldHVyblR5cGU8dHlwZW9mIFNpbmdsZUxvYWRlcj47XG5cbmV4cG9ydCBjb25zdCBMb2FkZXIgPSAoXG4gICAgZmlsZXM6IHN0cmluZ1tdLFxuICAgIGVtaXQ6IDxLIGV4dGVuZHMgRXZlbnRFbWl0VHlwZT4oa2V5OiBLLCB2YWx1ZTogRXZlbnRFbWl0S2V5PEs+KSA9PiB2b2lkXG4pID0+IHtcbiAgICBsZXQgZmlsZUxlbmd0aCA9IGZpbGVzLmxlbmd0aDtcbiAgICBjb25zdCBsb2FkZXJzOiBTaW5nbGVMb2FkZXJUeXBlW10gPSBbXTtcblxuICAgIGxldCBmaWxlUmVzdWx0czogTG9hZGVkRmlsZVtdID0gZmlsZXMubWFwKChmaWxlKSA9PiAoeyBmaWxlLCBzaXplOiAwIH0pKTtcblxuICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gU2luZ2xlTG9hZGVyKFxuICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVhZHkgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbG9hZGVycy5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgIChhY2MsIGN1cikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnRvdGFsICs9IGN1ci50b3RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLmN1cnJlbnQgKz0gY3VyLmN1cnJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5ID0gcmVhZHkgJiYgY3VyLnJlYWR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IHRvdGFsOiAwLCBjdXJyZW50OiAwLCBwZXI6IDAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnBlciA9IHJlc3VsdC5jdXJyZW50IC8gcmVzdWx0LnRvdGFsO1xuICAgICAgICAgICAgICAgICAgICBlbWl0KFwicHJvZ3Jlc3NcIiwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGZpbGUsIHNpemUpID0+IHtcbiAgICAgICAgICAgICAgICBlbWl0KFwiZmlsZV9jb21wbGV0ZVwiLCB7IGZpbGUsIHNpemUgfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgICAgICAgICAgIGZpbGVSZXN1bHRzID0gZmlsZVJlc3VsdHMubWFwKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX3NpemUgPSBmaWxlID09PSByZXMuZmlsZSA/IHNpemUgOiByZXMuc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgdG90YWwgKz0gX3NpemU7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IHJlcy5maWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogX3NpemUsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaWxlTGVuZ3RoIC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVMZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBlbWl0KFwiY29tcGxldGVcIiwgeyB0b3RhbCwgZmlsZXM6IGZpbGVSZXN1bHRzIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW1pdChcImVycm9yXCIsIG5ldyBFcnJvcihcImVycm9yXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgbG9hZGVycy5wdXNoKGxvYWRlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgbG9hZGVycy5mb3JFYWNoKChsb2FkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgcHJlcGFyZUV2ZW50IH0gZnJvbSBcIi4vRXZlbnRcIjtcbmltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL0xvYWRlclwiO1xuXG5leHBvcnQgY29uc3QgQmFja3N0YWdlID0gKGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IHsgb24sIG9mZiwgb2ZmQWxsLCBlbWl0IH0gPSBwcmVwYXJlRXZlbnQoKTtcbiAgICBjb25zdCBsb2FkZXIgPSBMb2FkZXIoZmlsZXMsIGVtaXQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBzdGFydDogbG9hZGVyLnN0YXJ0LFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbImV2ZW50bWl0Iiwic2V0IiwiU2V0Iiwib24iLCJoYW5kbGVyIiwiYWRkIiwib2ZmIiwib2ZmQWxsIiwiY2xlYXIiLCJlbWl0IiwidmFsdWUiLCJmb3JFYWNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQXFCTyxJQUFNQSxRQUFRLEdBQTRCLFNBQXBDQSxRQUFRQSxHQUFvQztJQUNyRCxFQUFBLElBQU1DLEdBQUcsR0FBRyxJQUFJQyxHQUFHLEVBQXNCLENBQUE7TUFDekMsT0FBTztRQUNIQyxFQUFFLEVBQUEsU0FBQUEsR0FBQ0MsT0FBMkIsRUFBQTtJQUMxQkgsTUFBQUEsR0FBRyxDQUFDSSxHQUFHLENBQUNELE9BQU8sQ0FBQyxDQUFBO1NBQ25CO1FBQ0RFLEdBQUcsRUFBQSxTQUFBQSxJQUFDRixPQUEyQixFQUFBO1VBQzNCSCxHQUFHLENBQUEsUUFBQSxDQUFPLENBQUNHLE9BQU8sQ0FBQyxDQUFBO1NBQ3RCO0lBQ0RHLElBQUFBLE1BQU0sV0FBQUEsTUFBQSxHQUFBO1VBQ0ZOLEdBQUcsQ0FBQ08sS0FBSyxFQUFFLENBQUE7U0FDZDtRQUNEQyxJQUFJLEVBQUEsU0FBQUEsS0FBQ0MsS0FBUSxFQUFBO0lBQ1RULE1BQUFBLEdBQUcsQ0FBQ1UsT0FBTyxDQUFDLFVBQUNQLE9BQU8sRUFBQTtZQUFBLE9BQUtBLE9BQU8sQ0FBQ00sS0FBSyxDQUFDLENBQUE7V0FBQyxDQUFBLENBQUE7SUFDNUMsS0FBQTtJQUNILEdBQUEsQ0FBQTtJQUNMLENBQUM7O0lDbENNLElBQU0sWUFBWSxHQUFHLFlBQUE7SUFDeEIsSUFBQSxJQUFNLFFBQVEsR0FBRyxRQUFRLEVBQTRCLENBQUM7SUFD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