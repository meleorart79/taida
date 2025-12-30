<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	abstract class taida_backend {
		protected $view = null;
		protected $username = null;
		protected $home_directory = null;
		protected $parameters = array();
		protected $get_filename = null;

		/* Constructor
		 *
		 * INPUT:  object view, string username
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($view, $username) {
			$this->view = $view;
			$this->username = $username;
			$this->view->mode = "xml";
			$this->home_directory = HOME_ROOT."/".$username;
		}

		/* Check filename validity
		 *
		 * INPUT:  string filename
		 * OUTPUT: boolean result
		 * ERROR:  -
		 */
		protected function valid_filename($filename) {
			$result = true;

			if (strpos($filename, "\x00") !== false) {
				$result = false;
			} else if (substr($filename, 0, 2) == "..") {
				$result = false;
			} else if (strpos($filename, "/.") !== false) {
				$result = false;
			}

			if ($result == false) {
				$logfile = new logfile("taida");
				if (isset($_SESSION["username"])) {
					$logfile->user_id = $_SESSION["username"];
				}
				$logfile->add_entry("invalid filename %s", $filename);
			}

			return $result;
		}

		/* Check if directory is crucial to Taida
		 */
		protected function is_system_directory($directory) {
			static $directories = null;

			if ($directories === null) {
				$directories = array($this->home_directory);
				foreach (SYSTEM_DIRECTORIES as $sys_dir) {
					array_push($directories, $this->home_directory."/".$sys_dir);
				}
			}

			return in_array($directory, $directories);
		}

		protected function add_notification($notification) {
			$notification = str_replace("\r", "", $notification);
			$notification = str_replace("\n", "<br />", $notification);

			if ($notification == "") {
				return false;
			}

			if (is_dir($this->home_directory) == false) {
				return false;
			}

			if (($fp = fopen($this->home_directory."/.notifications", "a")) == false) {
				return false;
			}

			if (isset($_SERVER["REMOTE_ADDR"])) {
				$notification = "[".$_SERVER["REMOTE_ADDR"]."] ".$notification;
			}

			$notification = date("[H:i:s d/m/Y] ").$notification;

			fputs($fp, trim($notification)."\n");

			fclose($fp);

			return true;
		}

		/* Default execute function
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function execute() {
			$method = strtolower($_SERVER["REQUEST_METHOD"]);
			if (($pos = strpos($_SERVER["REQUEST_URI"], "?")) !== false) {
				$_SERVER["REQUEST_URI"] = substr($_SERVER["REQUEST_URI"], 0, $pos);
			}
			$parts = explode("/", trim($_SERVER["REQUEST_URI"], "/"));
			$this->parameters = array();

			if ($parts[0] == "taida") {
				array_shift($parts);
			}

			if (get_class($this) != "Taida\\taida") {
				array_shift($parts);
			}
			array_unshift($parts, $method);

			/* Set parameters
			 */
			while (count($parts) > 0) {
				$function = implode("_", $parts);
				if (method_exists($this, $function)) {
					/* Set filename
					 */
					$this->get_filename = $this->home_directory;
					if (count($this->parameters) > 0) {
						$filename = "/".urldecode(implode("/", $this->parameters));
						if ($this->valid_filename($filename) == false) {
							$this->view->return_error(400);
							return;
						}

						$this->get_filename .= $filename;
					}

					/* Get POST content
					 */
					if (($_SERVER["REQUEST_METHOD"] == "POST") && (($_SERVER["HTTP_CONTENT_TYPE"] ?? null) == "application/octet-stream")) {
						$_POST = file_get_contents("php://input");
					}

					/* Execute requested function
					 */
					if (call_user_func(array($this, $function)) === false) {
						$this->view->return_error(500);
					}

					return;
				}

				$part = array_pop($parts);
				array_unshift($this->parameters, $part);
			}

			/* Return error
			 */
			$methods = array_diff(array("GET", "POST", "PUT", "DELETE"), array($_SERVER["REQUEST_METHOD"]));
			$allowed = array();
			foreach ($methods as $method) {
				if (method_exists($this, strtolower($method))) {
					array_push($allowed, $method);
				}
			}

			if (count($allowed) == 0) {
				$this->view->return_error(404);
			} else {
				$this->view->return_error(405);
				header("Allowed: ".implode(", ", $allowed));
			}
		}
	}
?>
