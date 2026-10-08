<?php
/*
 * Mock unless live is asked for and possible. SEARCH_SPECIALTY is Primary Care in mock mode
 * because the published sandbox fixtures have no podiatrist; set ZOCDOC_SPECIALTY_ID in live
 * mode to search a real podiatry specialty.
 */
$mode = getenv('ZOCDOC_MODE') ?: 'mock';
$token = getenv('ZOCDOC_TOKEN') ?: '';

define('ZOCDOC_LIVE', $mode === 'live' && $token !== '');
define('ZOCDOC_LIVE_WITHOUT_TOKEN', $mode === 'live' && $token === '');
define('ZOCDOC_TOKEN', $token);
define('ZOCDOC_BASE_URL', getenv('ZOCDOC_BASE_URL') ?: '');
define('SEARCH_SPECIALTY', ZOCDOC_LIVE ? (getenv('ZOCDOC_SPECIALTY_ID') ?: 'sp_153') : 'sp_153');

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
