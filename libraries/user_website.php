<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Orb web desktop
	 * https://gitlab.com/hsleisink/orb
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class user_website {
		private $view = null;
		private $username = null;

		/* Constructor
		 *
		 * INPUT:  object view
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($view) {
			$this->view = $view;
		}

		/* Check if user website is requested or not
		 *
		 * INPUT:  -
		 * OUTPUT: bool user website requested
		 * ERROR:  -
		 */
		public function requested() {
			if (is_false(USER_WEBSITES)) {
				return false;
			} else if (AUTHENTICATION == "none") {
				return false;
			}

			if ($_SERVER["REQUEST_URI"] == "/") {
				return false;
			}

			$parts = explode("/", $_SERVER["REQUEST_URI"]);
			$username = $parts[1];

			if (substr($username, 0, 1) != "~") {
				return false;
			}

			$username = substr($username, 1);

			$users = file(PASSWORD_FILE);
			foreach ($users as $user) {
				$user = explode(":", $user);

				if ($user[0] == $username) {
					$this->username = $username;
					break;
				}
			}

			return $this->username != null;
		}

		/* Send 404 error to browser
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function show_error() {
			$this->view->add_css("theme.css");
			$this->view->add_css("taida.css");
			$this->view->return_error(404);

			return "error";
		}

		/* Send requested user website to browser
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  string view file
		 */
		public function execute() {
			$file = substr($_SERVER["REQUEST_URI"], strlen($this->username) + 2);

			if ((strpos($file, "/.") !== false) || (strpos($file, "../") !== false)) {
				return $this->show_error();
			}

			$path = HOME_ROOT."/".$this->username."/Website".$file;

			if (is_dir($path)) {
				if (substr($path, -1) == "/") {
					$path .= "index.html";
				} else {
					$this->view->return_error(301);
					header("Location: ".$_SERVER["REQUEST_URI"]."/");
					exit;
				}
			}

			if (file_exists($path) == false) {
				return $this->show_error();
			}

			ob_end_clean();

			$mimetype = get_mimetype($path);

			header("Content-Type: ".$mimetype);
			readfile($path);

			exit;
		}
	}
?>
