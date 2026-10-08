<?php
http_response_code(404);
$pageTitle = 'Page Not Found';
require __DIR__ . '/../includes/header.php';
?>
<h1>Wrong Exit</h1>
<p>That page got towed. Try <a href="/">the Shop Blog</a> instead.</p>
<?php require __DIR__ . '/../includes/footer.php'; ?>
