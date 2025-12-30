<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Orb web desktop
	 * https://gitlab.com/hsleisink/orb
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class login_log extends taida_backend {
		public function notify_user($notification) {
			$this->add_notification($notification);
		}

		public function execute() {
		}
	}

	class login {
		private $view = null;

		/* Constructor
		 *
		 * INPUT:  object view
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($view) {
			$this->view = $view;
		}

		/* Magic method get
		 *
		 * INPUT:  string key
		 * OUTPUT: mixed value
		 * ERROR:  null
		 */
		public function __get($key) {
			if ($key == "username") {
				switch (AUTHENTICATION) {
					case "http": return $_SERVER["REMOTE_USER"];
					case "taida": return $_SESSION["username"];
					case "none": return NONE_AUTH_HOMEDIR;
				}
			}

			return null;
		}

		/* Check username validity
		 *
		 * INPUT:  string username
		 * OUTPUT: bool username validity
		 * ERROR:  -
		 */
		private function valid_username($username) {
			if (strlen($username) == 0) {
				return false;
			}

			if (ctype_lower($username) == false) {
				return false;
			}

			return true;
		}

		/* Check login
		 *
		 * INPUT:  -
		 * OUTPUT: bool login valid
		 * ERROR:  -
		 */
		public function valid() {
			if (AUTHENTICATION == "none") {
				return true;
			}

			if (AUTHENTICATION == "http") {
				/* HTTP authentication
				 */
				if ($_SERVER["REMOTE_USER"] == null) {
					print "Enable HTTP authentication in your web server.";
					return false;
				}

				if ($this->valid_username($_SERVER["REMOTE_USER"]) == false) {
					print "Invalid username. Only lower-case letters are allowed.";
					return false;
				}

				return true;
			}

			if (AUTHENTICATION != "taida") {
				print "Invalid authentication method. Change it on taida.conf.";
				return false;
			}

			/* Taida authentication
			*/
			if (isset($_GET["logout"])) {
				$logfile = new logfile("taida");
				$logfile->user_id = $_SESSION["username"];
				$logfile->add_entry("user logged out");

				$_SESSION = array();

				return false;
			}

			if (isset($_SESSION["username"])) {
				if (($users = file(PASSWORD_FILE)) === false) {
					return false;
				}

				foreach ($users as $user) {
					list($username, $password) = explode(":", trim($user));
					if ($_SESSION["username"] == $username) {
						return true;
					}
				}
			}

			return false;
		}

		/* Show login form necessities
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function form_necessities() {
			header("Status: 401");

			$this->view->add_css("theme.css");
			$this->view->add_css("taida.css");

			$this->view->add_javascript("jquery.js");
			$this->view->add_javascript("login.js");
		}

		/* Delete directory content
		 *
		 * INPUT:  string path
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function empty_directory($directory) {
			if (($dp = opendir($directory)) == false) {
				return;
			}

			while (($file = readdir($dp)) != false) {
				if (substr($file, 0, 1) == ".") {
					continue;
				}

				$file = $directory."/".$file;

				if (is_dir($file)) {
					$this->empty_directory($file);
					rmdir($file);
				} else if (filesize($file) === 0) {
					unlink($file);
				} else if (strpos($file, "autosave") === false) {
					unlink($file);
				}
			}

			closedir($dp);
		}

		/* Validate login
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function validate() {
			if (($users = file(PASSWORD_FILE)) === false) {
				$this->view->return_error(500);
				return;
			}

			$logfile = new logfile("taida");

			foreach ($users as $user) {
				list($username, $password) = explode(":", trim($user));

				if ($this->valid_username($username) == false) {
					continue;
				}

				if ($username != $_POST["username"]) {
					continue;
				}

				if (password_verify($_POST["password"], $password)) {
					$_SESSION["username"] = $username;

					$logfile->user_id = $_POST["username"];
					$logfile->add_entry("user logged in");

					/* Empty directory Temporary
					 */
					$this->empty_directory(HOME_ROOT."/".$username."/Temporary");

					return;
				} 
			}

			$logfile->add_entry("invalid login: %s", $_POST["username"]);

			$login_log = new login_log($this->view, $_POST["username"]);
			$login_log->notify_user("Invalid login");

			$this->view->return_error(401);
		}

		/* Execute login class
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function execute() {
			if ($_SERVER["REQUEST_METHOD"] == "POST") {
				$this->validate();
			} else {
				$this->form_necessities();
			}

			return "login";
		}
	}
?>
