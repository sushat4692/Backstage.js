# Backstage.js

Preloading image/video.

## Demo

[Demo is here](https://sushat4692.github.io/Backstage.js/)

## Usage

### Using from npm

```bash
$ npm install backstage.js
```

```js
import { Backstage } from 'backstage.js'

Backstage(...);
```

### Using from script

```html
<script src="path/to/backstage.js"></script>
<script>
    Backstage(...);
</script>
```

You can get from source code from [here](https://github.com/sushat4692/Backstage.js/tree/master/dist).

### Example

```js
// `serial` or `parallel`
// serial => Load files one by one
// paralell => Load files at the same time
const backstage = Backstage("parallel", [
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
]);

// Loading progress
backstage.on({
    type: "progress",
    emitter: function (status) {
        console.log(status);
        /**
        status = {
            // Target file total size
            total: number;
            // Current loaded file size
            current: number;
            // Loaded percentage
            per: number;
        }
        */
    },
});

// Loading progress evnet for one file
// Only serial mode
backstage.on({
    type: "file_progress",
    emitter: function (status) {
        console.log(status);
        /**
        status = {
            // Target file name
            file: string;
            // Target file total size
            total: number;
            // Current loaded file size
            current: number;
            // Loaded percentage
            per: number;
        }
        */
    },
});

// Loaded evnet for one file
backstage.on({
    type: "file_complete",
    emitter: function (status) {
        console.log(status);
        /**
        status = {
            // Loaded file name
            file: string;
            // Loaded file size
            size: number;
        }
        */
    },
});

// Loaded evnet for all the files
backstage.on({
    type: "complete",
    emitter: function (status) {
        console.log(status);
        /**
        status = {
            // Loaded files total size
            total: number;
            // Loaded files information
            files: {
                // Loaded file name
                file: string;
                // Loaded file size
                size: number;
            }[];
        }
        */
    },
});
```
