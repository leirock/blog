// 获取网页不含域名的路径
var windowPath = window.location.pathname; 
// 友链信息文件路径
var FriendDataPath = '/friends/friendslist.json';
// 图片信息文件路径
var imgDataPath = '/photos/photoslist.json'; 
// 图片访问路径
var imgPath = 'https://web-1256060851.cos.ap-shanghai.myqcloud.com/pages/photos/';  
// 图片显示数量
var imgMaxNum = 50; 
// 获取窗口宽度（以确定图片显示宽度）
var windowWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;
if (windowWidth < 768) {
    var imageWidth = 145; // 图片显示宽度(手机)
} else {
    var imageWidth = 215; // 图片显示宽度
}
// 腾讯云图片处理样式（根据图片显示宽度）
var imgStyle = '!' + imageWidth + 'x';

// 链接卡片（友链）
if (windowPath.indexOf('friends') > 0 ) {
    var LinkDataPath = FriendDataPath;
    link = {
        init: function () {
            var that = this;
            $.getJSON(LinkDataPath, function (data) {
                that.render(data);
            });
        },
        render: function (data) {
            var html, name, avatar, link, li = "";
            for (var i = 0; i < data.length; i++) {
                name = data[i].name;
                avatar = data[i].avatar;
                link = data[i].link;
                li += '<div class="card">' +
                        '<a href="' + link + '" target="_blank">' +
                            '<div class="thumb" style="background: url(' + avatar + ');">' + '</div>' +
                        '</a>' +
                        '<div class="card-header">' +
                            '<div><a href="' + link + '" target="_blank">' + name + '</a></div>' +
                        '</div>' +
                      '</div>';
            }
            $(".MyGrid").append(li);
        }
    }
    link.init();
}

// 图片卡片（照片页面）
if (windowPath.indexOf('photos') > 0 ) {
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
            var html, imgNameWithPattern, imgName, imageSize, imageX, imageY, li = "";
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
            $(".MyGrid").append(li);
            this.minigrid();
        },
        minigrid: function() {
            var grid = new Minigrid({
                container: '.MyGrid',
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
}