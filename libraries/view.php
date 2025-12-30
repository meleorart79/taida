<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Banshee PHP framework
	 * https://www.banshee-php.org/
	 *
	 * Licensed under The MIT License
	 */

	namespace Taida;

	final class view extends XML {
		private $http_code = 200;
		private $mode = null;
		private $javascripts = array();
		private $css_links = array();
		private $content_type = "text/html; charset=utf-8";
		private $ajax_request = null;
		private $mobile_device = false;

		/* Constructor
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct() {
			$this->ajax_request = (($_SERVER["HTTP_X_REQUESTED_WITH"] ?? null) == "XMLHttpRequest");

			if ($this->ajax_request) {
				$this->mode = "xml";
			} else if (isset($_GET["output"])) {
				$this->mode = $_GET["output"];
			}

			/* Mobile devices
			 */
			if (isset($_SERVER["HTTP_USER_AGENT"])) {
				$mobiles = array("iPhone", "iPad", "Android");
				foreach ($mobiles as $mobile) {
					if (strpos($_SERVER["HTTP_USER_AGENT"], $mobile) !== false) {
						$this->mobile_device = true;
						break;
					}
				}
			}
		}

		/* Magic method get
		 *
		 * INPUT:  string key
		 * OUTPUT: mixed value
		 * ERROR:  null
		 */
		public function __get($key) {
			switch ($key) {
				case "ajax_request": return $this->ajax_request;
				case "http_code": return $this->http_code;
				case "mode": return $this->mode;
				case "content_type": return $this->content_type;
				case "mobile_device": return $this->mobile_device;
			}

			return parent::__get($key);
		}

		/* Magic method set
		 *
		 * INPUT:  string key, mixed value
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __set($key, $value) {
			switch ($key) {
				case "mode": $this->mode = $value; break;
				case "content_type": $this->content_type = $value; break;
				default: trigger_error("Unknown output variable: ".$key);
			}
		}

		/* Return HTTP code
		 *
		 * INPUT:  integer HTTP code
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function return_error($code) {
			$this->http_code = $code;
			$this->add_tag("error", $code);
		}

		/* Add CSS link to output
		 *
		 * INPUT:  string CSS filename
		 * OUTPUT: boolean CSS file exists
		 * ERROR:  -
		 */
		public function add_css($css) {
			$css = "/css/".$css;

			if (file_exists(".".$css) == false) {
				return false;
			}

			if (in_array($css, $this->css_links)) {
				return true;
			}

			array_push($this->css_links, $css);

			return true;
		}

		/* Add javascript link
		 *
		 * INPUT:  string link
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_javascript($script) {
			$script = "/js/".$script;

			if (file_exists(".".$script) == false) {
				return false;
			}

			if (in_array($script, $this->javascripts) == false) {
				array_push($this->javascripts, $script);
			}

			return true;
		}

		/* Add Taida applications
		 *
		 * INPUT:  application name
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_application($name) {
			/* Javascript
			 */
			$script = "/apps/".$name."/".$name.".js";

			if (in_array($script, $this->javascripts)) {
				return true;
			}

			array_push($this->javascripts, $script);

			/* Stylesheet
			 */
			$css = "/apps/".$name."/".$name.".css";

			if (file_exists(".".$css)) {
				if (in_array($css, $this->css_links) == false) {
					array_push($this->css_links, $css);
				}
			}

			return true;
		}

		/* Close XML tag
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function close_tag() {
			if (($this->depth == 1) && ($this->mode == null))  {
				/* Cascading Style Sheets
				 */
				$this->open_tag("styles");
				foreach ($this->css_links as $css) {
					$this->add_tag("style", $css);
				}
				$this->close_tag();

				/* Javascripts
				 */
				$this->open_tag("javascripts");
				foreach ($this->javascripts as $javascript) {
					$this->add_tag("javascript", $javascript);
				}
				$this->close_tag();
			}

			parent::close_tag();
		}

		/* Mask transform function
		 *
		 * INPUT:  string XSLT filename
		 * OUTPUT: false
		 * ERROR:  -
		 */
		public function transform($xslt_file) {
			return false;
		}

		/* Check if it's ok to gzip output
		 *
		 * INPUT:  str output
		 * OUTPUT: bool ok to gzip output
		 * ERROR:  -
		 */
		private function can_gzip_output($data) {
			if (headers_sent()) {
				return false;
			} else if (isset($_SERVER["HTTP_ACCEPT_ENCODING"]) == false) {
				return false;
			} else if (ob_get_contents() != "") {
				return false;
			}

			$encodings = explode(",", $_SERVER["HTTP_ACCEPT_ENCODING"]);
			foreach ($encodings as $encoding) {
				if (trim($encoding) == "gzip") {
					return true;
				}
			}

			return false;
		}

		public function add_error($message) {
			$message = str_replace("\n", "<br />", $message);
			$message = str_replace("'", "\\'", $message);

			$this->add_tag("error", $message);
		}

		/* Generate output via XSLT
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function generate($xslt_file) {
			if ((headers_sent() == false) && ($this->http_code != 200)) {
				header(sprintf("Status: %d", $this->http_code));
			}

			if ($xslt_file == null) {
				$this->mode = "xml";
			}

			switch ($this->mode) {
				case "txt":
					header("Content-Type: text/plain");
					$result = $this->document;
					break;
				case "xml":
					header("Content-Type: text/xml");
					$result = $this->document;
					break;
				case null:
					$xslt_file = "../views/".$xslt_file.".xslt";

					if (($result = parent::transform($xslt_file)) === false) {
						return false;
					}

					/* Print headers
					 */
					if (headers_sent() == false) {
						header("X-Generated-By: Taida");
						header("X-Frame-Options: sameorigin");
						header("X-XSS-Protection: 1; mode=block");
						header("X-Content-Type-Options: nosniff");
						header("Permissions-Policy: interest-cohort=()");
						header("Referrer-Policy: same-origin");

						header("Content-Type: ".$this->content_type);
						if (is_false(ini_get("zlib.output_compression"))) {
							if ($this->can_gzip_output($result)) {
								header("Content-Encoding: gzip");
								$result = gzencode($result, 6);
							}
							header("Content-Length: ".strlen($result));
						}

						if ($this->ajax_request) {
							header("Cache-Control: private, max-age=0, no-cache");
							header("Pragma: no-cache");
						}

						header("Vary: Accept-Encoding");
					}
					break;
				default:
					$result = "Unknown output type";
			}

			return $result;
		}
	}
?>
