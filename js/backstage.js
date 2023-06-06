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
        var complete = eventmit();
        var on = function (event) {
            switch (event.key) {
                case "progress":
                    progress.on(event.handler);
                    break;
                case "error":
                    error.on(event.handler);
                    break;
                case "complete":
                    complete.on(event.handler);
                    break;
            }
        };
        var off = function (event) {
            switch (event.key) {
                case "progress":
                    progress.off(event.handler);
                    break;
                case "error":
                    error.off(event.handler);
                    break;
                case "complete":
                    complete.off(event.handler);
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
            }
        };
        var emit = function (emit) {
            switch (emit.key) {
                case "progress":
                    return progress.emit(emit.value);
                case "error":
                    return error.emit(emit.value);
                case "complete":
                    return complete.emit(emit.value);
            }
        };
        return {
            on: on,
            off: off,
            offAll: offAll,
            emit: emit,
        };
    };

    var SingleLoader = function (file, emit, complete, error) {
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
                    emit();
                };
                xhr.onload = function (e) {
                    complete();
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
        files.forEach(function (file) {
            var loader = SingleLoader(file, function () {
                var result = loaders.reduce(function (acc, cur) {
                    acc.total += cur.total();
                    acc.current += cur.current();
                    acc.ready = acc.ready && cur.ready();
                    return acc;
                }, { total: 0, current: 0, per: 0, ready: true });
                if (result.ready) {
                    result.per = result.current / result.total;
                    emit({ key: "progress", value: result });
                }
            }, function () {
                fileLength -= 1;
                if (fileLength <= 0) {
                    emit({ key: "complete", value: {} });
                }
            }, function () {
                emit({ key: "error", value: new Error("error") });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3N0YWdlLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZXZlbnRtaXQvbW9kdWxlL2V2ZW50bWl0LmpzIiwiLi4vc3JjL0V2ZW50LnRzIiwiLi4vc3JjL0xvYWRlci50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZXZlbnRtaXQgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldCgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uKGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNldC5hZGQoaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIG9mZihoYW5kbGVyKSB7XG4gICAgICAgICAgICBzZXQuZGVsZXRlKGhhbmRsZXIpO1xuICAgICAgICB9LFxuICAgICAgICBvZmZBbGwoKSB7XG4gICAgICAgICAgICBzZXQuY2xlYXIoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW1pdCh2YWx1ZSkge1xuICAgICAgICAgICAgc2V0LmZvckVhY2goKGhhbmRsZXIpID0+IGhhbmRsZXIodmFsdWUpKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50bWl0LmpzLm1hcCIsImltcG9ydCB7IGV2ZW50bWl0IH0gZnJvbSBcImV2ZW50bWl0XCI7XG5pbXBvcnQgeyBFdmVudEVtaXRLZXksIEV2ZW50RW1pdFR5cGUsIEV2ZW50LCBFbWl0IH0gZnJvbSBcIi4vdHlwZVwiO1xuXG5leHBvcnQgY29uc3QgcHJlcGFyZUV2ZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IHByb2dyZXNzID0gZXZlbnRtaXQ8RXZlbnRFbWl0S2V5PFwicHJvZ3Jlc3NcIj4+KCk7XG4gICAgY29uc3QgZXJyb3IgPSBldmVudG1pdDxFdmVudEVtaXRLZXk8XCJlcnJvclwiPj4oKTtcbiAgICBjb25zdCBjb21wbGV0ZSA9IGV2ZW50bWl0PEV2ZW50RW1pdEtleTxcImNvbXBsZXRlXCI+PigpO1xuXG4gICAgY29uc3Qgb24gPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vbihldmVudC5oYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIGVycm9yLm9uKGV2ZW50LmhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub24oZXZlbnQuaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2ZmID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3Mub2ZmKGV2ZW50LmhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgZXJyb3Iub2ZmKGV2ZW50LmhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgY29tcGxldGUub2ZmKGV2ZW50LmhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG9mZkFsbCA9IChrZXk6IEV2ZW50RW1pdFR5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJwcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIHByb2dyZXNzLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgZXJyb3Iub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBlbWl0ID0gKGVtaXQ6IEVtaXQpID0+IHtcbiAgICAgICAgc3dpdGNoIChlbWl0LmtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2dyZXNzLmVtaXQoZW1pdC52YWx1ZSk7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IuZW1pdChlbWl0LnZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBjb21wbGV0ZS5lbWl0KGVtaXQudmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgZW1pdCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IEVtaXQgfSBmcm9tIFwiLi90eXBlXCI7XG5cbmNvbnN0IFNpbmdsZUxvYWRlciA9IChcbiAgICBmaWxlOiBzdHJpbmcsXG4gICAgZW1pdDogKCkgPT4gdm9pZCxcbiAgICBjb21wbGV0ZTogKCkgPT4gdm9pZCxcbiAgICBlcnJvcjogKCkgPT4gdm9pZFxuKSA9PiB7XG4gICAgbGV0IF90b3RhbCA9IDA7XG4gICAgbGV0IF9jdXJyZW50ID0gMDtcbiAgICBsZXQgX3JlYWR5ID0gZmFsc2U7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbihcImdldFwiLCBmaWxlLCB0cnVlKTtcbiAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcblxuICAgICAgICAgICAgeGhyLm9ucHJvZ3Jlc3MgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3JlYWR5ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIF90b3RhbCA9IGUudG90YWw7XG4gICAgICAgICAgICAgICAgX2N1cnJlbnQgPSBlLmxvYWRlZDtcbiAgICAgICAgICAgICAgICBlbWl0KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9yKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICB9LFxuICAgICAgICB0b3RhbDogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF90b3RhbDtcbiAgICAgICAgfSxcbiAgICAgICAgY3VycmVudDogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF9jdXJyZW50O1xuICAgICAgICB9LFxuICAgICAgICByZWFkeTogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFkeTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbnR5cGUgU2luZ2xlTG9hZGVyVHlwZSA9IFJldHVyblR5cGU8dHlwZW9mIFNpbmdsZUxvYWRlcj47XG5cbmV4cG9ydCBjb25zdCBMb2FkZXIgPSAoZmlsZXM6IHN0cmluZ1tdLCBlbWl0OiAoZW1pdDogRW1pdCkgPT4gdm9pZCkgPT4ge1xuICAgIGxldCBmaWxlTGVuZ3RoID0gZmlsZXMubGVuZ3RoO1xuICAgIGNvbnN0IGxvYWRlcnM6IFNpbmdsZUxvYWRlclR5cGVbXSA9IFtdO1xuXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSBTaW5nbGVMb2FkZXIoXG4gICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGxvYWRlcnMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAoYWNjLCBjdXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy50b3RhbCArPSBjdXIudG90YWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5jdXJyZW50ICs9IGN1ci5jdXJyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY2MucmVhZHkgPSBhY2MucmVhZHkgJiYgY3VyLnJlYWR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IHRvdGFsOiAwLCBjdXJyZW50OiAwLCBwZXI6IDAsIHJlYWR5OiB0cnVlIH1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZWFkeSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucGVyID0gcmVzdWx0LmN1cnJlbnQgLyByZXN1bHQudG90YWw7XG4gICAgICAgICAgICAgICAgICAgIGVtaXQoeyBrZXk6IFwicHJvZ3Jlc3NcIiwgdmFsdWU6IHJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZpbGVMZW5ndGggLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZUxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXQoeyBrZXk6IFwiY29tcGxldGVcIiwgdmFsdWU6IHt9IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW1pdCh7IGtleTogXCJlcnJvclwiLCB2YWx1ZTogbmV3IEVycm9yKFwiZXJyb3JcIikgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGxvYWRlcnMucHVzaChsb2FkZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6ICgpID0+IHtcbiAgICAgICAgICAgIGxvYWRlcnMuZm9yRWFjaCgobG9hZGVyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZGVyLnN0YXJ0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IHByZXBhcmVFdmVudCB9IGZyb20gXCIuL0V2ZW50XCI7XG5pbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9Mb2FkZXJcIjtcblxuZXhwb3J0IGNvbnN0IEJhY2tzdGFnZSA9IChmaWxlczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCB7IG9uLCBvZmYsIG9mZkFsbCwgZW1pdCB9ID0gcHJlcGFyZUV2ZW50KCk7XG4gICAgY29uc3QgbG9hZGVyID0gTG9hZGVyKGZpbGVzLCBlbWl0KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uLFxuICAgICAgICBvZmYsXG4gICAgICAgIG9mZkFsbCxcbiAgICAgICAgc3RhcnQ6IGxvYWRlci5zdGFydCxcbiAgICB9O1xufTtcbiJdLCJuYW1lcyI6WyJldmVudG1pdCIsInNldCIsIlNldCIsIm9uIiwiaGFuZGxlciIsImFkZCIsIm9mZiIsIm9mZkFsbCIsImNsZWFy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