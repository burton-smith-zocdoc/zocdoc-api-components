<?php // The whole integration is these tags, plus <zd-booking> wherever you want booking. ?>
<?php if (ZOCDOC_LIVE): ?>
<meta name="zocdoc-api-key" content="<?= e(ZOCDOC_TOKEN) ?>" />
<?php if (ZOCDOC_BASE_URL !== ''): ?>
<meta name="zocdoc-api-base-url" content="<?= e(ZOCDOC_BASE_URL) ?>" />
<?php endif; ?>
<?php else: ?>
<meta name="zocdoc-api-mock" content="true" />
<?php endif; ?>
<script src="/zocdoc/zocdoc.js"></script>
