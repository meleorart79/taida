<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Orb web desktop
	 * https://gitlab.com/hsleisink/orb
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class setting extends taida_backend {
		private $filename = null;
		private $settings = null;

		/* Get setting
		 */
		public function get() {
			if ($this->settings === null) {
				$this->view->return_error(500);
				return;
			}

			if (count($this->parameters) == 0) {
				$this->view->return_error(400);
				return;
			}

			while (count($this->parameters) > 0) {
				$key = array_shift($this->parameters);
				if (($value = $this->settings[$key] ?? null) === null) {
					$this->view->return_error(404);
					return;
				}

				$this->settings = $value;
			}

			if (is_array($this->settings)) {
				$this->view->return_error(400);
				return;
			}

			$this->view->add_tag("result", $this->settings);
		}

		/* Set setting
		 */
		public function post() {
			if (is_true(READ_ONLY)) {
				$this->view->return_error(403);
				return;
			}

			if ($this->settings === null) {
				$this->view->return_error(500);
				return;
			}

			if (count($this->parameters) == 0) {
				$this->view->return_error(400);
				return;
			}

			$settings = $this->parameters;
			$value = $_POST["value"];

			while (count($settings) > 0) {
				$key = array_pop($settings);
				$new = array($key => $value);
				$value = $new;
			}

			$settings = &$this->settings;
			while (is_array($value)) {
				$keys = array_keys($value);
				$key = $keys[0];
				$value = $value[$key];
				$settings = &$settings[$key];
			}
			$settings = $value;

			ob_start();
			$result = file_put_contents($this->filename, json_encode($this->settings));
			ob_end_clean();

			if ($result === false) {
				$this->view->return_error(500);
			}
		}

		/* Read settings
		 */
		public function execute() {
			$this->filename = $this->home_directory."/.settings";

			ob_start();
			$settings = file_get_contents($this->filename);
			ob_end_clean();

			if ($settings !== false) {
				$this->settings = json_decode($settings, true);
			}

			parent::execute();
		}
	}
?>
