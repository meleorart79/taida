<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Orb web desktop
	 * https://gitlab.com/hsleisink/orb
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class file extends taida_backend {
		/* Check file exists
		 */
		public function get_exists() {
			$this->view->add_tag("exists", show_boolean(file_exists($this->get_filename)));
		}

		/* Check file type
		 */
		public function get_type() {
			if (file_exists($this->get_filename) == false) {
				$this->view->return_error(404);
			} else if (is_dir($this->get_filename) == false) {
				$this->view->add_tag("type", "file");
			} else {
				$this->view->add_tag("type", "directory");
			}
		}

		/* Download file
		 */
		public function get_download() {
			if (file_exists($this->get_filename) == false) {
				$this->view->return_error(404);
				print "File not found.";
				exit;
			}

			if (is_dir($this->get_filename)) {
				$this->view->return_error(400);
				print "File not found.";
				exit;
			}

			ob_end_clean();

			header("Pragma: no-cache");
			header("Cache-Control: no-store, no-cache, max-age=0, must-revalidate");
			header("Expires: 0");

			header("Content-Type: ".get_mimetype($this->get_filename));
			header("Content-Disposition: inline; filename=\"".basename($this->get_filename)."\"");
			readfile($this->get_filename);

			exit;
		}

		/* Load file
		 */
		public function get_load() {
			if (file_exists($this->get_filename) == false) {
				$this->view->return_error(404);
				return;
			}

			if (($content = file_get_contents($this->get_filename)) === false) {
				$this->view->return_error(403);
				return;
			}

			$this->view->add_tag("content", base64_encode($content), array("encoding" => "base64"));
		}

		/* Save file
		 */
		public function post_save() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if ($_POST["encoding"] == "base64") {
				$_POST["content"] = base64_decode($_POST["content"]);
			}

			if (file_put_contents($_POST["filename"], $_POST["content"]) === false) {
				$this->view->return_error(403);
			}
		}

		/* Remove file
		 */
		public function post_remove() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["filename"]) == false) {
				if (is_link($_POST["filename"]) == false) {
					$this->view->return_error(404);
					return;
				}
			}

			if (is_dir($_POST["filename"])) {
				$this->view->return_error(403);
				return;
			}

			ob_start();
			$result = unlink($_POST["filename"]);
			ob_end_clean();

			if ($result == false) {
				$this->view->return_error(403);
			}
		}

		/* Move file
		 */
		public function post_move() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if ($this->is_system_directory($_POST["source"])) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["source"]) == false) {
				if (is_link($_POST["source"]) == false) {
					$this->view->return_error(404);
					return;
				}
			}

			$parts = explode("/", $_POST["source"]);
			$filename = array_pop($parts);
			$destination = rtrim($_POST["destination"], "/");

			if (is_dir($destination)) {
				$destination .= "/".$filename;
			} else if (is_dir(dirname($destination)) == false) {
				$this->view->return_error(400);
				return;
			}

			if ($destination == $_POST["source"]) {
				$this->view->return_error(400);
				return;
			}

			if (rename($_POST["source"], $destination) == false) {
				$this->view->return_error(403);
			}
		}

		/* Copy file
		 */
		public function post_copy() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if (is_dir($_POST["source"])) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["source"]) == false) {
				if (is_link($_POST["source"]) == false) {
		  			$this->view->return_error(404);
					return;
				}
			}

			$parts = explode("/", $_POST["source"]);
			$filename = array_pop($parts);
			$destination = rtrim($_POST["destination"], "/");

			if (is_dir($destination)) {
				$destination .= "/".$filename;
			} else if (is_dir(dirname($destination)) == false) {
				$this->view->return_error(400);
				return;
			}

			if ($destination == $_POST["source"]) {
				$this->view->return_error(400);
				return;
			}

			if (copy($_POST["source"], $destination) == false) {
				$this->view->return_error(403);
			}
		}

		/* Rename file
		 */
		public function post_rename() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if ($this->is_system_directory($_POST["source"])) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["source"]) == false) {
				if (is_link($_POST["source"]) == false) {
					$this->view->return_error(404);
					return;
				}
			}

			if (strpos($_POST["new_filename"], "/") !== false) {
				$this->view->return_error(400);
				return;
			}

			if (substr($_POST["new_filename"], 0, 1) == ".") {
				$this->view->return_error(403);
				return;
			}

			if (($pos = strrpos($_POST["source"], "/")) === false) {
				$this->view->return_error(400);
				return;
			}

			$destination = substr($_POST["source"], 0, $pos + 1).trim($_POST["new_filename"]);

			if (file_exists($destination) || is_link($destination)) {
				$this->view->return_error(406);
				return;
			}

			if (rename($_POST["source"], $destination) == false) {
				$this->view->return_error(403);
			}
		}

		/* Link file
		 */
		public function post_link() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if (file_exists($_POST["source"]) == false) {
				$this->view->return_error(404);
				return;
			}

			if (file_exists($_POST["destination"])) {
				$this->view->return_error(406);
				return;
			}

			if (symlink($_POST["source"], $_POST["destination"]) == false) {
				$this->view->return_error(403);
				return;
			}
		}

		/* Search file
		 */
		private function search_file($search, $directory, $follow_link) {
			if (($dp = opendir($directory)) == false) {
				return;
			}

			$hd_ofs = strlen($this->home_directory);

			$files = array();
			while (($file = readdir($dp)) != false) {
				if (substr($file, 0, 1) == ".") {
					continue;
				}

				array_push($files, $file);
			}

			closedir($dp);

			sort($files);

			foreach ($files as $file) {
				$path = $directory."/".$file;

				$is_dir = is_dir($path);

				if ($is_dir) {
					if (is_link($path)) {
						if ($follow_link == false) {
							continue;
						}
						$follow = false;
					} else {
						$follow = $follow_link;
					}
				}

				if (strpos(strtolower($file), $search) !== false) {
					$attr = array("type" => $is_dir ? "dir" : "file");
					$this->view->add_tag("file", substr($directory."/".$file, $hd_ofs), $attr);
				}

				if ($is_dir) {
					$this->search_file($search, $directory."/".$file, $follow);
				}
			}
		}

		public function post_search() {
			$search = strtolower($_POST["search"]);

			if (strlen($search) <= 2) {
				$this->view->return_error(400);
				return;
			}

			$directory = $this->home_directory;
			if (($path = $_POST["path"] ?? "") != "") {
				if (substr($path, 0, 1) != "/") {
					$directory .= "/";
				}
				$directory .= $path;
			}

			$this->search_file($search, $directory, true);
		}

		/* General security checks
		 */
		public function execute() {
			$prepare = array("filename", "source", "destination");
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
