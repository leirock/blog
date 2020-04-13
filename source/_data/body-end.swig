{# Grid Styles #}
{% if page.type in ['friends', 'lab', 'photos'] %}
    <script src=" {{ url_for(theme.js) + '/mygrid.js' }} "></script>
    <script src="//cdn.jsdelivr.net/npm/minigrid@3.1.1/dist/minigrid.min.js"></script>
{% endif %}

{# Comment Locating #}
{% if page.comments or post.comments %}
    <script type="text/javascript">
        if(window.location.hash){
            var checkExist = setInterval(function() {
                if ($(window.location.hash).length) {
                    $('html, body').animate({scrollTop: $(window.location.hash).offset().top-90}, 1000);
                    clearInterval(checkExist);
                }
            }, 100);
        }
    </script>
{% endif %}