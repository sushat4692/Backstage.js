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
const backstage = Backstage([
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
    "http://example.com/path/to/image.jpg",
]);

// Loading progress
backstage.on("progress", function (status) {
    console.log(status);
    /**
     status = {
        // Target files total size
        total: number;
        // Current loaded file size
        current: number;
        // Loaded percentage
        per: number;
     }
     */
});

// Loaded evnet for loading one file
backstage.on("file_complete", function (status) {
    console.log(status);
    /**
     status = {
        // Loaded file name
        file: string;
        // Loaded file size
        size: number;
     }
     */
});

// Loaded evnet for all the files
backstage.on("complete", function (status) {
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
});
```
