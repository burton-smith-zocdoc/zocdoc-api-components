<?php // The whole integration is this tag, plus <zd-booking> wherever you want booking. ?>
<?php if (ZOCDOC_LIVE): ?>
<script src="/zocdoc/zocdoc.js" zd-token="<?= e(ZOCDOC_TOKEN) ?>"<?php if (ZOCDOC_BASE_URL !== ''): ?> zd-base-url="<?= e(ZOCDOC_BASE_URL) ?>"<?php endif; ?>></script>
<?php else: ?>
<script src="/zocdoc/zocdoc.js" zd-mock></script>
<?php endif; ?>
