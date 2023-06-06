/*!
  backstage.js v0.0.1
  https://github.com/sushat4692/backstage.js#readme
  Released under the MIT License.
*/
'use strict';

var eventmit = require('eventmit');

var prepareEvent = function () {
    var progress = eventmit.eventmit();
    var error = eventmit.eventmit();
    var complete = eventmit.eventmit();
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

exports.Backstage = Backstage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9FdmVudC50cyIsIi4uLy4uL3NyYy9Mb2FkZXIudHMiLCIuLi8uLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXZlbnRtaXQgfSBmcm9tIFwiZXZlbnRtaXRcIjtcbmltcG9ydCB7IEV2ZW50RW1pdEtleSwgRXZlbnRFbWl0VHlwZSwgRXZlbnQsIEVtaXQgfSBmcm9tIFwiLi90eXBlXCI7XG5cbmV4cG9ydCBjb25zdCBwcmVwYXJlRXZlbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBldmVudG1pdDxFdmVudEVtaXRLZXk8XCJwcm9ncmVzc1wiPj4oKTtcbiAgICBjb25zdCBlcnJvciA9IGV2ZW50bWl0PEV2ZW50RW1pdEtleTxcImVycm9yXCI+PigpO1xuICAgIGNvbnN0IGNvbXBsZXRlID0gZXZlbnRtaXQ8RXZlbnRFbWl0S2V5PFwiY29tcGxldGVcIj4+KCk7XG5cbiAgICBjb25zdCBvbiA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJwcm9ncmVzc1wiOlxuICAgICAgICAgICAgICAgIHByb2dyZXNzLm9uKGV2ZW50LmhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgICAgICAgICAgZXJyb3Iub24oZXZlbnQuaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vbihldmVudC5oYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvZmYgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcy5vZmYoZXZlbnQuaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmYoZXZlbnQuaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29tcGxldGVcIjpcbiAgICAgICAgICAgICAgICBjb21wbGV0ZS5vZmYoZXZlbnQuaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2ZmQWxsID0gKGtleTogRXZlbnRFbWl0VHlwZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSBcInByb2dyZXNzXCI6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3Mub2ZmQWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBlcnJvci5vZmZBbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgIGNvbXBsZXRlLm9mZkFsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGVtaXQgPSAoZW1pdDogRW1pdCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGVtaXQua2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwicHJvZ3Jlc3NcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3MuZW1pdChlbWl0LnZhbHVlKTtcbiAgICAgICAgICAgIGNhc2UgXCJlcnJvclwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvci5lbWl0KGVtaXQudmFsdWUpO1xuICAgICAgICAgICAgY2FzZSBcImNvbXBsZXRlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRlLmVtaXQoZW1pdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBlbWl0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgRW1pdCB9IGZyb20gXCIuL3R5cGVcIjtcblxuY29uc3QgU2luZ2xlTG9hZGVyID0gKFxuICAgIGZpbGU6IHN0cmluZyxcbiAgICBlbWl0OiAoKSA9PiB2b2lkLFxuICAgIGNvbXBsZXRlOiAoKSA9PiB2b2lkLFxuICAgIGVycm9yOiAoKSA9PiB2b2lkXG4pID0+IHtcbiAgICBsZXQgX3RvdGFsID0gMDtcbiAgICBsZXQgX2N1cnJlbnQgPSAwO1xuICAgIGxldCBfcmVhZHkgPSBmYWxzZTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKFwiZ2V0XCIsIGZpbGUsIHRydWUpO1xuICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuXG4gICAgICAgICAgICB4aHIub25wcm9ncmVzcyA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcmVhZHkgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgX3RvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgICAgICBfY3VycmVudCA9IGUubG9hZGVkO1xuICAgICAgICAgICAgICAgIGVtaXQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhoci5zZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvdGFsOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gX3RvdGFsO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50OiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gX2N1cnJlbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWR5O1xuICAgICAgICB9LFxuICAgIH07XG59O1xudHlwZSBTaW5nbGVMb2FkZXJUeXBlID0gUmV0dXJuVHlwZTx0eXBlb2YgU2luZ2xlTG9hZGVyPjtcblxuZXhwb3J0IGNvbnN0IExvYWRlciA9IChmaWxlczogc3RyaW5nW10sIGVtaXQ6IChlbWl0OiBFbWl0KSA9PiB2b2lkKSA9PiB7XG4gICAgbGV0IGZpbGVMZW5ndGggPSBmaWxlcy5sZW5ndGg7XG4gICAgY29uc3QgbG9hZGVyczogU2luZ2xlTG9hZGVyVHlwZVtdID0gW107XG5cbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IFNpbmdsZUxvYWRlcihcbiAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbG9hZGVycy5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgIChhY2MsIGN1cikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnRvdGFsICs9IGN1ci50b3RhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLmN1cnJlbnQgKz0gY3VyLmN1cnJlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5yZWFkeSA9IGFjYy5yZWFkeSAmJiBjdXIucmVhZHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgdG90YWw6IDAsIGN1cnJlbnQ6IDAsIHBlcjogMCwgcmVhZHk6IHRydWUgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlYWR5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wZXIgPSByZXN1bHQuY3VycmVudCAvIHJlc3VsdC50b3RhbDtcbiAgICAgICAgICAgICAgICAgICAgZW1pdCh7IGtleTogXCJwcm9ncmVzc1wiLCB2YWx1ZTogcmVzdWx0IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZmlsZUxlbmd0aCAtPSAxO1xuICAgICAgICAgICAgICAgIGlmIChmaWxlTGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdCh7IGtleTogXCJjb21wbGV0ZVwiLCB2YWx1ZToge30gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbWl0KHsga2V5OiBcImVycm9yXCIsIHZhbHVlOiBuZXcgRXJyb3IoXCJlcnJvclwiKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgbG9hZGVycy5wdXNoKGxvYWRlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgbG9hZGVycy5mb3JFYWNoKChsb2FkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBsb2FkZXIuc3RhcnQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsgcHJlcGFyZUV2ZW50IH0gZnJvbSBcIi4vRXZlbnRcIjtcbmltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL0xvYWRlclwiO1xuXG5leHBvcnQgY29uc3QgQmFja3N0YWdlID0gKGZpbGVzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IHsgb24sIG9mZiwgb2ZmQWxsLCBlbWl0IH0gPSBwcmVwYXJlRXZlbnQoKTtcbiAgICBjb25zdCBsb2FkZXIgPSBMb2FkZXIoZmlsZXMsIGVtaXQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb24sXG4gICAgICAgIG9mZixcbiAgICAgICAgb2ZmQWxsLFxuICAgICAgICBzdGFydDogbG9hZGVyLnN0YXJ0LFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbImV2ZW50bWl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFHTyxJQUFNLFlBQVksR0FBRyxZQUFBO0FBQ3hCLElBQUEsSUFBTSxRQUFRLEdBQUdBLGlCQUFRLEVBQTRCLENBQUM7QUFDdEQsSUFBQSxJQUFNLEtBQUssR0FBR0EsaUJBQVEsRUFBeUIsQ0FBQztBQUNoRCxJQUFBLElBQU0sUUFBUSxHQUFHQSxpQkFBUSxFQUE0QixDQUFDO0lBRXRELElBQU0sRUFBRSxHQUFHLFVBQUMsS0FBWSxFQUFBO1FBQ3BCLFFBQVEsS0FBSyxDQUFDLEdBQUc7QUFDYixZQUFBLEtBQUssVUFBVTtBQUNYLGdCQUFBLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixNQUFNO0FBQ1YsWUFBQSxLQUFLLE9BQU87QUFDUixnQkFBQSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsTUFBTTtBQUNWLFlBQUEsS0FBSyxVQUFVO0FBQ1gsZ0JBQUEsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNCLE1BQU07QUFDYixTQUFBO0FBQ0wsS0FBQyxDQUFDO0lBRUYsSUFBTSxHQUFHLEdBQUcsVUFBQyxLQUFZLEVBQUE7UUFDckIsUUFBUSxLQUFLLENBQUMsR0FBRztBQUNiLFlBQUEsS0FBSyxVQUFVO0FBQ1gsZ0JBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVCLE1BQU07QUFDVixZQUFBLEtBQUssT0FBTztBQUNSLGdCQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QixNQUFNO0FBQ1YsWUFBQSxLQUFLLFVBQVU7QUFDWCxnQkFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUIsTUFBTTtBQUNiLFNBQUE7QUFDTCxLQUFDLENBQUM7SUFFRixJQUFNLE1BQU0sR0FBRyxVQUFDLEdBQWtCLEVBQUE7QUFDOUIsUUFBQSxRQUFRLEdBQUc7QUFDUCxZQUFBLEtBQUssVUFBVTtnQkFDWCxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU07QUFDVixZQUFBLEtBQUssT0FBTztnQkFDUixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2YsTUFBTTtBQUNWLFlBQUEsS0FBSyxVQUFVO2dCQUNYLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsTUFBTTtBQUNiLFNBQUE7QUFDTCxLQUFDLENBQUM7SUFFRixJQUFNLElBQUksR0FBRyxVQUFDLElBQVUsRUFBQTtRQUNwQixRQUFRLElBQUksQ0FBQyxHQUFHO0FBQ1osWUFBQSxLQUFLLFVBQVU7Z0JBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxZQUFBLEtBQUssT0FBTztnQkFDUixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLFlBQUEsS0FBSyxVQUFVO2dCQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEMsU0FBQTtBQUNMLEtBQUMsQ0FBQztJQUVGLE9BQU87QUFDSCxRQUFBLEVBQUUsRUFBQSxFQUFBO0FBQ0YsUUFBQSxHQUFHLEVBQUEsR0FBQTtBQUNILFFBQUEsTUFBTSxFQUFBLE1BQUE7QUFDTixRQUFBLElBQUksRUFBQSxJQUFBO0tBQ1AsQ0FBQztBQUNOLENBQUM7O0FDakVELElBQU0sWUFBWSxHQUFHLFVBQ2pCLElBQVksRUFDWixJQUFnQixFQUNoQixRQUFvQixFQUNwQixLQUFpQixFQUFBO0lBRWpCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNqQixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFFbkIsT0FBTztBQUNILFFBQUEsS0FBSyxFQUFFLFlBQUE7QUFDSCxZQUFBLElBQU0sR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7WUFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVCLFlBQUEsR0FBRyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFFMUIsWUFBQSxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQUMsQ0FBQyxFQUFBO0FBQ2YsZ0JBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDckIsT0FBTztBQUNWLGlCQUFBO2dCQUNELE1BQU0sR0FBRyxJQUFJLENBQUM7QUFFZCxnQkFBQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNqQixnQkFBQSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNwQixnQkFBQSxJQUFJLEVBQUUsQ0FBQztBQUNYLGFBQUMsQ0FBQztBQUVGLFlBQUEsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFDLENBQUMsRUFBQTtBQUNYLGdCQUFBLFFBQVEsRUFBRSxDQUFDO0FBQ2YsYUFBQyxDQUFDO0FBRUYsWUFBQSxHQUFHLENBQUMsT0FBTyxHQUFHLFVBQUMsQ0FBQyxFQUFBO0FBQ1osZ0JBQUEsS0FBSyxFQUFFLENBQUM7QUFDWixhQUFDLENBQUM7WUFFRixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZDtBQUNELFFBQUEsS0FBSyxFQUFFLFlBQUE7QUFDSCxZQUFBLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO0FBQ0QsUUFBQSxPQUFPLEVBQUUsWUFBQTtBQUNMLFlBQUEsT0FBTyxRQUFRLENBQUM7U0FDbkI7QUFDRCxRQUFBLEtBQUssRUFBRSxZQUFBO0FBQ0gsWUFBQSxPQUFPLE1BQU0sQ0FBQztTQUNqQjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUM7QUFHSyxJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQWUsRUFBRSxJQUEwQixFQUFBO0FBQzlELElBQUEsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFDO0FBRXZDLElBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBQTtBQUNmLFFBQUEsSUFBTSxNQUFNLEdBQUcsWUFBWSxDQUN2QixJQUFJLEVBQ0osWUFBQTtZQUNJLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQ3pCLFVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQTtBQUNMLGdCQUFBLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pCLGdCQUFBLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JDLGdCQUFBLE9BQU8sR0FBRyxDQUFDO0FBQ2YsYUFBQyxFQUNELEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUNoRCxDQUFDO1lBRUYsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNkLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLGFBQUE7QUFDTCxTQUFDLEVBQ0QsWUFBQTtZQUNJLFVBQVUsSUFBSSxDQUFDLENBQUM7WUFDaEIsSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUNqQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLGFBQUE7QUFDTCxTQUFDLEVBQ0QsWUFBQTtBQUNJLFlBQUEsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELFNBQUMsQ0FDSixDQUFDO0FBQ0YsUUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLEtBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTztBQUNILFFBQUEsS0FBSyxFQUFFLFlBQUE7QUFDSCxZQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUE7Z0JBQ25CLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQixhQUFDLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztBQUNOLENBQUM7O0FDNUZNLElBQU0sU0FBUyxHQUFHLFVBQUMsS0FBZSxFQUFBO0FBQy9CLElBQUEsSUFBQSxFQUE0QixHQUFBLFlBQVksRUFBRSxFQUF4QyxFQUFFLEdBQUEsRUFBQSxDQUFBLEVBQUEsRUFBRSxHQUFHLEdBQUEsRUFBQSxDQUFBLEdBQUEsRUFBRSxNQUFNLEdBQUEsRUFBQSxDQUFBLE1BQUEsRUFBRSxJQUFJLFVBQW1CLENBQUM7SUFDakQsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVuQyxPQUFPO0FBQ0gsUUFBQSxFQUFFLEVBQUEsRUFBQTtBQUNGLFFBQUEsR0FBRyxFQUFBLEdBQUE7QUFDSCxRQUFBLE1BQU0sRUFBQSxNQUFBO1FBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0tBQ3RCLENBQUM7QUFDTjs7OzsifQ==