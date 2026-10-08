<?php
$posts = require __DIR__ . '/../includes/posts.php';
$slug = $_GET['slug'] ?? '';
if (!is_string($slug) || !isset($posts[$slug])) {
    require __DIR__ . '/404.php';
    return;
}
$post = $posts[$slug];
$pageTitle = $post['title'];
require __DIR__ . '/../includes/header.php';
$dates = new IntlDateFormatter('en-US', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'UTC');
?>
<article class="post">
  <h1><?= e($post['title']) ?></h1>
  <p class="meta"><time datetime="<?= e($post['date']) ?>"><?= e($dates->format(new DateTimeImmutable($post['date'], new DateTimeZone('UTC')))) ?></time></p>
  <?php foreach ($post['body'] as $paragraph): ?>
    <p><?= e($paragraph) ?></p>
  <?php endforeach; ?>
  <p><a href="/book.php" class="button-link">Book a Tow</a></p>
</article>
<?php require __DIR__ . '/../includes/footer.php'; ?>
