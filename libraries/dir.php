<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class dir extends taida_backend {
		/* Read directory
		 */
		public function get_list() {
			if (is_dir($this->get_filename) == false) {
				$this->view->return_error(404);
				return;
			}

			if (($dp = opendir($this->get_filename)) == false) {
				$this->view->return_error(403);
				return;
			}

			$files = array();
			while (($file = readdir($dp)) !== false) {
				if (substr($file, 0, 1) == ".") {
					continue;
				}

				array_push($files, $file);
			}

			usort($files, function($a, $b) {
				return strcmp(strtolower($a), strtolower($b));
			});

			foreach ($files as $file) {
				$target = $this->get_filename."/".$file;

				$this->view->open_tag("item");

				$this->view->add_tag("name", $file);
				$this->view->add_tag("type", is_dir($target) ? "directory" : "file");

				if (is_link($target)) {
					$to = readlink($target);
					$len = strlen($this->home_directory);
					if (substr($to, 0, $len) == $this->home_directory) {
						$this->view->add_tag("link", "yes");
						$this->view->add_tag("target", substr($to, $len));
					} else {
						$this->view->add_tag("link", "no");
					}
				} else {
					$this->view->add_tag("link", "no");
				}

				ob_start();
				$size = filesize($this->get_filename."/".$file);
				$create = filectime($target);
				$access = fileatime($target);
				ob_end_clean();

				$this->view->add_tag("size", $size);

				$this->view->add_tag("create", date("j F Y, H:i:s", $create), array("timestamp" => $create));
				$this->view->add_tag("access", date("j F Y, H:i:s", $access), array("timestamp" => $access));

				$this->view->close_tag();
			}

			closedir($dp);
		}

		/* Make directory
		 */
		public function post_make() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["directory"])) {
				$this->view->return_error(403);
				return;
			}

			if (mkdir($_POST["directory"]) == false) {
				$this->view->return_error(403);
				return;
			}
		}

		/* Check directory exists
		 */
		public function get_exists() {
			$this->view->add_tag("exists", show_boolean(is_dir($this->get_filename)));
		}

		/* Remove directory
		 */
		public function post_remove() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if ($this->is_system_directory($_POST["directory"])) {
				$this->view->return_error(403);
				return;
			}

			if (is_link($_POST["directory"])) {
				unlink($_POST["directory"]);
				return;
			}

			if (is_dir($_POST["directory"]) == false) {
				$this->view->add_tag("dir", $_POST["directory"]);
				$this->view->return_error(404);
				return;
			}

			if (($dp = opendir($_POST["directory"])) == false) {
				$this->view->add_tag("dir", $_POST["directory"]);
				$this->view->return_error(403);
			}

			$dotfiles = array();
			while (($file = readdir($dp)) != false) {
				if (($file == ".") || ($file == "..")) {
					continue;
				}

				if (substr($file, 0, 1) == ".") {
					array_push($dotfiles, $file);
					continue;
				}

				closedir($dp);
				$this->view->return_error(403);
				return;
			}

			closedir($dp);

			foreach ($dotfiles as $file) {
				unlink($_POST["directory"]."/".$file);
			}

			ob_start();
			$result = rmdir($_POST["directory"]);
			ob_end_clean();

			if ($result == false) {
				$this->view->return_error(403);
				return;
			}
		}

		/* General security checks
		 */
		public function execute() {
			$prepare = array("directory");
			foreach ($prepare as $item) {
				if (isset($_POST[$item])) {
					$_POST[$item] = "/".trim($_POST[$item], "/ ");

					if ($this->valid_filename($_POST[$item]) == false) {
						$this->view->return_error(400);
						return;
					}

					$_POST[$item] = $this->home_directory.$_POST[$item];
				}
			}

			parent::execute();
		}
	}
?>
