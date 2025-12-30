<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Orb web desktop
	 * https://gitlab.com/hsleisink/orb
	 *
	 * Licensed under the GPLv2 License
	 */

	define("NO", 0);
	define("YES", 1);
	define("MB", 1048576);

	define("VALIDATE_CAPITALS",	 "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	define("VALIDATE_NONCAPITALS",  "abcdefghijklmnopqrstuvwxyz");
	define("VALIDATE_LETTERS",	  VALIDATE_CAPITALS.VALIDATE_NONCAPITALS);
	define("VALIDATE_PHRASE",	   VALIDATE_LETTERS." ,.?!:;-'");
	define("VALIDATE_NUMBERS",	  "0123456789");
	define("VALIDATE_SYMBOLS",	  "!@#$%^&*()_-+={}[]|\:;\"'`~<>,./?");
	define("VALIDATE_URL",		  VALIDATE_LETTERS.VALIDATE_NUMBERS."-_/.=");

	define("VALIDATE_NONEMPTY",	 0);

	/* Auto-load class
	 */
	function autoloader($class_name) {
		$parts = explode("\\", $class_name);
		$class = strtolower(array_pop($parts));
		$path = __DIR__;

		if (strtolower($parts[0] ?? "") == "taida") {
			array_shift($parts);
		}

		if (count($parts) > 0) {
			$path .= "/".strtolower(implode("/", $parts));
		}

		if (file_exists($file = $path."/".$class.".php")) {
			include_once $file;
		}
	}

	/* Convert mixed to boolean
	 *
	 * INPUT:  mixed
	 * OUTPUT: boolean
	 * ERROR:  -
	 */
	function is_true($bool) {
		if (is_string($bool)) {
			$bool = strtolower($bool);
		}

		return in_array($bool, array(true, YES, "1", "yes", "true", "on"), true);
	}

	/* Convert mixed to boolean
	 *
	 * INPUT:  mixed
	 * OUTPUT: boolean
	 * ERROR:  -
	 */
	function is_false($bool) {
		return (is_true($bool) === false);
	}

	/* Convert boolean to text
	 *
	 * INPUT:  boolean
	 * OUTPUT: 'yes'|'no'
	 * ERROR:  -
	 */
	function show_boolean($bool) {
		return (is_true($bool) ? "yes" : "no");
	}

	/* Generate random string
	 *
	 * INPUT:  int length
	 * OUTPUT: string random string
	 * ERROR:  -
	 */
	function random_string($length) {
		$characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		$max_chars = strlen($characters) - 1;

		$result = "";
		for ($i = 0; $i < $length; $i++) {
			$result .= $characters[random_int(0, $max_chars)];
		}

		return $result;
	}

	/* Log debug information
	 *
	 * INPUT:  string format[, mixed arg...]
	 * OUTPUT: true
	 * ERROR:  false
	 */
	function debug_log($info) {
		static $logfile = null;
		global $login;

		if ($logfile === null) {
			$logfile = new \Taida\logfile("debug");
		}

		$logfile->user_id = $login->username;

		call_user_func_array(array($logfile, "add_entry"), func_get_args());
	}

	/* Validate input
	 *
	 * INPUT:  string input, string valid characters[, int length]
	 * OUTPUT: boolean input okay
	 * ERROR:  -
	 */
	function valid_input($data, $allowed, $length = null) {
		if (is_array($data) == false) {
			$data_len = strlen($data);

			if ($length !== null) {
				if ($length == VALIDATE_NONEMPTY) {
					if ($data_len == 0) {
						return false;
					}
				} else if ($data_len !== $length) {
					return false;
				}
			} else if ($data_len == 0) {
				return true;
			}

			$data = str_split($data);
			$allowed = str_split($allowed);
			$diff = array_diff($data, $allowed);

			return count($diff) == 0;
		} else foreach ($data as $item) {
			if (valid_input($item, $allowed, $length) == false) {
				return false;
			}
		}

		return true;
	}

	/* Get mimetype
	 */
	function get_mimetype($file) {
		$default = "application/x-binary";

		if (file_exists("/etc/mime.types") == false) {
			return $default;
		}

		$info = pathinfo($file);
		if (isset($info["extension"]) == false) {
			return $default;
		}

		foreach (file("/etc/mime.types") as $line) {
			$line = trim($line);
			if (($line == "") || (substr($line, 0, 1) == "#")) {
				continue;
			}

			$line = preg_replace('/\s+/', ' ', $line);
			$extensions = explode(" ", $line);
			$mimetype = array_shift($extensions);

			if (in_array($info["extension"], $extensions)) {
				return $mimetype;
			}
		}

		return $default;
	}

	/* Convert configuration line to array
	 *
	 * INPUT:  string config line[, bool look for key-value
	 * OUTPUT: array config line
	 * ERROR:  -
	 */
	function config_array($line, $key_value = true) {
		$items = explode(",", $line);

		if ($key_value == false) {
			return $items;
		}

		$result = array();
		foreach ($items as $item) {
			list($key, $value) = explode(":", $item, 2);
			if ($value === null) {
				array_push($result, $key);
			} else {
				$result[$key] = $value;
			}
		}

		return $result;
	}

	/* Load configuration file
	 *
	 * INPUT:  string configuration file[, bool remove comments]
	 * OUTPUT: array( key => value[, ...] )
	 * ERROR:  -
	 */
	function config_file($config_file, $remove_comments = true) {
		static $cache = array();

		if (isset($cache[$config_file])) {
			return $cache[$config_file];
		}

		$first_char = substr($config_file, 0, 1);
		if (($first_char != "/") && ($first_char != ".")) {
			$config_file = __DIR__."/../".$config_file.".conf";
		}
		if (file_exists($config_file) == false) {
			return array();
		}

		$config = array();
		foreach (file($config_file) as $line) {
			if ($remove_comments) {
				$line = trim(preg_replace("/(^|\s)#.*/", "", $line));
			}
			$line = rtrim($line);

			if ($line === "") {
				continue;
			}

			if (($prev = count($config) - 1) == -1) {
				array_push($config, $line);
			} else if (substr($config[$prev], -1) == "\\") {
				$config[$prev] = rtrim(substr($config[$prev], 0, strlen($config[$prev]) - 1)) . ltrim($line);
			} else {
				array_push($config, $line);
			}
		}

		$cache[$config_file] = $config;

		return $config;
	}

	foreach (config_file("taida") as $line) {
		list($key, $value) = explode("=", chop($line), 2);
		define(trim($key), trim($value));
	}

	spl_autoload_register("autoloader", true, true);
?>
