<?php
// Dev-server router: serve real files as-is, send everything else to a page or the 404.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . '/public' . $path;

if ($path !== '/' && is_file($file) && !str_ends_with($path, '.php')) {
    return false; // let php -S serve the static file
}

$pages = ['/' => 'index.php', '/index.php' => 'index.php', '/post.php' => 'post.php', '/book.php' => 'book.php'];
require __DIR__ . '/public/' . ($pages[$path] ?? '404.php');
