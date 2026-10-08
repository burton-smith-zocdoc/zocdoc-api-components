<?php $posts = require __DIR__ . '/posts.php'; ?>
<aside class="sidebar" aria-label="Sidebar">
  <section class="widget widget-cta">
    <h2>Stuck on the Shoulder?</h2>
    <p>Bunions, heel spurs, ingrowns. We haul 'em all.</p>
    <a href="/book.php" class="button-link">Get Towed In</a>
  </section>
  <section class="widget">
    <h2>Latest from the Shop</h2>
    <ul>
      <?php foreach ($posts as $slug => $post): ?>
        <li><a href="/post.php?slug=<?= e($slug) ?>"><?= e($post['title']) ?></a></li>
      <?php endforeach; ?>
    </ul>
  </section>
</aside>
