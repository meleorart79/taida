<?php

// --- BOOTSTRAP (fallback defaults only) ---

if (!defined('DEBUG_MODE'))        define('DEBUG_MODE', true);
if (!defined('AUTHENTICATION'))    define('AUTHENTICATION', 'session');
if (!defined('USER_JAVASCRIPT'))   define('USER_JAVASCRIPT', false);
if (!defined('READ_ONLY'))         define('READ_ONLY', false);
if (!defined('HOME_DIRECTORIES'))  define('HOME_DIRECTORIES', 'home');
if (!defined('BASE_PATH'))         define('BASE_PATH', realpath(__DIR__ . '/..'));

// Load core libraries
require_once __DIR__ . '/../libraries/general.php';
require_once __DIR__ . '/../libraries/error.php';