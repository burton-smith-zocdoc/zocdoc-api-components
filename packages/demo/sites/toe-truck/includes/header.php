<?php
require_once __DIR__ . '/config.php';
/** @var string $pageTitle */
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> · Toe Truck Podiatry</title>
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;600&display=swap">
  <link rel="stylesheet" href="/zocdoc/all.css">
  <link rel="stylesheet" href="/css/theme.css">
  <link rel="stylesheet" href="/css/site.css">
  <?php require __DIR__ . '/zocdoc-script.php'; ?>
</head>
<body>
  <aside aria-label="Demo notice">
    <p class="demo-ribbon">
      <?= ZOCDOC_LIVE ? 'Live sandbox' : 'Demo mode — sample data, no real appointments' ?>
      <?php if (ZOCDOC_LIVE_WITHOUT_TOKEN): ?> · Live mode needs ZOCDOC_TOKEN — showing sample data.<?php endif; ?>
    </p>
  </aside>
  <header class="site-header">
    <a href="/" class="brand">
      <img src="/art/tow-hook.svg" alt="" width="48" height="48">
      <span>Toe Truck Podiatry</span>
    </a>
    <p class="tagline">We'll tow you back on your feet.</p>
    <nav aria-label="Main">
      <a href="/">The Shop Blog</a>
      <a href="/book.php" class="cta">Book a Tow</a>
    </nav>
  </header>
  <div class="layout">
    <main id="main">
