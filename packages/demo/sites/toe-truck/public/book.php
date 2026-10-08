<?php
$pageTitle = 'Book a Tow';
require __DIR__ . '/../includes/header.php';
?>
<h1>Book a Tow</h1>
<p>Find a foot pro near you and pick a time. Our dispatcher (the component below) handles the rest.</p>
<zd-booking zip-code="11201" specialty-id="<?= e(SEARCH_SPECIALTY) ?>"></zd-booking>
<?php require __DIR__ . '/../includes/footer.php'; ?>
