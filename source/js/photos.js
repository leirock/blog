// photos list path
var imgDataPath = '/photos/photoslist.json'; 
// photos storage path
var imgPath = 'https://website-1256060851.cos.ap-hongkong.myqcloud.com/pages/photos/';  
// max photo number
var imgMaxNum = 50;
// window width (to decide photo width)
var windowWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;
if (windowWidth < 768) {
    var imageWidth = 145; // photo width (mobile)
} else {
    var imageWidth = 210; // photo width
}
// Tencent Cloud imgage style (based on photo width)
var imgStyle = '!' + imageWidth + 'x';

// generate photo grid
var LinkDataPath = imgDataPath;
photo = {
    page: 1,
    offset: imgMaxNum,
    init: function () {
        var that = this;
        $.getJSON(LinkDataPath, function (data) {
            that.render(that.page, data);
        });
    },
    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;
        var imgNameWithPattern, imgName, imageSize, imageX, imageY, li = "";
        for (var i = begin; i < end && i < data.length; i++) {
            imgNameWithPattern = data[i].split(' ')[1];
            imgName = imgNameWithPattern.split('.')[0]
            imageSize = data[i].split(' ')[0];
            imageX = imageSize.split('.')[0];
            imageY = imageSize.split('.')[1];
            li += '<div class="card" style="width:' + imageWidth + 'px" >' +
                    '<div class="ImageInCard" style="height:'+ imageWidth * imageY / imageX + 'px">' +
                        '<a data-fancybox="gallery" href="' + imgPath + imgNameWithPattern + '" data-caption="' + imgName + '" title="' +  imgName + '">' +
                            '<img data-src="' + imgPath + imgNameWithPattern + imgStyle + '" src="' + imgPath + imgNameWithPattern + imgStyle + '" data-loaded="true">' +
                        '</a>' +
                    '</div>' +
                    '</div>'
        }
        $(".PhotoGrid").append(li);
        this.minigrid();
    },
    minigrid: function() {
        var grid = new Minigrid({
            container: '.PhotoGrid',
            item: '.card',
            gutter: 12
        });
        grid.mount();
        $(window).resize(function() {
            grid.mount();
        });
    }
}
photo.init();