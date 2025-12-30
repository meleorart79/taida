<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	/* Exception handler
	 *
	 * INPUT:  error object
	 * OUTPUT: -
	 * ERROR:  -
	 */
	function taida_exception_handler($error) {
		$previous = ob_get_clean();

		header("Content-Type: text/html");
		print "<!DOCTYPE html><html><body>\n";
		print "<h1>Exception</h1>\n";

		if (is_true(DEBUG_MODE)) {
			printf("<p style=\"white-space:pre-wrap\">%s</p>\n", $error->getMessage());
			printf("<p>line %d in %s.</p>\n",  $error->getLine(), $error->getFile());
		} else {
			printf("<p>Contact your website administrator to solve this issue.</p>\n");
			$message = sprintf("%s=> %s\nline %d in %s\n", $previous, $error->getMessage(), $error->getLine(), $error->getFile());
			taida_log_error($message);
		}

		print "</body></html>\n";
	}

	/* Error handler
	 *
	 * INPUT:  int error number, string error string, string filename, int line number
	 * OUTPUT: -
	 * ERROR:  -
	 */
	function taida_error_handler($errno, $errstr, $errfile, $errline) {
		printf("=> %s\nline %d in %s\n", $errstr, $errline, $errfile);

		return true;
	}

	/* Log error
	 */
	function taida_log_error($error, $username = null) {
		$logfile = new \Taida\logfile("error");
		if ($username !== null) {
			$logfile->user_id = $username;
		}
		$logfile->add_entry($error);
	}

	/* Error handling settings
	 */
	ini_set("display_errors", 1);
	error_reporting(E_ALL & ~E_NOTICE);
	set_exception_handler("taida_exception_handler");
	set_error_handler("taida_error_handler", E_ALL & ~E_NOTICE);
?>
