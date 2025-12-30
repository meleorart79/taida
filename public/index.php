<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	ob_start();

	session_name("Taida");
	$options = array(
		"lifetime" => 0,
		"path"     => "/",
		"domain"   => "",
		"secure"   => true,
		"httponly" => true,
		"samesite" => "none");
	session_set_cookie_params($options);
	session_start();

	require "../libraries/error.php";
	require "../libraries/general.php";
	spl_autoload_register("autoloader");
	require "../libraries/taida.php";
	require "../libraries/user_website.php";

	$view = new view();

	$view->open_tag("output", array(
		"version" => TAIDA_VERSION,
		"title"   => TITLE,
		"debug"   => show_boolean(DEBUG_MODE)));

	$login = new login($view);
	$user_website = new user_website($view);

	if ($user_website->requested()) {
		/* Show user website
		 */
		$xslt_file = $user_website->execute();
	} else if ($login->valid() == false) {
		/* Authentication
		 */
		$xslt_file = $login->execute();
	} else {
		/* User script
		 */
		$user_script = HOME_ROOT."/".$login->username.".php";
		if (file_exists($user_script)) {
			include $user_script;
		}

		/* Create desktop
		 */
		$desktop = new desktop($view, $login->username);
		$xslt_file = $desktop->execute();
	}

	if (($errors = ob_get_contents()) != "") {
		if (is_true(DEBUG_MODE)) {
			$view->add_error($errors);
		} else {
			taida_log_error($errors, $login->username);
		}
	}

	$view->close_tag();

	ob_clean();

	/* Generate output
	 */
	$html = $view->generate($xslt_file);
	$xslt_errors = ob_get_clean();

	if ($xslt_errors != "") {
		header_remove("Content-Encoding");
		header_remove("Content-Length");
		throw new \Exception($xslt_errors);
	} else {
		print $html;
	}
?>
