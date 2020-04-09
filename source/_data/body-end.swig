{% if page.type === 'picture' %}
<script src="//cdn.jsdelivr.net/npm/minigrid@3.1.1/dist/minigrid.min.js"></script>
<script src=" {{ url_for(theme.js) + '/photos.js' }}  "></script>
{% endif %}

{% if page.type === 'friends' %}
<script src=" {{ url_for(theme.js) + '/friends.js' }}  "></script>
{% endif %}

<script type="text/javascript">
// Comment Locating
if(window.location.hash){
    var checkExist = setInterval(function() {
      if ($(window.location.hash).length) {
        $('html, body').animate({scrollTop: $(window.location.hash).offset().top-90}, 1000);
        clearInterval(checkExist);
      }
    }, 100);
  }
</script>