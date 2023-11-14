var getRandomImage = function (id) {
    var min = 1000;
    var max = 2000;
    var width = Math.floor(Math.random() * (max + 1 - min)) + min;
    var height = Math.floor(Math.random() * (max + 1 - min)) + min;

    return "https://picsum.photos/id/" + id + "/" + width + "/" + height;
};
