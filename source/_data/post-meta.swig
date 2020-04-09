{### Muti-Language ###}
{%- if post.i18n %}
<span class="post-meta-item">
    <span class="post-meta-item-icon">
    <i class="fas fa-globe"></i>
    </span>
    <span>{{ __('post.post_lang') }}</span>
    <a href="{{ post.i18n }}" target="_blank" rel="noopener" data-pjax-state="">{{ __('post.link_lang') }}</a>
</span>
{%- endif %}