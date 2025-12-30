<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class desktop {
		private $view = null;
		private $username = null;

		public function __construct($view, $username) {
			$this->view = $view;
			$this->username = $username;
		}

		/* Get request handler
		 *
		 * INPUT:  -
		 * OUTPUT: object request handler
		 * ERROR:  false
		 */
		private function get_request_handler() {
			$parts = explode("?", $_SERVER["REQUEST_URI"], 2);
			$request_uri = array_shift($parts);
			$parameters = array_shift($parts);

			$parts = explode("/", $request_uri);
			$name = $parts[1];

			if ($name == "") {
				return count($parts) > 2 ? false : null;
			}

			if ($name == "taida") {
				/* Taida system call
				 */
				$name = $parts[2];

				if ($name == "") {
					return false;
				}

				$name = "Taida\\".$name;

				if (class_exists($name)) {
					if (is_subclass_of($name, "Taida\\taida_backend")) {
						return new $name($this->view, $this->username);
					}
				}

				return new taida($this->view, $this->username);
			}

			/* Application backend call
			
			if (in_array($name, APPLICATIONS) == false) {
				return false;
			}

			$library = "apps/".$name."/".$name.".php";

			if (file_exists($library)) {
				ob_start();
				require_once $library;
				ob_end_clean();
			}
			 */

			$name = "Taida\\".$name;

			if (class_exists($name) == false) {
				return false;
			}

			if (is_subclass_of($name, "Taida\\taida_backend") == false) {
				return false;
			}

			return new $name($this->view, $this->username);
		}

		/* Show desktop
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function show() {
			if (isset($_SESSION["counter"]) == false) {
				$_SESSION["counter"] = 0;
			} else {
				$_SESSION["counter"] += 1;
			}

			/* Stylesheets and javascripts
			 */
			$this->view->add_css("jquery-ui.css");
			$this->view->add_css("theme.css");
			
			$this->view->add_javascript("jquery.js");
			$this->view->add_javascript("jquery-ui.js");
			$this->view->add_javascript("library.js");

			if (is_true(USER_JAVASCRIPT)) {
				$this->view->add_javascript("user_javascript.js");
			}

			foreach (APPLICATIONS as $application) {
				$this->view->add_application($application);
			}

			$core_parts = array("taida", "desktop", "windows", "taskbar", "file", "directory");
			foreach ($core_parts as $part) {
				$this->view->add_css($part.".css");
				$this->view->add_javascript($part.".js");
			}

			/* Login information
			 */
			$this->view->open_tag("login");
			$this->view->add_tag("username", $this->username);
			$this->view->add_tag("method", AUTHENTICATION);
			if (AUTHENTICATION != "http") {
				$this->view->add_tag("timeout", ini_get("session.gc_maxlifetime"));
			}
			$this->view->close_tag();

			/* Load settings
			 */
			ob_start();
			$settings = file_get_contents(HOME_ROOT."/".$this->username."/.settings");
			ob_end_clean();

			if ($settings !== false) {
				$settings = json_decode($settings, true);
			} else {
				$settings = array("system" => array("zoom" => 0.75));
			}

			/* Create desktop
			 */
			$this->view->open_tag("desktop", array(
				"path"     => DESKTOP_PATH,
				"mobile"   => show_boolean($this->view->mobile_device),
				"zoom"     => $settings["system"]["zoom"],
				"editor"   => EDITOR,
				"readonly" => show_boolean(READ_ONLY),
				"counter"  => $_SESSION["counter"]));
			$this->view->close_tag();
		}

		/* Execute desktop class
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function execute() {
			$request_handler = $this->get_request_handler();

			if ($request_handler === null) {
				/* Show desktop
				 */
				$xslt_file = "desktop";

				$this->show();
			} else if ($request_handler === false) {
				/* Error
				 */
				if ($this->view->ajax_request == false) {
					$this->view->add_css("theme.css");
					$this->view->add_css("taida.css");

					$xslt_file = "error";
				}

				ob_get_clean();

				header("Status: 404");
				print "File not found.";
			} else {
				/* Application backend requests
				 */
				if (is_true(DEBUG_MODE) && ($_SERVER["REQUEST_METHOD"] == "POST")) {
					$log = $_POST;
					unset($log["content"]);
					if (empty($_FILES) == false) {
						$log["_FILES"] = $_FILES;
					}
					debug_log($log);
				}

				$request_handler->execute();
			}

			return $xslt_file ?? null;
		}
	}
?>
