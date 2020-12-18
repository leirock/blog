// friends list path
var FriendDataPath = 'https://cdn.jsdelivr.net/gh/lei2rock/friends/friendslist.json';

// generate friends link grid
var LinkDataPath = FriendDataPath;
friend = {
    init: function () {
        var that = this;
        $.getJSON(LinkDataPath, function (data) {
            that.render(data);
        });
    },
    render: function (data) {
        var name, logo, url, li = "";
        for (var i = 0; i < data.length; i++) {
            name = data[i].name;
            logo = data[i].logo;
            url = data[i].url;
            li += '<div class="card">' +
                    '<a href="' + url + '" target="_blank">' +
                        '<div class="thumb" style="background: url(https://cdn.jsdelivr.net/gh/lei2rock/friends/logo/' + logo + ');">' + '</div>' +
                    '</a>' +
                    '<div class="card-header">' +
                        '<div class="nowrap"><a href="' + url + '" target="_blank">' + name + '</a></div>' +
                    '</div>' +
                    '</div>';
        }
        $(".FriendsGrid").append(li);
    }
}
friend.init();
