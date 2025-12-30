<?php
	namespace Taida;

	class taida_email extends email {
		protected $content_type = "text/html";
		private $footers = array();

		/* Constructor
		 *
		 * INPUT:  string subject[, string e-mail][, string name]
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($subject, $from_address = null, $from_name = null) {
			$this->add_footer("These files are shared via Taida, the open source web desktop.");
			$this->add_footer("<a href=\"https://gitlab.com/hsleisink/taida\">Taida source code</a>");

			parent::__construct($subject, $from_address, $from_name);
		}

		/* Add e-mail footer
		 *
		 * INPUT:  string footer
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_footer($str) {
			array_push($this->footers, $str);
		}

		public function set_message_fields($data = null) {
			parent::set_message_fields($data);

			$footer = implode("<span style=\"margin:0 10px\">|</span>", $this->footers);
			$cid = $this->add_image("images/taidasansfond.png");

			$data = array(
				"FOOTER" => $footer,
				"LOGO"   => $cid);
			foreach ($data as $key => $value) {
				$key = sprintf($this->field_format, $key);
				$this->message_fields[$key] = $value;
			}
		}

		/* Set newsletter content
		 *
		 * INPUT:  string content
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function message($content) {
			$message = file_get_contents("../extra/taida_email.txt");
			$message = str_replace("[MESSAGE]", $content, $message);

			parent::message($message);
		}
	}
?>
