<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	define("TAIDA_VERSION", "1.4");
	define("TITLE", "Taida web desktop");
	define("DEFAULT_COLOR", "#286090");
	define("DESKTOP_PATH", "Desktop");
	define("EDITOR", "notepad_open");
	define("SYSTEM_DIRECTORIES", array(DESKTOP_PATH, "Shared", "Temporary"));
	define("TERMINAL_NETWORK_TIMEOUT", 5);
	define("NONE_AUTH_HOMEDIR", "public");

	if (substr(HOME_DIRECTORIES, 0, 1) == "/") {
		$home_root = HOME_DIRECTORIES;
	} else {
		$separator = (PHP_OS_FAMILY == "Windows") ? "\\" : "/";
		$parts = explode($separator, __DIR__);
		array_pop($parts);

		$home_root = implode("/", $parts)."/".HOME_DIRECTORIES;
	}

	define("HOME_ROOT", $home_root);

	define("PASSWORD_FILE", HOME_ROOT."/users.txt");

	/* Scan for applications
	 */
	$apps = array();

	if (($dp = opendir(__DIR__."/../public/apps")) != false) {
		while (($app = readdir($dp)) != false) {
			if (substr($app, 0, 1) == ".") {
				continue;
			}

			if (file_exists("apps/".$app."/".$app.".js") == false) {
				continue;
			}

			array_push($apps, $app);
		}

		closedir($dp);
	}
	sort($apps);

	define("APPLICATIONS", $apps);

	function taida_application_exists($application) {
		return in_array($application, APPLICATIONS);
	}

	/* Taida system backend
	 */
	class taida extends taida_backend {
		public function get_ping() {
			$this->view->add_tag("pong");
		}

		public function get_autosave() {
			if (($dp = opendir($this->home_directory."/Temporary")) != false) {
				while (($file = readdir($dp)) != false) {
					if (strpos($file, "autosave") !== false) {
						$this->view->add_tag("autosave", "Temporary/".$file);
					}
				}
				closedir($dp);
			}
		}
	}
?>
