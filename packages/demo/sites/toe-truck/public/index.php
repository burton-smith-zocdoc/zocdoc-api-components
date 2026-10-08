<?php
$pageTitle = 'The Shop Blog';
require __DIR__ . '/../includes/header.php';
$posts = require __DIR__ . '/../includes/posts.php';
$dates = new IntlDateFormatter('en-US', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'UTC');
?>
<h1>The Shop Blog</h1>
<?php foreach ($posts as $slug => $post): ?>
  <article class="post-summary">
    <h2><a href="/post.php?slug=<?= e($slug) ?>"><?= e($post['title']) ?></a></h2>
    <p class="meta"><time datetime="<?= e($post['date']) ?>"><?= e($dates->format(new DateTimeImmutable($post['date'], new DateTimeZone('UTC')))) ?></time></p>
    <p><?= e($post['excerpt']) ?></p>
  </article>
<?php endforeach; ?>
<?php require __DIR__ . '/../includes/footer.php'; ?>
