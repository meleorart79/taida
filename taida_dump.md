# Project Dump (Unlimited, Claude-Oriented)

## Context
- **Root path:** `C:\xampp\htdocs\taida`
- **Policy:** No truncation, full content preserved
- **Note:** Claude may still selectively load content due to context limits

## Directory Tree

```text
ChangeLog
home
home\.notifications
home\users.txt
libraries
libraries\desktop.php
libraries\dir.php
libraries\email.php
libraries\error.php
libraries\file.php
libraries\general.php
libraries\icon.php
libraries\logfile.php
libraries\login.php
libraries\setting.php
libraries\taida.php
libraries\taida_backend.php
libraries\taida_email.php
libraries\user_website.php
libraries\view.php
libraries\xml.php
logfiles
logfiles\debug.log
logfiles\error.log
logfiles\taida.log
public
public\.htaccess
public\css
public\css\desktop.css
public\css\jquery-ui.css
public\css\taida.css
public\css\taskbar.css
public\css\theme.css
public\css\windows.css
public\fonts
public\fonts\DotGothic16-Regular.woff2
public\fonts\SpaceGrotesk-Bold.woff2
public\fonts\SpaceGrotesk-Light.woff2
public\fonts\SpaceGrotesk-Medium.woff2
public\fonts\SpaceGrotesk-Regular.woff2
public\fonts\SpaceGrotesk-SemiBold.woff2
public\fonts\SpaceGrotesk-VariableFont_wght.woff2
public\fonts\VT323-Regular.woff2
public\images
public\images\animatedlogo.webm
public\images\application.png
public\images\background.jpg
public\images\chevron-down.svg
public\images\chevron-left.svg
public\images\chevron-right.svg
public\images\chevron-up.svg
public\images\close.svg
public\images\directory.png
public\images\error.png
public\images\file.png
public\images\icons
public\images\icons\csv.png
public\images\icons\docx.png
public\images\icons\odp.png
public\images\icons\ods.png
public\images\icons\odt.png
public\images\icons\pptx.png
public\images\icons\xlsx.png
public\images\link.png
public\images\logout.png
public\images\maximize.svg
public\images\minimize.svg
public\images\orb.png
public\images\pause.svg
public\images\play.svg
public\images\refresh.svg
public\images\taida.png
public\images\taidasansfond.png
public\images\ui-icons_444444_256x240.png
public\images\ui-icons_555555_256x240.png
public\images\ui-icons_777620_256x240.png
public\images\ui-icons_777777_256x240.png
public\images\ui-icons_cc0000_256x240.png
public\images\ui-icons_ffffff_256x240.png
public\index.php
public\js
public\js\desktop.js
public\js\directory.js
public\js\file.js
public\js\jquery-ui.js
public\js\jquery.js
public\js\jquery.ui.touch-punch.js
public\js\library.js
public\js\login.js
public\js\taida.js
public\js\taskbar.js
public\js\user_javascript.js
public\js\windows.js
setup
taida.conf
taida_structure.py
views
views\desktop.xslt
views\error.xslt
views\login.xslt
```

## Files

### `home\users.txt`

- **Size:** 66 bytes
- **Extension:** `.txt`

```
taida:$2y$10$wHP3pk4hm2g4aJV0nscC8el8zX1OeX5FnsbObY26QwOiPj7Zk8gv6
```

### `libraries\desktop.php`

- **Size:** 4694 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\dir.php`

- **Size:** 4173 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\email.php`

- **Size:** 12662 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Banshee PHP framework
	 * https://www.banshee-php.org/
	 *
	 * Licensed under The MIT License
	 */

	namespace Taida;

	class email {
		protected $to = array();
		protected $cc = array();
		protected $bcc = array();
		protected $from = null;
		protected $reply_to = null;
		protected $subject = null;
		protected $message = "";
		protected $attachments = array();
		protected $images = array();
		protected $sender_address = null;
		protected $message_fields = array();
		protected $field_format = "[%s]";

		/* Constructor
		 *
		 * INPUT:  string subject[, string e-mail][, string name]
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($subject, $from_address = null, $from_name = null) {
			$subject = explode("\n", $subject);
			$this->subject = trim(array_shift($subject));

			if ($this->valid_address($from_address)) {
				$this->from = $this->make_address($from_address, $from_name);
				$this->sender_address = $from_address;
			}
		}

		/* Validate an e-mail address
		*
		* INPUT:  string e-mail address
		* OUTPUT: boolean e-mail address okay
		* ERROR:  -
		*/
		public static function valid_address($email) {
			return preg_match("/^[0-9A-Za-z]([-+_.~]?[0-9A-Za-z])*@[0-9A-Za-z]([-.]?[0-9A-Za-z])*\\.[A-Za-z]{2,4}$/", $email) === 1;
		}

		/* Combine name and e-mail address
		 *
		 * INPUT:  string e-mail address, string name
		 * OUTPUT: string combined name and address
		 * ERROR:  -
		 */
		protected function make_address($address, $name) {
			$address = strtolower($address);

			if ($name == null) {
				return $address;
			}

			$parts = explode("\n", $name);
			$name = trim(array_shift($parts));

			return $name." <".$address.">";
		}

		/* Set reply-to
		 *
		 * INPUT:  string e-mail address[, string name]
		 * OUTPUT: boolean valid e-mail address
		 * ERROR:  -
		 */
		public function reply_to($address, $name = null) {
			if ($this->valid_address($address) == false) {
				return false;
			}

			$this->reply_to = $this->make_address($address, $name);
			$this->sender_address = $address;

			return true;
		}

		/* Add recipient
		 *
		 * INPUT:  string e-mail address[, string name]
		 * OUTPUT: boolean valid e-mail address
		 * ERROR:  -
		 */
		public function to($address, $name = null) {
			if ($this->valid_address($address) == false) {
				return false;
			}

			array_push($this->to, $this->make_address($address, $name));

			return true;
		}

		/* Add recipient from database
		 *
		 * INPUT:  object database, int user id
		 * OUTPUT: boolean valid user id and valid e-mail address
		 * ERROR:  -
		 */
		public function to_user_id($db, $user_id) {
			if (($user = $db->entry("users", $user_id)) == false) {
				return false;
			}

			return $this->to($user["email"], $user["fullname"]);
		}

		/* Add Carbon Copy recipient
		 *
		 * INPUT:  string e-mail address[, string name]
		 * OUTPUT: boolean valid e-mail address
		 * ERROR:  -
		 */
		public function cc($address, $name = null) {
			if ($this->valid_address($address) == false) {
				return false;
			}

			array_push($this->cc, $this->make_address($address, $name));

			return true;
		}

		/* Add Blind Carbon Copy recipient
		 *
		 * INPUT:  string e-mail address[, string name]
		 * OUTPUT: boolean valid e-mail address
		 * ERROR:  -
		 */
		public function bcc($address, $name = null) {
			if ($this->valid_address($address) == false) {
				return false;
			}

			array_push($this->bcc, $this->make_address($address, $name));

			return true;
		}

		/* Set e-mail message
		 *
		 * INPUT:  string message[, string content type]
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function message($message) {
			$message = str_replace("\r\n", "\n", $message);

			if ((substr($message, 0, 6) == "<body>") && (substr(rtrim($message), -7) == "</body>")) {
				$message = "<html>\n".rtrim($message)."\n</html>";
			}

			$this->message = $message;
		}

		/* Add e-mail attachment
		 *
		 * INPUT:  string filename[, string content][, string content type]
		 * OUTPUT: true
		 * ERROR:  false
		 */
		public function add_attachment($filename, $content = null, $content_type = null) {
			if ($content == null) {
				/* Load content from file
				 */
				if (file_exists($filename) == false) {
					return false;
				}
				if (($content = file_get_contents($filename)) == false) {
					return false;
				}
				$content_type = mime_content_type($filename);
				$filename = basename($filename);
			}

			if ($content_type == null) {
				$content_type = "application/octet-stream";
			}

			/* Add attachment
			 */
			array_push($this->attachments, array(
				"filename"     => $filename,
				"content"      => $content,
				"content_type" => $content_type));

			return true;
		}

		/* Add inline image
		 *
		 * INPUT:  string filename
		 * OUTPUT: string content for src property of image tag
		 * ERROR:  false
		 */
		public function add_image($filename) {
			if (file_exists($filename) == false) {
				return false;
			}
			if (($content = file_get_contents($filename, FILE_BINARY)) == false) {
				return false;
			}

			$content_type = mime_content_type($filename);
			$content_id = sha1($content);

			/* Add attachment
			 */
			array_push($this->images, array(
				"content"      => $content,
				"content_type" => $content_type,
				"content_id"   => $content_id));

			return "cid:".$content_id;
		}

		/* Set field values for message
		 *
		 * INPUT:  array fields
		 * OUPTUT: true
		 * ERROR:  false
		 */
		public function set_message_fields($data = null) {
			if ($data === null) {
				$data = array();
			} else if (is_array($data) == false) {
				return false;
			}

			$this->message_fields = array();
			foreach ($data as $key => $value) {
				$key = sprintf($this->field_format, $key);
				$this->message_fields[$key] = $value;
			}

			return true;
		}

		/* Populate fields in message
		 *
		 * INPUT:  string message
		 * OUTPUT: string message
		 * ERROR:  -
		 */
		private function populate_message_fields($message) {
			foreach ($this->message_fields as $key => $value) {
				$message = str_replace($key, $value, $message);
			}

			return $message;
		}

		/* Generate e-mail message block
		 *
		 * INPUT:  string boundary, string content-type, string message
		 * OUTPUT: string body block
		 * ERROR:  -
		 */
		private function message_block($boundary, $content_type, $message) {
			$message = $this->populate_message_fields($message);

			if ($content_type == "text/plain") {
				$message = str_replace("\n", "", $message);
				$message = str_replace("</th><th>", "</th> <th>", $message);
				$message = str_replace("</td><td>", "</td> <td>", $message);
				$message = str_replace("</tr>", "</tr>\n", $message);
				$message = str_replace("</table>", "</table>\n", $message);
				$message = str_replace("<br>", "<br>\n", $message);
				$message = str_replace("</p>", "</p>\n\n", $message);
				$message = str_replace("<div", "\n<div", $message);
				$message = preg_replace('/<head>.*<\/head>/', "", $message);
				$message = preg_replace('/<a href="(.*)"/', '[$1] <a href=""', $message);
				$message = strip_tags($message);
			}

			$format =
				"--%s\n".
				"Content-Type: %s\n".
				"Content-Transfer-Encoding: 7bit\n\n".
				"%s\n\n";

			return sprintf($format, $boundary, $content_type, $message);
		}

		/* Convert HTML message and inline images to message body
		 *
		 * INPUT:  string boundary
		 * OUTPUT: string body block
		 * ERROR:  -
		 */
		private function html_message($boundary) {
			$message = "";
			$image_count = count($this->images);

			/* Create multipart/related block
			 */
			if ($image_count > 0) {
				$message .= "--".$boundary."\n";
				$boundary = substr(sha1($boundary), 0, 20);
				$message .= "Content-Type: multipart/related; boundary=".$boundary."\n\n";
			}

			/* Add HTML message
			 */
			$message .= $this->message_block($boundary, "text/html", $this->message);

			/* Add inline images
			 */
			if ($image_count > 0) {
				$format =
					"--%s\n".
					"Content-Disposition: inline\n".
					"Content-Type: %s\n".
					"Content-ID: <%s>\n".
					"Content-Transfer-Encoding: base64\n\n".
					"%s\n\n";

				foreach ($this->images as $image) {
					$content = base64_encode($image["content"]);
					$content = wordwrap($content, 70, "\n", true);
					$message .= sprintf($format, $boundary, $image["content_type"], $image["content_id"], $content);
				}

				$message .= "--".$boundary."--\n\n";
			}

			return $message;
		}

		/* Send e-mail
		 *
		 * INPUT:  [string e-mail address recipient][, string name recipient]
		 * OUTPUT: true
		 * ERROR:  false
		 */
		public function send($to_address = null, $to_name = null) {
			if ($to_address !== null) {
				if ($this->to($to_address, $to_name) == false) {
					return false;
				}
			}

			if (count($this->to) == 0) {
				return false;
			}

			$attachment_count = count($this->attachments);
			$email_boundary = substr(sha1(time()), 0, 20);

			$message_contains_html = (substr($this->message, 0, 6) == "<html>") &&
			                         (substr(rtrim($this->message), -7) == "</html>");

			/* E-mail content
			 */
			if ($attachment_count == 0) {
				/* No attachments
				 */
				if ($message_contains_html == false) {
					/* One message
					 */
					$headers = array("Content-Type: text/plain");
					$message = $this->populate_message_fields($this->message);
				} else {
					/* Multiple messages
					 */
					$headers = array("Content-Type: multipart/alternative; boundary=".$email_boundary);
					$message = "This is a multi-part message in MIME format.\n";
					$message .= $this->message_block($email_boundary, "text/plain", $this->message);
					$message .= $this->html_message($email_boundary);
				}
			} else {
				/* With attachments
				 */
				$headers = array("Content-Type: multipart/mixed; boundary=".$email_boundary);
				$message = "This is a multi-part message in MIME format.\n";

				if ($message_contains_html == false) {
					/* One message
					 */
					$message .= $this->message_block($email_boundary, "text/plain", $this->message);
				} else {
					/* Multiple messages
					 */
					$message_boundary = substr(sha1($email_boundary), 0, 20);
					$message .= "--".$email_boundary."\n".
						"Content-Type: multipart/alternative; boundary=".$message_boundary."\n\n";
					$message .= $this->message_block($message_boundary, "text/plain", $this->message);
					$message .= $this->html_message($message_boundary);
					$message .= "--".$message_boundary."--\n\n";
				}

				/* Add attachments
				 */
				$format .=
					"--%s\n".
					"Content-Disposition: attachment;\n".
					"\tfilename=\"%s\"\n".
					"Content-Type: %s;\n".
					"\tname=\"%s\"\n".
					"Content-Transfer-Encoding: base64\n\n".
					"%s\n\n";

				foreach ($this->attachments as $attachment) {
					$content = base64_encode($attachment["content"]);
					$content = wordwrap($content, 70, "\n", true);
					$message .= sprintf($format, $email_boundary, $attachment["filename"],
						$attachment["content_type"], $attachment["filename"], $content);
				}
			}

			if ($message_contains_html || ($attachment_count > 0)) {
				$message .= "--".$email_boundary."--\n";
			}

			array_push($headers, "MIME-Version: 1.0");
			array_push($headers, "User-Agent: Banshee PHP framework e-mail library (https://www.banshee-php.org/)");

			/* Sender
			 */
			if ($this->from != null) {
				array_push($headers, "From: ".$this->from);
			}
			if ($this->reply_to != null) {
				array_push($headers, "Reply-To: ".$this->reply_to);
			}
			$sender = ($this->sender_address !== null) ? "-f".$this->sender_address : "";

			/* Carbon Copies
			 */
			if (count($this->cc) > 0) {
				array_push($headers, "CC: ".implode(", ", $this->cc));
			}

			/* Blind Carbon Copies
			 */
			if (count($this->bcc) > 0) {
				array_push($headers, "BCC: ".implode(", ", $this->bcc));
			}

			/* Send the e-mail
			 */
			if (mail(implode(", ", $this->to), $this->subject, $message, implode("\n", $headers), $sender) == false) {
				return false;
			}

			unset($message);

			$this->to = array();
			$this->cc = array();
			$this->bcc = array();

			return true;
		}
	}
?>
```

### `libraries\error.php`

- **Size:** 1714 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\file.php`

- **Size:** 8180 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
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
```

### `libraries\general.php`

- **Size:** 5983 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	define("NO", 0);
	define("YES", 1);
	define("MB", 1048576);

	define("VALIDATE_CAPITALS",	 "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
	define("VALIDATE_NONCAPITALS",  "abcdefghijklmnopqrstuvwxyz");
	define("VALIDATE_LETTERS",	  VALIDATE_CAPITALS.VALIDATE_NONCAPITALS);
	define("VALIDATE_PHRASE",	   VALIDATE_LETTERS." ,.?!:;-'");
	define("VALIDATE_NUMBERS",	  "0123456789");
	define("VALIDATE_SYMBOLS",	  "!@#$%^&*()_-+={}[]|\:;\"'`~<>,./?");
	define("VALIDATE_URL",		  VALIDATE_LETTERS.VALIDATE_NUMBERS."-_/.=");

	define("VALIDATE_NONEMPTY",	 0);

	/* Auto-load class
	 */
	function autoloader($class_name) {
		$parts = explode("\\", $class_name);
		$class = strtolower(array_pop($parts));
		$path = __DIR__;

		if (strtolower($parts[0] ?? "") == "taida") {
			array_shift($parts);
		}

		if (count($parts) > 0) {
			$path .= "/".strtolower(implode("/", $parts));
		}

		if (file_exists($file = $path."/".$class.".php")) {
			include_once $file;
		}
	}

	/* Convert mixed to boolean
	 *
	 * INPUT:  mixed
	 * OUTPUT: boolean
	 * ERROR:  -
	 */
	function is_true($bool) {
		if (is_string($bool)) {
			$bool = strtolower($bool);
		}

		return in_array($bool, array(true, YES, "1", "yes", "true", "on"), true);
	}

	/* Convert mixed to boolean
	 *
	 * INPUT:  mixed
	 * OUTPUT: boolean
	 * ERROR:  -
	 */
	function is_false($bool) {
		return (is_true($bool) === false);
	}

	/* Convert boolean to text
	 *
	 * INPUT:  boolean
	 * OUTPUT: 'yes'|'no'
	 * ERROR:  -
	 */
	function show_boolean($bool) {
		return (is_true($bool) ? "yes" : "no");
	}

	/* Generate random string
	 *
	 * INPUT:  int length
	 * OUTPUT: string random string
	 * ERROR:  -
	 */
	function random_string($length) {
		$characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		$max_chars = strlen($characters) - 1;

		$result = "";
		for ($i = 0; $i < $length; $i++) {
			$result .= $characters[random_int(0, $max_chars)];
		}

		return $result;
	}

	/* Log debug information
	 *
	 * INPUT:  string format[, mixed arg...]
	 * OUTPUT: true
	 * ERROR:  false
	 */
	function debug_log($info) {
		static $logfile = null;
		global $login;

		if ($logfile === null) {
			$logfile = new \Taida\logfile("debug");
		}

		$logfile->user_id = $login->username;

		call_user_func_array(array($logfile, "add_entry"), func_get_args());
	}

	/* Validate input
	 *
	 * INPUT:  string input, string valid characters[, int length]
	 * OUTPUT: boolean input okay
	 * ERROR:  -
	 */
	function valid_input($data, $allowed, $length = null) {
		if (is_array($data) == false) {
			$data_len = strlen($data);

			if ($length !== null) {
				if ($length == VALIDATE_NONEMPTY) {
					if ($data_len == 0) {
						return false;
					}
				} else if ($data_len !== $length) {
					return false;
				}
			} else if ($data_len == 0) {
				return true;
			}

			$data = str_split($data);
			$allowed = str_split($allowed);
			$diff = array_diff($data, $allowed);

			return count($diff) == 0;
		} else foreach ($data as $item) {
			if (valid_input($item, $allowed, $length) == false) {
				return false;
			}
		}

		return true;
	}

	/* Get mimetype
	 */
	function get_mimetype($file) {
		$default = "application/x-binary";

		if (file_exists("/etc/mime.types") == false) {
			return $default;
		}

		$info = pathinfo($file);
		if (isset($info["extension"]) == false) {
			return $default;
		}

		foreach (file("/etc/mime.types") as $line) {
			$line = trim($line);
			if (($line == "") || (substr($line, 0, 1) == "#")) {
				continue;
			}

			$line = preg_replace('/\s+/', ' ', $line);
			$extensions = explode(" ", $line);
			$mimetype = array_shift($extensions);

			if (in_array($info["extension"], $extensions)) {
				return $mimetype;
			}
		}

		return $default;
	}

	/* Convert configuration line to array
	 *
	 * INPUT:  string config line[, bool look for key-value
	 * OUTPUT: array config line
	 * ERROR:  -
	 */
	function config_array($line, $key_value = true) {
		$items = explode(",", $line);

		if ($key_value == false) {
			return $items;
		}

		$result = array();
		foreach ($items as $item) {
			list($key, $value) = explode(":", $item, 2);
			if ($value === null) {
				array_push($result, $key);
			} else {
				$result[$key] = $value;
			}
		}

		return $result;
	}

	/* Load configuration file
	 *
	 * INPUT:  string configuration file[, bool remove comments]
	 * OUTPUT: array( key => value[, ...] )
	 * ERROR:  -
	 */
	function config_file($config_file, $remove_comments = true) {
		static $cache = array();

		if (isset($cache[$config_file])) {
			return $cache[$config_file];
		}

		$first_char = substr($config_file, 0, 1);
		if (($first_char != "/") && ($first_char != ".")) {
			$config_file = __DIR__."/../".$config_file.".conf";
		}
		if (file_exists($config_file) == false) {
			return array();
		}

		$config = array();
		foreach (file($config_file) as $line) {
			if ($remove_comments) {
				$line = trim(preg_replace("/(^|\s)#.*/", "", $line));
			}
			$line = rtrim($line);

			if ($line === "") {
				continue;
			}

			if (($prev = count($config) - 1) == -1) {
				array_push($config, $line);
			} else if (substr($config[$prev], -1) == "\\") {
				$config[$prev] = rtrim(substr($config[$prev], 0, strlen($config[$prev]) - 1)) . ltrim($line);
			} else {
				array_push($config, $line);
			}
		}

		$cache[$config_file] = $config;

		return $config;
	}

	foreach (config_file("taida") as $line) {
		list($key, $value) = explode("=", chop($line), 2);
		define(trim($key), trim($value));
	}

	spl_autoload_register("autoloader", true, true);
?>
```

### `libraries\icon.php`

- **Size:** 660 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	class icon extends taida_backend {
		public function get_default() {
			if (($dp = opendir("images/icons")) == false) {
				return;
			}

			while (($file = readdir($dp)) != false) {
				if (substr($file, 0, 1) == ".") {
					continue;
				}

				list($icon, $ext) = explode(".", $file, 2);

				if ($ext != "png") {
					continue;
				}

				$this->view->add_tag("icon", $icon);
			}

			closedir($dp);
		}
	}
?>
```

### `libraries\logfile.php`

- **Size:** 2825 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Banshee PHP framework
	 * https://www.banshee-php.org/
	 *
	 * Licensed under The MIT License
	 */

	namespace Taida;

	class logfile {
		private $type = null;
		private $entries = array();
		private $user_id = null;

		/* Constructor
		 *
		 * INPUT:  string logfile type
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct($type) {
			$this->type = $type;
		}

		/* Destructor
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __destruct() {
			$this->flush();
		}

		/* Magic method get
		 *
		 * INPUT:  string key, mixed value
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __set($key, $value) {
			switch ($key) {
				case "user_id": $this->user_id = ($value === null) ? "-" : $value;
			}
		}

		/* Clear output buffer
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function clean() {
			$this->entries = array();
		}

		/* Flush output to disk
		 *
		 * INPUT:  -
		 * OUTPUT: true
		 * ERROR:  false
		 */
		public function flush() {
			if (count($this->entries) == 0) {
				return true;
			}

			ob_start();
			$fp = fopen(__DIR__."/../logfiles/".$this->type.".log", "a");
			ob_end_clean();

			if ($fp == false) {
				return false;
			}

			$remote_addr = isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : "localhost";
			$request_uri = isset($_SERVER["REQUEST_URI"]) ? $_SERVER["REQUEST_URI"] : "-";

			foreach ($this->entries as $entry) {
				$date = date("D d M Y H:i:s", $entry["timestamp"]);
				$entry = sprintf("%s|%s|%s|%s|%s\n", $remote_addr, $date, $request_uri, $entry["user_id"], $entry["content"]);

				fputs($fp, $entry);
			}

			fclose($fp);

			$this->clean();

			return true;
		}

		/* Add item to output buffer
		 *
		 * INPUT:  string item
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_entry($entry) {
			if (func_num_args() > 1) {
				$args = func_get_args();
				array_shift($args);
				$entry = vsprintf($entry, $args);
			} else if (is_array($entry)) {
				$entry = print_r($entry, true);
			}

			array_push($this->entries, array(
				"timestamp" => time(),
				"user_id"   => $this->user_id,
				"content"   => rtrim($entry)));
		}

		/* Add variable to output buffer
		 *
		 * INPUT:  mixed variable[, string prefix]
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_variable($variable, $prefix = null) {
			ob_start();
			var_dump($variable);
			$variable = ob_get_clean();

			$variable = preg_replace('/=>$\s*/m', " => ", $variable);

			if ($prefix !== null) {
				$variable = sprintf("%s: %s", $prefix, $variable);
			}

			$this->add_entry($variable);
		}
	}
?>
```

### `libraries\login.php`

- **Size:** 4952 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
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
```

### `libraries\setting.php`

- **Size:** 2251 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
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
```

### `libraries\taida.php`

- **Size:** 1919 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	define("TAIDA_VERSION", "1.4");
	define("TITLE", "Taida web desktop");
	define("DEFAULT_COLOR", "#286090");
	define("DESKTOP_PATH", "Desktop");
	define("EDITOR", "notepad_open");
	define("SYSTEM_DIRECTORIES", array(DESKTOP_PATH, "Shared", "Temporary"));
	define("TERMINAL_NETWORK_TIMEOUT", 5);
	define("NONE_AUTH_HOMEDIR", "public");

	if (substr(HOME_DIRECTORIES, 0, 1) == "/") {
		$home_root = HOME_DIRECTORIES;
	} else {
		$separator = (PHP_OS_FAMILY == "Windows") ? "\\" : "/";
		$parts = explode($separator, __DIR__);
		array_pop($parts);

		$home_root = implode("/", $parts)."/".HOME_DIRECTORIES;
	}

	define("HOME_ROOT", $home_root);

	define("PASSWORD_FILE", HOME_ROOT."/users.txt");

	/* Scan for applications
	 */
	$apps = array();

	if (($dp = opendir(__DIR__."/../public/apps")) != false) {
		while (($app = readdir($dp)) != false) {
			if (substr($app, 0, 1) == ".") {
				continue;
			}

			if (file_exists("apps/".$app."/".$app.".js") == false) {
				continue;
			}

			array_push($apps, $app);
		}

		closedir($dp);
	}
	sort($apps);

	define("APPLICATIONS", $apps);

	function taida_application_exists($application) {
		return in_array($application, APPLICATIONS);
	}

	/* Taida system backend
	 */
	class taida extends taida_backend {
		public function get_ping() {
			$this->view->add_tag("pong");
		}

		public function get_autosave() {
			if (($dp = opendir($this->home_directory."/Temporary")) != false) {
				while (($file = readdir($dp)) != false) {
					if (strpos($file, "autosave") !== false) {
						$this->view->add_tag("autosave", "Temporary/".$file);
					}
				}
				closedir($dp);
			}
		}
	}
?>
```

### `libraries\taida_backend.php`

- **Size:** 4584 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\taida_email.php`

- **Size:** 1541 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\user_website.php`

- **Size:** 2388 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
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
```

### `libraries\view.php`

- **Size:** 6794 bytes
- **Extension:** `.php`

```php
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
```

### `libraries\xml.php`

- **Size:** 7073 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Banshee PHP framework
	 * https://www.banshee-php.org/
	 *
	 * Licensed under The MIT License
	 */

	namespace Taida;

	class XML {
		const XML_HEADER = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

		private $xml_data = "";
		private $xslt_parameters = array();
		private $open_tags = array();
		private $cache = null;
		private $cache_key = null;
		private $cache_timeout = null;
		private $cache_buffer = "";
		private $tag_eol = true;

		/* Constructor
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function __construct() {
			libxml_disable_entity_loader(false);
		}

		/* Magic method get
		 *
		 * INPUT:  string key
		 * OUTPUT: mixed value
		 * ERROR:  null
		 */
		public function __get($key) {
			switch ($key) {
				case "depth": return count($this->open_tags);
				case "data": return $this->xml_data;
				case "document": return self::XML_HEADER."\n".$this->xml_data;
				case "array": return $this->xml_to_array($this->xml_data);
			}

			return null;
		}

		/* Clear XML data buffer
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function clear_buffer() {
			$this->xml_data = "";
			$this->abort_caching();
		}

		/* Translate special characters in string to XML entities
		 *
		 * INPUT:  string data
		 * OUTPUT: string data
		 * ERROR:  -
		 */
		private function xmlspecialchars($str) {
			return htmlspecialchars($str ?? "", ENT_XML1 | ENT_COMPAT, "UTF-8");
		}

		/* Add string to buffer
		 *
		 * INPUT:  string data
		 * OUTPUT: -
		 * ERROR:  -
		 */
		private function add_to_buffer($str) {
			$this->xml_data .= $str;
		}

		/* Add open-tag to buffer
		 *
		 * INPUT:  string tag name, array( string attributes[, ...] )
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function open_tag($name, $attributes = array()) {
			$this->add_to_buffer("<".$name);
			foreach ($attributes as $key => $value) {
				$this->add_to_buffer(" ".$key."=\"".$this->xmlspecialchars($value)."\"");
			}
			$this->add_to_buffer(">".($this->tag_eol ? "\n" : ""));

			array_push($this->open_tags, $name);
		}

		/* Add close-tag to buffer
		 *
		 * INPUT:  -
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function close_tag() {
			if (count($this->open_tags) == 0) {
				exit("No open XML tags available to close.");
			}

			$this->add_to_buffer("</".array_pop($this->open_tags).">\n");
		}

		/* Add tag to buffer
		 *
		 * INPUT:  string tag name, string data, array( string key => string value[, ...] )
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function add_tag($name, $data = null, $attributes = array()) {
			$this->tag_eol = false;

			$this->open_tag($name, $attributes);
			if ($data !== null) {
				$this->add_to_buffer($this->xmlspecialchars($data));
			}
			$this->close_tag();

			$this->tag_eol = true;
		}

		/* Add record to buffer
		 *
		 * INPUT:  array( string key => string value[, ...] )[, string tag name][, array( string key => string value[, ...] )][, boolean recursive]
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function record($record, $name = null, $attributes = array(), $recursive = false) {
			if ($name !== null) {
				if (isset($record["id"])) {
					$attributes["id"] = $record["id"];
				}

				if (is_numeric($name)) {
					$name = "item";
				}
				$this->open_tag($name, $attributes);
			}

			$skip_tags = array("id", "password", "creditcard");
			foreach (array_keys($record) as $key) {
				if (in_array($key, $skip_tags, true)) {
					continue;
				}

				if (is_array($record[$key]) == false) {
					$this->add_tag(is_numeric($key) ? "item" : $key, $record[$key]);
				} else if ($recursive) {
					$this->record($record[$key], $key, array(), true);
				}
			}
			if ($name !== null) {
				$this->close_tag($name);
			}
		}

		/* Add XML data to buffer
		 *
		 * INPUT:  string XML data, string tag name
		 * OUTPUT: true
		 * ERROR:  false
		 */
		public function add_xml($str, $tag) {
			if (strpos($str, "<!") !== false) {
				return false;
			}

			$xml = new \DomDocument();
			if ($xml->loadXML($str) == false) {
				return false;
			}

			if (($begin = strpos($str, "<".$tag.">")) === false) {
				if (($begin = strpos($str, "<".$tag." ")) === false) {
					return false;
				}
			}
			if (($end = strrpos($str, "</".$tag.">")) === false) {
				return false;
			}
			$end += strlen($tag) + 3;

			$str = substr($str, $begin, $end - $begin)."\n";

			$this->add_to_buffer($str);

			return true;
		}

		/* Set XSLT parameter
		 *
		 * INPUT:  string key, string value
		 * OUTPUT: -
		 * ERROR:  -
		 */
		public function set_xslt_parameter($key, $value) {
			$this->xslt_parameters[$key] = $value;
		}

		/* Convert XML string to array
		 *
		 * INPUT:  string xml
		 * OUTPUT: array data
		 * ERROR:  false
		 */
		public function xml_to_array($xml) {
			/* Convert XML to array
			 */
			$parser = xml_parser_create();
			xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
			if (xml_parse_into_struct($parser, $xml, $items, $index) == 0) {
				return false;
			}
			xml_parser_free($parser);

			/* Convert to usable array
			 */
			$result = $pointers = array();
			$depth = 0;
			$pointers[$depth] = &$result;

			foreach ($items as $item) {
				if (($item["attributes"] ?? null) === null) {
					$item["attributes"] = array();
				}

				/* Handle node types
				 */
				switch ($item["type"]) {
					case "open":
						array_push($pointers[$depth], array(
							"name"       => $item["tag"],
							"attributes" => $item["attributes"],
							"content"    => array()));
						$last = count($pointers[$depth]) - 1;
						$pointers[$depth + 1] = &$pointers[$depth++][$last]["content"];
						break;
					case "complete":
						array_push($pointers[$depth], array(
							"name"       => $item["tag"],
							"attributes" => $item["attributes"],
							"content"    => trim($item["value"] ?? "")));
						break;
					case "close":
						$depth--;
						break;
				}
			}

			return $result;
		}

		/* Perform XSL transformation
		 *
		 * INPUT:  string XSLT filename
		 * OUTPUT: string XSLT result
		 * ERROR:  false
		 */
		public function transform($xslt_file) {
			$xslt = new \DomDocument();
			$xml = new \DomDocument();

			if ((file_exists($xslt_file)) == false) {
				return false;
			} else if ($xslt->load($xslt_file) == false) {
				return false;
			}

			if ($xml->loadxml($this->document) == false) {
				return false;
			}

			$processor = new \XSLTprocessor();
			$processor->setsecurityprefs(XSL_SECPREF_DEFAULT | XSL_SECPREF_READ_FILE | XSL_SECPREF_READ_NETWORK);
			$processor->importstylesheet($xslt);

			foreach ($this->xslt_parameters as $key => $value) {
				$processor->setparameter("", $key, $value);
			}

			return $processor->transformtoxml($xml);
		}
	}
?>
```

### `public\css\desktop.css`

- **Size:** 2424 bytes
- **Extension:** `.css`

```css
/* ================================
   DESKTOP LAYER
   ================================ */
div.desktop {
	position: absolute;
	inset: 0;
	min-width: 375px;
	min-height: 350px;
	background-size: cover;
	background-position: center;
	isolation: auto;
 }

.desktop video.bg-video {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}
.desktop .video-warm-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #76421c;
  mix-blend-mode: soft-light;
  opacity: 0.3;
  z-index: 1;
  pointer-events: none;
  transition: opacity 2s ease-in-out;
}

/* ================================
   ICONS ON DESKTOP
   ================================ */
div.icons {
	position: absolute;
	inset: 0;
	bottom: 36px; /* Leave space for taskbar */
	overflow: hidden;
	z-index: 1;
}

div.icons .icon {
	position: absolute;
	padding: 15px 45px;
}

div.icons .icon span {
	color: #fff;
	text-shadow: #404040 1px 1px 3px,
	             #404040 1px -1px 3px,
	             #404040 -1px 1px 3px,
	             #404040 -1px -1px 3px;
}

div.icons .icon span:nth-of-type(2) {
	display: none; /* Likely a hidden tooltip or alt label */
}

div.icons .icon:hover span {
  text-shadow: 0 0 8px #f7fff7;
}


/* ================================
   CONTEXT MENU
   ================================ */

ul.context-menu {
  display: none;
  position: absolute;
  list-style: none;
  padding: 4px 1px;
  margin: 0;
  background: #333333;
  color: #f7fff7;
  z-index: 9999;
  font-size: 13px;
  border-top: 2px rgb(255, 235, 243, 0.6);
	border-style: outset;
	border-top-left-radius: 10px;
	border-bottom-right-radius: 10px;
}

ul.context-menu li {
  display: flex;
	align-items: center;
  padding: 6px 16px;
  cursor: pointer;
}

/* ================================
  IDLE-SCREEN   
   ================================ */

#sleep-screen {
	position: fixed;
	top: 0; left: 0;
	width: 100vw;
	height: 100vh;
	background-color: black;
	z-index: 2147483647; /* Max possible to ensure coverage */
	display: none;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.8s ease;
}

#sleep-screen.show {
	display: block;
	pointer-events: auto;
	opacity: 1;
}

#idle-video {
	width: 100vw;
	height: 100vh;
	object-fit: cover;
}

```

### `public\css\jquery-ui.css`

- **Size:** 17918 bytes
- **Extension:** `.css`

```css
/*! jQuery UI - v1.13.2 - 2023-04-03
* http://jqueryui.com
* Includes: draggable.css, core.css, resizable.css, slider.css, theme.css
* To view and modify this theme, visit http://jqueryui.com/themeroller/?scope=&folderName=base&cornerRadiusShadow=8px&offsetLeftShadow=0px&offsetTopShadow=0px&thicknessShadow=5px&opacityShadow=30&bgImgOpacityShadow=0&bgTextureShadow=flat&bgColorShadow=666666&opacityOverlay=30&bgImgOpacityOverlay=0&bgTextureOverlay=flat&bgColorOverlay=aaaaaa&iconColorError=cc0000&fcError=5f3f3f&borderColorError=f1a899&bgTextureError=flat&bgColorError=fddfdf&iconColorHighlight=777620&fcHighlight=777620&borderColorHighlight=dad55e&bgTextureHighlight=flat&bgColorHighlight=fffa90&iconColorActive=ffffff&fcActive=ffffff&borderColorActive=003eff&bgTextureActive=flat&bgColorActive=007fff&iconColorHover=555555&fcHover=2b2b2b&borderColorHover=cccccc&bgTextureHover=flat&bgColorHover=ededed&iconColorDefault=777777&fcDefault=454545&borderColorDefault=c5c5c5&bgTextureDefault=flat&bgColorDefault=f6f6f6&iconColorContent=444444&fcContent=333333&borderColorContent=dddddd&bgTextureContent=flat&bgColorContent=ffffff&iconColorHeader=444444&fcHeader=333333&borderColorHeader=dddddd&bgTextureHeader=flat&bgColorHeader=e9e9e9&cornerRadius=3px&fwDefault=normal&fsDefault=1em&ffDefault=Arial%2CHelvetica%2Csans-serif
* Copyright jQuery Foundation and other contributors; Licensed MIT */

.ui-draggable-handle{-ms-touch-action:none;touch-action:none}.ui-helper-hidden{display:none}.ui-helper-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.ui-helper-reset{margin:0;padding:0;border:0;outline:0;line-height:1.3;text-decoration:none;font-size:100%;list-style:none}.ui-helper-clearfix:before,.ui-helper-clearfix:after{content:"";display:table;border-collapse:collapse}.ui-helper-clearfix:after{clear:both}.ui-helper-zfix{width:100%;height:100%;top:0;left:0;position:absolute;opacity:0;-ms-filter:"alpha(opacity=0)"}.ui-front{z-index:100}.ui-state-disabled{cursor:default!important;pointer-events:none}.ui-icon{display:inline-block;vertical-align:middle;margin-top:-.25em;position:relative;text-indent:-99999px;overflow:hidden;background-repeat:no-repeat}.ui-widget-icon-block{left:50%;margin-left:-8px;display:block}.ui-widget-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.ui-resizable{position:relative}.ui-resizable-handle{position:absolute;font-size:0.1px;display:block;-ms-touch-action:none;touch-action:none}.ui-resizable-disabled .ui-resizable-handle,.ui-resizable-autohide .ui-resizable-handle{display:none}.ui-resizable-n{cursor:n-resize;height:7px;width:100%;top:-5px;left:0}.ui-resizable-s{cursor:s-resize;height:7px;width:100%;bottom:-5px;left:0}.ui-resizable-e{cursor:e-resize;width:7px;right:-5px;top:0;height:100%}.ui-resizable-w{cursor:w-resize;width:7px;left:-5px;top:0;height:100%}.ui-resizable-se{cursor:se-resize;width:12px;height:12px;right:1px;bottom:1px}.ui-resizable-sw{cursor:sw-resize;width:9px;height:9px;left:-5px;bottom:-5px}.ui-resizable-nw{cursor:nw-resize;width:9px;height:9px;left:-5px;top:-5px}.ui-resizable-ne{cursor:ne-resize;width:9px;height:9px;right:-5px;top:-5px}.ui-slider{position:relative;text-align:left}.ui-slider .ui-slider-handle{position:absolute;z-index:2;width:1.2em;height:1.2em;cursor:pointer;-ms-touch-action:none;touch-action:none}.ui-slider .ui-slider-range{position:absolute;z-index:1;font-size:.7em;display:block;border:0;background-position:0 0}.ui-slider.ui-state-disabled .ui-slider-handle,.ui-slider.ui-state-disabled .ui-slider-range{filter:inherit}.ui-slider-horizontal{height:.8em}.ui-slider-horizontal .ui-slider-handle{top:-.3em;margin-left:-.6em}.ui-slider-horizontal .ui-slider-range{top:0;height:100%}.ui-slider-horizontal .ui-slider-range-min{left:0}.ui-slider-horizontal .ui-slider-range-max{right:0}.ui-slider-vertical{width:.8em;height:100px}.ui-slider-vertical .ui-slider-handle{left:-.3em;margin-left:0;margin-bottom:-.6em}.ui-slider-vertical .ui-slider-range{left:0;width:100%}.ui-slider-vertical .ui-slider-range-min{bottom:0}.ui-slider-vertical .ui-slider-range-max{top:0}.ui-widget{font-family: 'Space Grotesk', sans-serif;font-size:1em}.ui-widget .ui-widget{font-size:1em}.ui-widget input,.ui-widget select,.ui-widget textarea,.ui-widget button{font-family: 'Space Grotesk', sans-serif;font-size:1em}.ui-widget.ui-widget-content{border:1px solid #c5c5c5}.ui-widget-content{border:1px solid #ddd;background:#fff;color:#333}.ui-widget-content a{color:#333}.ui-widget-header{border:1px solid #ddd;background:#e9e9e9;color:#333;font-weight:bold}.ui-widget-header a{color:#333}.ui-state-default,.ui-widget-content .ui-state-default,.ui-widget-header .ui-state-default,.ui-button,html .ui-button.ui-state-disabled:hover,html .ui-button.ui-state-disabled:active{border:1px solid #c5c5c5;background:#f6f6f6;font-weight:normal;color:#454545}.ui-state-default a,.ui-state-default a:link,.ui-state-default a:visited,a.ui-button,a:link.ui-button,a:visited.ui-button,.ui-button{color:#454545;text-decoration:none}.ui-state-hover,.ui-widget-content .ui-state-hover,.ui-widget-header .ui-state-hover,.ui-state-focus,.ui-widget-content .ui-state-focus,.ui-widget-header .ui-state-focus,.ui-button:hover,.ui-button:focus{border:1px solid #ccc;background:#ededed;font-weight:normal;color:#2b2b2b}.ui-state-hover a,.ui-state-hover a:hover,.ui-state-hover a:link,.ui-state-hover a:visited,.ui-state-focus a,.ui-state-focus a:hover,.ui-state-focus a:link,.ui-state-focus a:visited,a.ui-button:hover,a.ui-button:focus{color:#2b2b2b;text-decoration:none}.ui-visual-focus{box-shadow:0 0 3px 1px rgb(94,158,214)}.ui-state-active,.ui-widget-content .ui-state-active,.ui-widget-header .ui-state-active,a.ui-button:active,.ui-button:active,.ui-button.ui-state-active:hover{border:1px solid #003eff;background:#007fff;font-weight:normal;color:#fff}.ui-icon-background,.ui-state-active .ui-icon-background{border:#003eff;background-color:#fff}.ui-state-active a,.ui-state-active a:link,.ui-state-active a:visited{color:#fff;text-decoration:none}.ui-state-highlight,.ui-widget-content .ui-state-highlight,.ui-widget-header .ui-state-highlight{border:1px solid #dad55e;background:#fffa90;color:#777620}.ui-state-checked{border:1px solid #dad55e;background:#fffa90}.ui-state-highlight a,.ui-widget-content .ui-state-highlight a,.ui-widget-header .ui-state-highlight a{color:#777620}.ui-state-error,.ui-widget-content .ui-state-error,.ui-widget-header .ui-state-error{border:1px solid #f1a899;background:#fddfdf;color:#5f3f3f}.ui-state-error a,.ui-widget-content .ui-state-error a,.ui-widget-header .ui-state-error a{color:#5f3f3f}.ui-state-error-text,.ui-widget-content .ui-state-error-text,.ui-widget-header .ui-state-error-text{color:#5f3f3f}.ui-priority-primary,.ui-widget-content .ui-priority-primary,.ui-widget-header .ui-priority-primary{font-weight:bold}.ui-priority-secondary,.ui-widget-content .ui-priority-secondary,.ui-widget-header .ui-priority-secondary{opacity:.7;-ms-filter:"alpha(opacity=70)";font-weight:normal}.ui-state-disabled,.ui-widget-content .ui-state-disabled,.ui-widget-header .ui-state-disabled{opacity:.35;-ms-filter:"alpha(opacity=35)";background-image:none}.ui-state-disabled .ui-icon{-ms-filter:"alpha(opacity=35)"}.ui-icon{width:16px;height:16px}.ui-icon,.ui-widget-content .ui-icon{background-image:url("/images/ui-icons_444444_256x240.png")}.ui-widget-header .ui-icon{background-image:url("/images/ui-icons_444444_256x240.png")}.ui-state-hover .ui-icon,.ui-state-focus .ui-icon,.ui-button:hover .ui-icon,.ui-button:focus .ui-icon{background-image:url("/images/ui-icons_555555_256x240.png")}.ui-state-active .ui-icon,.ui-button:active .ui-icon{background-image:url("/images/ui-icons_ffffff_256x240.png")}.ui-state-highlight .ui-icon,.ui-button .ui-state-highlight.ui-icon{background-image:url("/images/ui-icons_777620_256x240.png")}.ui-state-error .ui-icon,.ui-state-error-text .ui-icon{background-image:url("/images/ui-icons_cc0000_256x240.png")}.ui-button .ui-icon{background-image:url("/images/ui-icons_777777_256x240.png")}.ui-icon-blank.ui-icon-blank.ui-icon-blank{background-image:none}.ui-icon-caret-1-n{background-position:0 0}.ui-icon-caret-1-ne{background-position:-16px 0}.ui-icon-caret-1-e{background-position:-32px 0}.ui-icon-caret-1-se{background-position:-48px 0}.ui-icon-caret-1-s{background-position:-65px 0}.ui-icon-caret-1-sw{background-position:-80px 0}.ui-icon-caret-1-w{background-position:-96px 0}.ui-icon-caret-1-nw{background-position:-112px 0}.ui-icon-caret-2-n-s{background-position:-128px 0}.ui-icon-caret-2-e-w{background-position:-144px 0}.ui-icon-triangle-1-n{background-position:0 -16px}.ui-icon-triangle-1-ne{background-position:-16px -16px}.ui-icon-triangle-1-e{background-position:-32px -16px}.ui-icon-triangle-1-se{background-position:-48px -16px}.ui-icon-triangle-1-s{background-position:-65px -16px}.ui-icon-triangle-1-sw{background-position:-80px -16px}.ui-icon-triangle-1-w{background-position:-96px -16px}.ui-icon-triangle-1-nw{background-position:-112px -16px}.ui-icon-triangle-2-n-s{background-position:-128px -16px}.ui-icon-triangle-2-e-w{background-position:-144px -16px}.ui-icon-arrow-1-n{background-position:0 -32px}.ui-icon-arrow-1-ne{background-position:-16px -32px}.ui-icon-arrow-1-e{background-position:-32px -32px}.ui-icon-arrow-1-se{background-position:-48px -32px}.ui-icon-arrow-1-s{background-position:-65px -32px}.ui-icon-arrow-1-sw{background-position:-80px -32px}.ui-icon-arrow-1-w{background-position:-96px -32px}.ui-icon-arrow-1-nw{background-position:-112px -32px}.ui-icon-arrow-2-n-s{background-position:-128px -32px}.ui-icon-arrow-2-ne-sw{background-position:-144px -32px}.ui-icon-arrow-2-e-w{background-position:-160px -32px}.ui-icon-arrow-2-se-nw{background-position:-176px -32px}.ui-icon-arrowstop-1-n{background-position:-192px -32px}.ui-icon-arrowstop-1-e{background-position:-208px -32px}.ui-icon-arrowstop-1-s{background-position:-224px -32px}.ui-icon-arrowstop-1-w{background-position:-240px -32px}.ui-icon-arrowthick-1-n{background-position:1px -48px}.ui-icon-arrowthick-1-ne{background-position:-16px -48px}.ui-icon-arrowthick-1-e{background-position:-32px -48px}.ui-icon-arrowthick-1-se{background-position:-48px -48px}.ui-icon-arrowthick-1-s{background-position:-64px -48px}.ui-icon-arrowthick-1-sw{background-position:-80px -48px}.ui-icon-arrowthick-1-w{background-position:-96px -48px}.ui-icon-arrowthick-1-nw{background-position:-112px -48px}.ui-icon-arrowthick-2-n-s{background-position:-128px -48px}.ui-icon-arrowthick-2-ne-sw{background-position:-144px -48px}.ui-icon-arrowthick-2-e-w{background-position:-160px -48px}.ui-icon-arrowthick-2-se-nw{background-position:-176px -48px}.ui-icon-arrowthickstop-1-n{background-position:-192px -48px}.ui-icon-arrowthickstop-1-e{background-position:-208px -48px}.ui-icon-arrowthickstop-1-s{background-position:-224px -48px}.ui-icon-arrowthickstop-1-w{background-position:-240px -48px}.ui-icon-arrowreturnthick-1-w{background-position:0 -64px}.ui-icon-arrowreturnthick-1-n{background-position:-16px -64px}.ui-icon-arrowreturnthick-1-e{background-position:-32px -64px}.ui-icon-arrowreturnthick-1-s{background-position:-48px -64px}.ui-icon-arrowreturn-1-w{background-position:-64px -64px}.ui-icon-arrowreturn-1-n{background-position:-80px -64px}.ui-icon-arrowreturn-1-e{background-position:-96px -64px}.ui-icon-arrowreturn-1-s{background-position:-112px -64px}.ui-icon-arrowrefresh-1-w{background-position:-128px -64px}.ui-icon-arrowrefresh-1-n{background-position:-144px -64px}.ui-icon-arrowrefresh-1-e{background-position:-160px -64px}.ui-icon-arrowrefresh-1-s{background-position:-176px -64px}.ui-icon-arrow-4{background-position:0 -80px}.ui-icon-arrow-4-diag{background-position:-16px -80px}.ui-icon-extlink{background-position:-32px -80px}.ui-icon-newwin{background-position:-48px -80px}.ui-icon-refresh{background-position:-64px -80px}.ui-icon-shuffle{background-position:-80px -80px}.ui-icon-transfer-e-w{background-position:-96px -80px}.ui-icon-transferthick-e-w{background-position:-112px -80px}.ui-icon-folder-collapsed{background-position:0 -96px}.ui-icon-folder-open{background-position:-16px -96px}.ui-icon-document{background-position:-32px -96px}.ui-icon-document-b{background-position:-48px -96px}.ui-icon-note{background-position:-64px -96px}.ui-icon-mail-closed{background-position:-80px -96px}.ui-icon-mail-open{background-position:-96px -96px}.ui-icon-suitcase{background-position:-112px -96px}.ui-icon-comment{background-position:-128px -96px}.ui-icon-person{background-position:-144px -96px}.ui-icon-print{background-position:-160px -96px}.ui-icon-trash{background-position:-176px -96px}.ui-icon-locked{background-position:-192px -96px}.ui-icon-unlocked{background-position:-208px -96px}.ui-icon-bookmark{background-position:-224px -96px}.ui-icon-tag{background-position:-240px -96px}.ui-icon-home{background-position:0 -112px}.ui-icon-flag{background-position:-16px -112px}.ui-icon-calendar{background-position:-32px -112px}.ui-icon-cart{background-position:-48px -112px}.ui-icon-pencil{background-position:-64px -112px}.ui-icon-clock{background-position:-80px -112px}.ui-icon-disk{background-position:-96px -112px}.ui-icon-calculator{background-position:-112px -112px}.ui-icon-zoomin{background-position:-128px -112px}.ui-icon-zoomout{background-position:-144px -112px}.ui-icon-search{background-position:-160px -112px}.ui-icon-wrench{background-position:-176px -112px}.ui-icon-gear{background-position:-192px -112px}.ui-icon-heart{background-position:-208px -112px}.ui-icon-star{background-position:-224px -112px}.ui-icon-link{background-position:-240px -112px}.ui-icon-cancel{background-position:0 -128px}.ui-icon-plus{background-position:-16px -128px}.ui-icon-plusthick{background-position:-32px -128px}.ui-icon-minus{background-position:-48px -128px}.ui-icon-minusthick{background-position:-64px -128px}.ui-icon-close{background-position:-80px -128px}.ui-icon-closethick{background-position:-96px -128px}.ui-icon-key{background-position:-112px -128px}.ui-icon-lightbulb{background-position:-128px -128px}.ui-icon-scissors{background-position:-144px -128px}.ui-icon-clipboard{background-position:-160px -128px}.ui-icon-copy{background-position:-176px -128px}.ui-icon-contact{background-position:-192px -128px}.ui-icon-image{background-position:-208px -128px}.ui-icon-video{background-position:-224px -128px}.ui-icon-script{background-position:-240px -128px}.ui-icon-alert{background-position:0 -144px}.ui-icon-info{background-position:-16px -144px}.ui-icon-notice{background-position:-32px -144px}.ui-icon-help{background-position:-48px -144px}.ui-icon-check{background-position:-64px -144px}.ui-icon-bullet{background-position:-80px -144px}.ui-icon-radio-on{background-position:-96px -144px}.ui-icon-radio-off{background-position:-112px -144px}.ui-icon-pin-w{background-position:-128px -144px}.ui-icon-pin-s{background-position:-144px -144px}.ui-icon-play{background-position:0 -160px}.ui-icon-pause{background-position:-16px -160px}.ui-icon-seek-next{background-position:-32px -160px}.ui-icon-seek-prev{background-position:-48px -160px}.ui-icon-seek-end{background-position:-64px -160px}.ui-icon-seek-start{background-position:-80px -160px}.ui-icon-seek-first{background-position:-80px -160px}.ui-icon-stop{background-position:-96px -160px}.ui-icon-eject{background-position:-112px -160px}.ui-icon-volume-off{background-position:-128px -160px}.ui-icon-volume-on{background-position:-144px -160px}.ui-icon-power{background-position:0 -176px}.ui-icon-signal-diag{background-position:-16px -176px}.ui-icon-signal{background-position:-32px -176px}.ui-icon-battery-0{background-position:-48px -176px}.ui-icon-battery-1{background-position:-64px -176px}.ui-icon-battery-2{background-position:-80px -176px}.ui-icon-battery-3{background-position:-96px -176px}.ui-icon-circle-plus{background-position:0 -192px}.ui-icon-circle-minus{background-position:-16px -192px}.ui-icon-circle-close{background-position:-32px -192px}.ui-icon-circle-triangle-e{background-position:-48px -192px}.ui-icon-circle-triangle-s{background-position:-64px -192px}.ui-icon-circle-triangle-w{background-position:-80px -192px}.ui-icon-circle-triangle-n{background-position:-96px -192px}.ui-icon-circle-arrow-e{background-position:-112px -192px}.ui-icon-circle-arrow-s{background-position:-128px -192px}.ui-icon-circle-arrow-w{background-position:-144px -192px}.ui-icon-circle-arrow-n{background-position:-160px -192px}.ui-icon-circle-zoomin{background-position:-176px -192px}.ui-icon-circle-zoomout{background-position:-192px -192px}.ui-icon-circle-check{background-position:-208px -192px}.ui-icon-circlesmall-plus{background-position:0 -208px}.ui-icon-circlesmall-minus{background-position:-16px -208px}.ui-icon-circlesmall-close{background-position:-32px -208px}.ui-icon-squaresmall-plus{background-position:-48px -208px}.ui-icon-squaresmall-minus{background-position:-64px -208px}.ui-icon-squaresmall-close{background-position:-80px -208px}.ui-icon-grip-dotted-vertical{background-position:0 -224px}.ui-icon-grip-dotted-horizontal{background-position:-16px -224px}.ui-icon-grip-solid-vertical{background-position:-32px -224px}.ui-icon-grip-solid-horizontal{background-position:-48px -224px}.ui-icon-gripsmall-diagonal-se{background-position:-64px -224px}.ui-icon-grip-diagonal-se{background-position:-80px -224px}.ui-corner-all,.ui-corner-top,.ui-corner-left,.ui-corner-tl{border-top-left-radius:3px}.ui-corner-all,.ui-corner-top,.ui-corner-right,.ui-corner-tr{border-top-right-radius:3px}.ui-corner-all,.ui-corner-bottom,.ui-corner-left,.ui-corner-bl{border-bottom-left-radius:3px}.ui-corner-all,.ui-corner-bottom,.ui-corner-right,.ui-corner-br{border-bottom-right-radius:3px}.ui-widget-overlay{background:#aaa;opacity:.3;-ms-filter:Alpha(Opacity=30)}.ui-widget-shadow{-webkit-box-shadow:0 0 5px #666;box-shadow:0 0 5px #666}
```

### `public\css\taida.css`

- **Size:** 2500 bytes
- **Extension:** `.css`

```css
/* ------------------------------------------------------
   GLOBAL RULES
------------------------------------------------------- */
body {
	user-select: none;
}

html, body {
	height: 100%;
}

/* ------------------------------------------------------
   TAIDA CORE UI
------------------------------------------------------- */
div.ui-draggable-dragging div.plus {
	width: 15px;
	height: 15px;
	text-align: center;
	line-height: 14px;
	border: 1px solid #000000;
	background-color: #ffffff;
	margin-bottom: -15px;
	position: absolute;
	left: 80px;
	top: 50px;
}

div.taida_dialog img.about {
	float: right;
	width: 75px;
	height: 75px;
}

/* ------------------------------------------------------
   NOTIFICATION SCREEN
   - full-screen info panels and warnings
------------------------------------------------------- */
body.notification-screen {
	background-color: #a0a0a0;
	background-image: url(/images/background.jpg);
	background-size: cover;
	background-position: center;
	padding: 50px 25px 0 25px;
}

.notification .content {
	display: block;
	width: 100%;
	max-width: 500px;
	background-color: #e0e0e0;
	border: 1px solid #404040;
	border-radius: 4px;
	padding: 25px;
	margin: 0 auto;
}

@media (min-width: 992px) {
	.notification {
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
	}
}

.notification h1 {
	margin: 0 0 20px 0;
}

.notification h1::after {
	background-image: url(/images/taidasansfond.png);
	background-size: 50px 50px;
	display: block;
	float: right;
	width: 50px;
	height: 50px;
	content: "";
}

p.warning {
	color: #ff0000;
}

.notification .btn-group {
	margin-top: 15px;
}

.notification .btn-group button {
	padding: 5px 25px;
}

/* ------------------------------------------------------
   LOGIN SCREEN
------------------------------------------------------- */
body.login div.content:first-child {
	background-image: none;
	margin-bottom: 50px;
}

body.login h1:after {
	background-image: none;
}

body.login div.source {
	margin-top: -20px;
	text-align: right;
}

body.login div.source a {
	color: #a0a0a0;
}

/* ------------------------------------------------------
   MISCELLANEOUS / LEGACY
------------------------------------------------------- */
/* Legacy button styling from old taida button component */
.taida-btn {
	background-image: linear-gradient(to bottom, #fff 0, #e0e0e0 100%);
}
```

### `public\css\taskbar.css`

- **Size:** 4871 bytes
- **Extension:** `.css`

```css
/* Taskbar
 */
div.taskbar {
	display: flex;
	align-items: center;
	position:absolute;
	right:0;
	bottom:0;
	left:0;
	height:44px;
	background: rgb(247, 255, 247, 0.15);
	z-index:2;
	border-top: 2px rgb(255, 235, 243, 0.6);
	border-bottom: 0px;
	border-style: outset;
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
	color: #f7f7f7;
	box-shadow: 0 4px 30px rgb(51, 51, 51, 0.6);
}

div.taskbar div.overlay {
	position:absolute;
	top:0;
	right:0;
	bottom:0;
	left:0;
	background-color:rgba(0, 0, 0, 0.5);
}

/* Start button
 */
div.taskbar div.start {
	mask-image: url(/images/taidasansfond.png);
	width:36px;
	margin:11px;
	height:36px;
	justify-content: center;
	background-color: #f7fff7;
	box-shadow: none;
	mask-repeat: no-repeat;
	mask-size: contain;
	mask-position: center;
	cursor: pointer;
	box-shadow: 4px rgb(51, 51, 51, 0.6);
}

div.taskbar div.start:hover {
  background-color: #ffebf3b0; 
}

/* Start menu
 */

div.taskbar div.startmenu {
	position:absolute;
	bottom:51px;
	width:220px;
	height:285px;
	background: rgb(247, 255, 247, 0.15);
	display:none;
	border-top: 3px rgb(255, 235, 243, 0.6);
	border-style: outset;
	border-top-left-radius: 10px;
	border-bottom-right-radius: 10px;
}

div.taskbar div.startmenu div.system {
	position:absolute;
	width:35px;
	height:inherit;
	background: rgb(247, 255, 247, 0.015);
	padding:10px 5px 0px 5px;
}

div.taskbar div.startmenu div.system img.icon {
	width:24px;
	height:24px;
	cursor:pointer;
	margin-bottom:10px;
}

div.taskbar div.startmenu div.system img[title=Logout] {
	position:absolute;
	bottom:0;
	left:5px;
	margin-bottom:5px;
}

div.taskbar div.startmenu div.applications {
    margin-left: 35px;   /* margin instead of shifting position */
    width: calc(100% - 35px);
    height: calc(100% - 1px);
	overflow-y:scroll;
	scrollbar-width: none;
	background-color:#333333;
	border-bottom-right-radius: 10px;
}

div.taskbar div.startmenu div.applications ::-webkit-scrollbar {
    display: none;            /* Chrome, Safari, Edge */
}

div.taskbar div.startmenu div.applications div.application {
	align-items: center;
	justify-content: left;
	color:#f7fff7;
	padding:10px 10px;
	cursor:pointer;
	overflow-x:hidden;
	text-overflow:ellipsis;
	display: flex;
}

div.taskbar div.startmenu div.applications div.application:hover {
	text-shadow: 0 0 3px #f7fff7;
	border: none;
	border-left: 3px outset rgb(255, 235, 243, 0.6);
}

div.taskbar div.startmenu div.applications div.application img.icon {
	width:20px;
	height:20px;
	margin-right:10px;
}

/* Tasks
 */
div.taskbar div.tasks {
	display: flex;
	align-items: center;
	gap: 6px;              /* 👈 Spacing between individual .task buttons */
	overflow: hidden;
	position: absolute;
	right: 80px;
	left: 61px;
	height: 40px;
}

div.taskbar div.tasks div.task {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background-color: #ffebf32b;
  color: #f7fff7;
  height: 36px;

  padding: 0;                    /* Start with no padding */
  overflow: hidden;
  cursor: pointer;

  max-width:36px;
  min-width: 36px;               /* Force icon-only width */
  flex: 0 0 auto;                /* Prevent flex stretching */
  transition: max-width 0.2s ease, padding 0.2s ease;

  border-top: 1px solid rgb(247, 255, 247, 0.2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

div.taskbar div.tasks div.task img {
	width: 26px;
	height: 26px;
	margin: 0;                       /* ❌ Remove the vertical push */
	flex-shrink: 0;                  /* Prevent icon from shrinking */
}

div.taskbar div.tasks div.focus {
	color: #f7f7f7;
	text-shadow: 2px #ffebf3;
}

div.taskbar div.tasks div.minimized {
	color:#f7fff7;
	font-style:italic;
	background-color:#3c32329e;
}

/* Hide the text title inside each task by default */
div.taskbar div.tasks div.task span {
  opacity: 0;
  margin-left: 0px;
  overflow: hidden;
  max-width: 0px;
}

div.taskbar div.tasks div.task:hover {
  width: fit-content;
  max-width: 240px;                 /* Allow expansion on hover */
  padding: 0 10px;
  justify-content: left;
  background-color:#303030;
  margin-left: 6px;
  box-shadow: 0 0 3px #ffebf3;
  transition: opacity 1s ease-in-out, max-width 0.3s ease;
}

div.taskbar div.tasks div.task:hover span {
  width: fit-content;
  opacity: 1;
  max-width: 240px;
  justify-content: left;
  margin-left: 6px;
}

/* Clock
 */
div.taskbar div.clock {
	position:absolute;
	align-items: center;
	right: 11px;
	color:#f7fff7;
	text-align:right;
	font-size:12px;
	font-weight: bold;
	box-shadow: 4px rgb(51, 51, 51, 0.6);
}
```

### `public\css\theme.css`

- **Size:** 11400 bytes
- **Extension:** `.css`

```css
/* ============================
   TAIDA THEME.CSS — BOOTSTRAP REPLACEMENT
   Clean, commented, and complete
   Bootstrap 3.4.1 functionality without the bloat
   ============================ */

/* === import fonts === */

@font-face {
  font-family: 'Space Grotesk';
  src: url('../fonts/SpaceGrotesk-VariableFont_wght.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}

@font-face {
  font-family: 'VT323';
  src: url('../fonts/VT323-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'DotGothic16';
  src: url('../fonts/DotGothic16-Regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

/* Taskbar icon-title horizontal layout */
.taskbar-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.taskbar-icon img {
  width: 20px;
  height: 20px;
}
.taskbar-icon span {
  font-weight: 500;
}

/* Start menu icon-title horizontal layout */
.start-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
}
.start-menu-item img {
  width: 20px;
  height: 20px;
}
.start-menu-item span {
  font-weight: 500;
}

/* Window header fix */
.window-header img {
  width: 16px;
  height: 16px;
}

/* Window menu bar fix */
.window-menu {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  background-color: #333333;
  border-bottom: 1px solid #ffebf3;
  font-size: 0.875rem;
}
.window-menu button {
  all: unset;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #283e28;
  border-radius: 2px;
}
.window-menu button:hover {
  background-color: #f7fff7;
}

/* === 1. RESET & BOX MODEL === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  line-height: normal;
  background-color: transparent;
  color: #333333;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* === 2. TYPOGRAPHY === */

h1, h2, h3, h4, h5, h6 {
  margin: 0 0 1rem 0;
  font-weight: 600;
  line-height: 1.2;
}
h1 { font-size: 2.25rem; }
h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }

p { margin-bottom: 1rem; }

ul, ol {
  margin: 0 0 0rem 0rem;
}
li {
  margin-bottom: 0rem;
}
ul { list-style: disc; }
ol { list-style: decimal; }

/* === 3. BUTTONS === */
button {
  all: unset;
  cursor: pointer;
}
.taida-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f7fff7;
  color: #333333;
  text-align: center;
}
.taida-btn:hover {
  background: #ffebf3;
}
.taida-btn:disabled {
  background: #333333;
  cursor: not-allowed;
}

/* === 4. FORMS === */
input, textarea, select {
  font: inherit;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  background-color: white;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #283e28;
  box-shadow: 0 0 0 2px rgba(41,128,185,0.2);
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.form-group {
  margin-bottom: 1rem;
}
.form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.form-horizontal .form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* === 5. TABLES === */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
th, td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}
thead {
  background-color: #f4f4f4;
  font-weight: 600;
}

/* === 6. LAYOUT SYSTEM === */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -15px;
  margin-right: -15px;
}
[class*="col-"] {
  padding-left: 15px;
  padding-right: 15px;
}
.col-1  { flex: 0 0 8.333%;  max-width: 8.333%; }
.col-2  { flex: 0 0 16.666%; max-width: 16.666%; }
.col-3  { flex: 0 0 25%;     max-width: 25%; }
.col-4  { flex: 0 0 33.333%; max-width: 33.333%; }
.col-5  { flex: 0 0 41.666%; max-width: 41.666%; }
.col-6  { flex: 0 0 50%;     max-width: 50%; }
.col-7  { flex: 0 0 58.333%; max-width: 58.333%; }
.col-8  { flex: 0 0 66.666%; max-width: 66.666%; }
.col-9  { flex: 0 0 75%;     max-width: 75%; }
.col-10 { flex: 0 0 83.333%; max-width: 83.333%; }
.col-11 { flex: 0 0 91.666%; max-width: 91.666%; }
.col-12 { flex: 0 0 100%;    max-width: 100%; }

/* === 7. UTILITIES === */
.text-left   { text-align: left; }
.text-center { text-align: center; }
.text-right  { text-align: right; }
.text-muted   { color: #777; }
.text-primary { color: #2980b9; }
.text-danger  { color: #c0392b; }
.hidden { display: none !important; }
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* === 8. ALERTS === */
.alert {
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.alert-success { background-color: #dff0d8; border-color: #d6e9c6; color: #3c763d; }
.alert-info    { background-color: #d9edf7; border-color: #bce8f1; color: #31708f; }
.alert-warning { background-color: #fcf8e3; border-color: #faebcc; color: #8a6d3b; }
.alert-danger  { background-color: #f2dede; border-color: #ebccd1; color: #a94442; }

/* === 9. FLEXBOX HELPERS === */
.flex         { display: flex; }
.flex-row     { flex-direction: row; }
.flex-col     { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-1        { gap: 0.5rem; }
.gap-2        { gap: 1rem; }

/* === 10. ICON-LABEL INLINE === */
.icon-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* === 11. COMPONENTS: BADGES, LABELS === */
.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  background-color: #777;
  border-radius: 0.25rem;
}
.label {
  display: inline;
  padding: 0.2em 0.6em 0.3em;
  font-size: 75%;
  font-weight: 700;
  color: #fff;
  background-color: #777;
  border-radius: 0.25rem;
}

/* === 12. CONTAINER === */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* === 13. NAVBAR === */
.navbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.navbar-brand {
  font-weight: bold;
  margin-right: 1rem;
}
.navbar-nav {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1rem;
}
.navbar-nav li a {
  text-decoration: none;
  padding: 0.5rem;
  display: block;
}

/* === 14. PAGINATION === */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 4px;
}
.pagination li {
  margin: 0 0.25rem;
}
.pagination li a {
  display: block;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #007bff;
}
.pagination li a:hover {
  background-color: #e9ecef;
}

/* === 15. MODAL (requires JS) === */
.modal {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal.active {
  display: flex;
}
.modal-dialog {
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
}
.modal-header,
.modal-body,
.modal-footer {
  margin-bottom: 1rem;
}
.modal-header {
  font-weight: bold;
  font-size: 1.25rem;
}

/* === 16. BREADCRUMB === */
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  list-style: none;
  background-color: #e9ecef;
  border-radius: 4px;
}
.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  padding: 0 0.5rem;
  color: #6c757d;
}
/* === BOOTSTRAP THEME MERGE ADDITIONS === */

/* BUTTONS - Bootstrap-style buttons */
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  border: 1px solid transparent;
  border-radius: 4px;
  user-select: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn:focus,
.btn:hover {
  text-decoration: none;
}

.btn:disabled,
.btn.disabled,
fieldset:disabled .btn {
  cursor: not-allowed;
  opacity: 0.65;
  box-shadow: none;
}

.btn-default {
  background-color: #e0e0e0;
  border-color: #ccc;
  color: #333;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);
}
.btn-default:hover,
.btn-default:focus {
  background-color: #d6d6d6;
  border-color: #adadad;
}

.btn-primary {
  background-color: #337ab7;
  border-color: #2e6da4;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 1px rgba(0,0,0,0.075);
}
.btn-primary:hover,
.btn-primary:focus {
  background-color: #286090;
  border-color: #204d74;
}

.btn-success {
  background-color: #5cb85c;
  border-color: #4cae4c;
  color: #fff;
}
.btn-success:hover,
.btn-success:focus {
  background-color: #449d44;
  border-color: #398439;
}

.btn-info {
  background-color: #5bc0de;
  border-color: #46b8da;
  color: #fff;
}
.btn-info:hover,
.btn-info:focus {
  background-color: #31b0d5;
  border-color: #269abc;
}

.btn-warning {
  background-color: #f0ad4e;
  border-color: #eea236;
  color: #fff;
}
.btn-warning:hover,
.btn-warning:focus {
  background-color: #ec971f;
  border-color: #d58512;
}

.btn-danger {
  background-color: #d9534f;
  border-color: #d43f3a;
  color: #fff;
}
.btn-danger:hover,
.btn-danger:focus {
  background-color: #c9302c;
  border-color: #ac2925;
}

.btn .badge {
  color: #fff;
  background-color: transparent;
}

/* ALERTS with gradient shading */
.alert {
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.05);
  text-shadow: 0 1px 0 rgba(255,255,255,0.2);
}

/* PANELS */
.panel {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.panel-default > .panel-heading {
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom, #f5f5f5 0%, #e8e8e8 100%);
  border-bottom: 1px solid #ddd;
}
.panel-primary > .panel-heading {
  background-color: #337ab7;
  background-image: linear-gradient(to bottom, #337ab7 0%, #2e6da4 100%);
  color: #fff;
  border-color: #2e6da4;
}

/* THUMBNAILS */
.thumbnail,
.img-thumbnail {
  box-shadow: 0 1px 2px rgba(0,0,0,0.075);
}

/* NAVBAR SHADOWS */
.navbar-default {
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 5px rgba(0,0,0,0.075);
  background-image: linear-gradient(to bottom, #fff 0%, #f8f8f8 100%);
}
.navbar-inverse {
  background-image: linear-gradient(to bottom, #3c3c3c 0%, #222 100%);
}
.navbar-inverse .navbar-nav > li > a {
  text-shadow: 0 -1px 0 rgba(0,0,0,0.25);
}
.navbar-brand {
  text-shadow: 0 1px 0 rgba(255,255,255,0.25);
}
```

### `public\css\windows.css`

- **Size:** 6943 bytes
- **Extension:** `.css`

```css
/* Windows
 */
div.windows {
	position:absolute;
	top:0;
	right:0;
	bottom:36px;
	left:0;
	overflow:hidden;
}

div.windows > div.overlay {
	position:absolute;
	top:0;
	right:0;
	bottom:0;
	left:0;
	background-color:rgba(0, 0, 0, 0.325);
}

div.windows div.window {
	min-width:200px;
	min-height:150px;
	outline:none;
	transform-origin:top left;
	background-color: #333333;
  	color: #f7fff7;
	border-style: outset;
	border-width: 3px;
	border-color: #ffebf3;
	box-shadow: 0 0 0 6px #333333, 0 10px 20px rgba(0, 255, 255, 0.08);
}

div.windows div.window div.window-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height:30px;
	padding:5px 15px 5px 15px;
	gap: 0.5rem;
	border-top-left-radius:inherit;
	border-top-right-radius:inherit;
	cursor:default;
	background-color: #333333;
  	color: #ffebf3;
	border-bottom: 1px solid #f7fff7;
}

div.windows div.window div.window-header img.icon {
	width:22px;
	height:22px;
	position:relative;
}

div.windows div.window div.window-header div.title {
	flex: 1;
	display: inline-block;
	font-size:14px;
	overflow:hidden;
	text-overflow:ellipsis;
	white-space:nowrap;
	max-width:calc(100% - 100px);
	transition: text-shadow 0.2s ease;
}

div.windows div.window.focus div.window-header div.title {
	text-shadow: 0 0 2px #ffebf3;
	transition: text-shadow 0.2s ease;
}

div.windows div.window div.window-header span {
	float:right;
	padding-top:1px;
	font-size:16px;
	color:#333333;
	margin-left:10px;
}

div.windows div.window div.window-body {
	position:relative;
	max-height: 90vh;
    overflow-y: auto;
	overflow: hidden;
	height:calc(100% - 30px);
	padding:10px;
}

div.windows div.window ul.nav + div.window-body {
	height:calc(100% - 61px);
}
/* Menu bar
 */

div.windows div.window ul.nav {
  display: flex;
  align-items: center;
  height: 32px;
  margin: 0;
  border-bottom: 1px solid #ffebf3;
  gap: 0.2 rem;
  list-style: none;
}

div.windows div.window ul.nav li {
  list-style: none;
  align-items: center;
}

div.windows div.window ul.nav li.selected a {
  color: #ff6666;
}

div.windows div.window ul.nav li.open a.dropdown-toggle {
  background-color: #333333;
}

div.windows div.window ul.nav li.dropdown {
  position: relative;
}

div.windows div.window ul.nav a.dropdown-toggle {
  all: unset;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 16px;
  cursor: pointer;
  color:#f7fff7;
  background-color: #333333;
  transition: background-color color 0.2s ease;
}

div.windows div.window ul.nav a.dropdown-toggle:hover {
  background-color: #ffebf3;
  color: #333333;
}


div.windows div.window ul.nav li.dropdown .dropdown-menu {
  position: absolute;
  top: 100%; /* Show just below the tab */
  left: 0;
  display: none;
  z-index: 1000;
  padding: 4px 0;
  min-width: 150px;
  width: max-content;
  background-color: #333333;
  border: 1px solid #ffebf3;
  box-shadow: 0 0 3px rgba(255, 235, 243, 0.5);
  transition: 0.1s ease;
}

div.windows div.window ul.dropdown-menu li a {
  all: unset;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

div.windows div.window ul.dropdown-menu li a:hover {
  background-color: #f7fff7;
  color: #333333;
}

/* Window with iframe
 */
div.windows div.window iframe {
	border:none;
	width:100%;
	height:100%;
}

/* Alert
 */
div.taida_dialog {
	padding:10px;
}

div.taida_dialog div.message {
	min-height:35px;
}

div.taida_dialog div.btn-group {
	margin-top:15px;
	margin-bottom:0;
}

div.taida_dialog div.btn-group input {
	padding:5px 25px;
}

ul.nav.nav-tabs {
    display: flex;
    align-items: center; /* Vertical centering */
    height: 100%;         /* Ensures tab height is consistent */
}

ul.nav.nav-tabs li {
    display: flex;
    align-items: center;
    height: 100%;
}

ul.nav.nav-tabs li a {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    height: 100%;
}

/* File Dialog – File browsers inside window environment */

/* Icon
 */
div.file-icon {
	width:50px;
	box-sizing:content-box;
}

div.file-icon img {
	width:inherit;
	height:50px;
	margin-bottom:5px;
}

div.file-icon img + img {
	margin:0 -50px;
}

div.detail img + img {
	margin:0 -14px;
}

div.file-icon span {
	font-size:12px;
	text-align:center;
	display:block;
	width:70px;
	overflow:hidden;
	text-overflow:ellipsis;
	max-height:50px;
	margin-left:-10px;
}

div.file-icon:hover span {
	max-height:70px;
}

/* File dialog
 */
div.file_dialog {
	position:relative;
	height:100%;
}

div.file_dialog button.up {
	position:absolute;
	top:0;
	right:0;
	left:0;
	width:25px;
	height:25px;
}

div.file_dialog div.path {
	border:1px solid #cccccc;
	position:absolute;
	top:0;
	right:0;
	left:35px;
	height:25px;
	padding:2px 5px;
	cursor:default;
}

div.file_dialog div.filename {
	position:absolute;
	right:0;
	bottom:0;
	left:210px;
}

/* Directory tree
 */
div.file_dialog div.directories {
	border:1px solid #cccccc;
	position:absolute;
	top:35px;
	bottom:45px;
	left:0;
	width:200px;
	padding:5px;
	overflow:auto;
}

div.file_dialog div.directories div.directory {
	padding:1px 5px;
	cursor:default;
	padding-left:15px;
	text-indent:-10px;
}

div.file_dialog div.directories div.directory img {
	width:14px;
	height:14px;
	position:relative;
	left:-4px;
	top:-2px;
	margin-right:2px;
}

div.file_dialog div.directories div.directory:hover {
	background-color:#e8e8f4;
}

/* Files list
*/
div.file_dialog div.files {
	border:1px solid #cccccc;
	position:absolute;
	top:35px;
	right:0;
	bottom:45px;
	left:210px;
	overflow:auto;
}

div.file_dialog div.files div.icon {
	margin:25px 15px 0 25px;
	height:100px;
	float:left;
}

/* Buttons
*/

.window-buttons {
	display: flex;
	gap: 4px; /* optional spacing between buttons */
}

.window-btn {
  display: inline-block;
  width: 16px;    /* fixed size to match icon */
  height: 16px;
  background-color: #ffebf3; /* this sets the icon color */
  mask-repeat: no-repeat;
  mask-size: contain;
  mask-position: center;
  cursor: pointer;
}

.window-btn.minimize-btn {
  mask-image: url("../images/minimize.svg");
}

.window-btn.maximize-btn {
  mask-image: url("../images/maximize.svg");
}

.window-btn.close-btn {
  mask-image: url("../images/close.svg");
}

.window-btn:hover {
  background-color: #ffebf3b0; 
  filter: drop-shadow(0 0 8px #f7fff7);
  transition: filter 0.3s ease;
}

div.file_dialog div.btn-group {
	position:absolute;
	bottom:0;
	left:0;
	width:200px;
}

div.file_dialog div.btn-group input {
	width:50%;
}


```

### `public\index.php`

- **Size:** 1896 bytes
- **Extension:** `.php`

```php
<?php
	/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
	 * This file is part of the Taida web desktop
	 * https://gitlab.com/hsleisink/taida
	 *
	 * Licensed under the GPLv2 License
	 */

	namespace Taida;

	ob_start();

	session_name("Taida");
	$options = array(
		"lifetime" => 0,
		"path"     => "/",
		"domain"   => "",
		"secure"   => true,
		"httponly" => true,
		"samesite" => "none");
	session_set_cookie_params($options);
	session_start();

	require "../libraries/error.php";
	require "../libraries/general.php";
	spl_autoload_register("autoloader");
	require "../libraries/taida.php";
	require "../libraries/user_website.php";

	$view = new view();

	$view->open_tag("output", array(
		"version" => TAIDA_VERSION,
		"title"   => TITLE,
		"debug"   => show_boolean(DEBUG_MODE)));

	$login = new login($view);
	$user_website = new user_website($view);

	if ($user_website->requested()) {
		/* Show user website
		 */
		$xslt_file = $user_website->execute();
	} else if ($login->valid() == false) {
		/* Authentication
		 */
		$xslt_file = $login->execute();
	} else {
		/* User script
		 */
		$user_script = HOME_ROOT."/".$login->username.".php";
		if (file_exists($user_script)) {
			include $user_script;
		}

		/* Create desktop
		 */
		$desktop = new desktop($view, $login->username);
		$xslt_file = $desktop->execute();
	}

	if (($errors = ob_get_contents()) != "") {
		if (is_true(DEBUG_MODE)) {
			$view->add_error($errors);
		} else {
			taida_log_error($errors, $login->username);
		}
	}

	$view->close_tag();

	ob_clean();

	/* Generate output
	 */
	$html = $view->generate($xslt_file);
	$xslt_errors = ob_get_clean();

	if ($xslt_errors != "") {
		header_remove("Content-Encoding");
		header_remove("Content-Length");
		throw new \Exception($xslt_errors);
	} else {
		print $html;
	}
?>
```

### `public\js\desktop.js`

- **Size:** 14446 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

var _taida_desktop_path;
var taida_read_only;
let bgVideo = null;


/* Icon
 */
function taida_icon_coord_to_grid(coord, grid_size) {
	var delta = coord % grid_size;
	coord -= delta;

	if (delta > (grid_size >> 1)) {
		coord += grid_size;
	}

	return coord;
}

/* Context menu
 */
function getContextMenuIcon(iconName) {
	switch (iconName) {
		case 'play':
			return `<img src="/images/play.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px; filter: invert(1);">`;
		case 'pause':
			return `<img src="/images/pause.svg" width="16" height="16" style="vertical-align: middle; margin-right: 8px; filter: invert(1);">`;
		default:
			return ''; // or a fallback icon
	}
}

function taida_contextmenu_show(target, event, items, handler) {
	const $menu = $('#taida-contextmenu');
	$menu.empty();

	items.forEach(item => {
		const $entry = $('<li></li>')
			.text(item.name)
			.addClass('context-item')
			.prepend(getContextMenuIcon(item.icon))
			.on('click', function(e) {
				e.stopPropagation();
				$menu.hide();
				handler(target, item.name);
			});
		$menu.append($entry);
	});

	$menu.css({
		top: event.pageY + 'px',
		left: event.pageX + 'px',
		display: 'inline-block',
		position: 'absolute',
		zIndex: 99999
	});
}


/* Refresh desktop
 */
function taida_desktop_refresh() {
	taida_directory_list(_taida_desktop_path, function(items) {
		var desktop = $('div.desktop div.icons');

		desktop.empty();

		/* Fill explorer
		 */
		items.forEach(function(item) {
			if (item.type == 'directory') {
				var icon = taida_file_make_icon(item, _taida_desktop_path, 'directory');
				desktop.append(icon);
			}
		});

		items.forEach(function(item) {
			if (item.type == 'file') {
				var icon = taida_file_make_icon(item, _taida_desktop_path, 'file');
				desktop.append(icon);
			}
		});

		var y = 0;
		$('div.desktop div.icons div.icon').each(function() {
			var width = Math.round($(this).outerWidth());
			var height = Math.round($(this).innerHeight() - $(this).find('span').innerHeight()) + 30;

			$(this).css('top', (y++ * height) + 'px');

			/* Drag file
			 */
			if (taida_read_only == false) {
				$(this).draggable({
					containment: 'parent',
					helper: 'clone',
					handle: 'img',
					zIndex: 10000,
					start: function() {
						taida_startmenu_close();
					},
					stop: function(event, ui) {
						if (taida_key_pressed(KEY_CTRL)) {
							return;
						}

						var pos = $(ui.helper).position();

						pos.top = taida_icon_coord_to_grid(pos.top, height);
						pos.left = taida_icon_coord_to_grid(pos.left, width);

						var win_y = $('div.icons').height();
						var icon = $(this);
						var moved;

						do {
							moved = false;

							$('div.desktop div.icons div.icon').each(function() {
								if ($(this).hasClass('ui-draggable-dragging')) {
									return true;
								}

								if ($(this).is(icon)) {
									return true;
								}

								var other = $(this).position();
								if ((pos.top == other.top) && (pos.left == other.left)) {
									pos.top += height;

									if (pos.top + height > win_y) {
										pos.top = taida_icon_coord_to_grid(0, height);
										pos.left += width;
									}

									moved = true;
								}
							});
						} while (moved);

						$(this).css('top', pos.top + 'px');
						$(this).css('left', pos.left + 'px');
					}
				});
			}
		});

		/* Click file on mobile device
		 */
		if ($('div.desktop').attr('mobile') == 'yes') {
			$('div.desktop div.icons div.icon').on('click', function() {
				var filename = _taida_desktop_path + '/' + $(this).find('span').text();

				if (desktop.data('click_last') == filename) {
					desktop.data('click_last', null);
					$(this).trigger('dblclick');
				} else {
					desktop.data('click_last', filename);
				}
			});
		}

		/* Double click file
		 */
		$('div.desktop div.icons div.icon').on('dblclick', function() {
			var filename = _taida_desktop_path + '/' + $(this).find('span').text();
			var type = $(this).attr('type');

			if (type == 'file') {
				var extension = taida_file_extension(filename);

				if ((handler = taida_get_file_handler(extension)) != undefined) {
					handler(filename);
				} else {
					window.open('/taida/file/download/' + url_encode(filename), '_blank').focus();
				}
			} else {
				if ((handler = taida_get_directory_handler()) != undefined) {
					handler(filename);
				}
			}
		});

		/* Right click
		 */
		$('div.desktop div.icons div.icon').on('contextmenu', function(event) {
			taida_startmenu_close();

			var menu_entries = [];
			if ($(this).attr('type') == 'file') {
				menu_entries.push({ name: 'Download', icon: 'download' });
			}
			menu_entries.push({ name: 'Rename', icon: 'edit' });
			menu_entries.push({ name: 'Delete', icon: 'remove' });

			taida_contextmenu_show($(this), event, menu_entries, taida_desktop_contextmenu_handler);
			return false;
		});
	}, function(result) {
		taida_alert('The directory "' + _taida_desktop_path + '" is missing in your home directory.', 'Error');
	});
}

/* Rearrange windows and icons on the desktop
 */
function taida_desktop_rearrange() {
	/* Rearrange windows
	 */
	var windows_width = Math.round($('div.windows').width());
	var windows_height = Math.round($('div.windows').height());

	$('div.windows div.window').each(function() {
	    if ((windat = $(this).data('maximize')) != undefined) {
			$(this).removeData('maximize');
			taida_window_maximize($(this).attr('id'));
			$(this).data('maximize', windat);
			return true;
		}

		if ($(this).is(':visible') == false) {
			return true;
		}

		var pos = $(this).position();
		var width = Math.round($(this).outerWidth());
		var height = Math.round($(this).outerHeight());

		if (pos.left + width >= windows_width) {
			pos.left = windows_width - width;
		}

		if (pos.left < 0) {
			pos.left = 0;
			if ($(this).is('.ui-resizable')) {
				if (pos.left + width > windows_width) {
					$(this).css('width', windows_width + 'px');
				}
			}
		}

		if (pos.top + height >= windows_height) {
			pos.top = windows_height - height;
		}

		if (pos.top < 0) {
			pos.top = 0;
			if ($(this).is('.ui-resizable')) {
				if (pos.top + height > windows_height) {
					$(this).css('height', windows_height + 'px');
				}
			}
		}

		$(this).css('top', pos.top + 'px');
		$(this).css('left', pos.left + 'px');
	});

	/* Rearrange icons
	 */
	var icons_width = Math.round($('div.icons').width());
	var icons_height = Math.round($('div.icons').height());

	$('div.desktop div.icons div.icon').each(function() {
		var pos = $(this).position();
		var width = Math.round($(this).outerWidth());
		var height = Math.round($(this).outerHeight());

		while (pos.left + width >= icons_width) {
			pos.left -= width;
			if (pos.left < 0) {
				pos.left = 0;
				break;
			}
		}

		while (pos.top + height >= icons_height) {
			pos.top -= height;
			if (pos.top < 0) {
				pos.top = 0;
				break;
			}
		}

		$(this).css('top', pos.top + 'px');
		$(this).css('left', pos.left + 'px');
	});
}

/* Load wallpaper
 */
function loadVideoBackground(videoUrl) {
  const desktopDiv = document.querySelector('.desktop');
  if (!desktopDiv) return console.error('Desktop div not found');

  // Assign to global
  bgVideo = document.createElement('video');
  bgVideo.classList.add('bg-video');
  bgVideo.src = videoUrl;
  bgVideo.autoplay = true;
  bgVideo.muted = true;
  bgVideo.loop = true;
  bgVideo.playsInline = true;

  // Create the warm overlay
  const warmOverlay = document.createElement('div');
  warmOverlay.classList.add('video-warm-overlay');

  // Insert video and overlay
  desktopDiv.insertBefore(bgVideo, desktopDiv.firstChild);
  desktopDiv.appendChild(warmOverlay);
}

/* Menu handler
 */
function taida_desktop_contextmenu_handler(target, option) {
	var filename = target.find('span').text();

	switch (option) {
		case 'Download':
			var url = '/taida/file/download/' + _taida_desktop_path + '/' + url_encode(filename);
			window.open(url, '_blank').focus();
			break;
		case 'Rename':
			taida_prompt('Rename file:', filename, function(new_filename) {
				new_filename = new_filename.trim();
				if (new_filename == '') {
					taida_alert('The new filename cannot be empty.');
				} else if (new_filename != filename) {
					taida_file_rename(_taida_desktop_path + '/' + filename, new_filename, undefined, function() {
						taida_alert('Error while renaming file or directory.', 'Error');
					});
				}
			});
			break;
		case 'Delete':
			taida_confirm('Delete ' + filename + '?', function() {
				if (target.attr('type') == 'file') {
					taida_file_remove(_taida_desktop_path + '/' + filename, undefined, function() {
						taida_alert('Error while deleting file.', 'Error');
					});
				} else {
					taida_directory_remove(_taida_desktop_path + '/' + filename, undefined, function() {
						taida_alert('Error while deleting directory.', 'Error');
					});
				}
			}); 
			break;
		case 'Play':
		case 'Pause':
			if (bgVideo) {
				if (bgVideo.paused) {
					bgVideo.play();
				} else {
					bgVideo.pause();
				}
			}
			break;
	}
}

/* Mobile device support
 */
function mobile_device_support() {
	if ($('div.desktop').attr('mobile') == 'no') {
		if (navigator.maxTouchPoints <= 2) {
			return;
		}

		if (/MacIntel/.test(navigator.platform) == false) {
			return;
		}

		$('div.desktop').attr('mobile', 'yes');
	}

	taida_load_javascript('/js/jquery.ui.touch-punch.js');
}

/* Main
 */
$(document).ready(function() {
    mobile_device_support();

    _taida_desktop_path = $('div.desktop').attr('path');
    taida_read_only = $('div.desktop').attr('read_only') == 'no';

	const desktopDiv = document.querySelector('.desktop');
	if (!desktopDiv) {
		console.error('Desktop div not found');
		return;
	}

	// Idle screen

	let idleTimer;
	const idleDelay = 60000; // 1 min
	const sleepScreen = document.getElementById('sleep-screen');

	function showSleepScreen() {
		sleepScreen.classList.add('show');
	}

	function hideSleepScreen() {
		sleepScreen.classList.remove('show');
	}

	function resetIdleTimer() {
		clearTimeout(idleTimer);
		hideSleepScreen();
		idleTimer = setTimeout(showSleepScreen, idleDelay);
	}

	['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event =>
		document.addEventListener(event, resetIdleTimer)
	);

	resetIdleTimer(); // Start on page load
	/* */

	loadVideoBackground('/images/animatedlogo.webm');

    taida_setting_get('system/color', function(color) {
        taida_window_set_color(color);
    }, function() {
        taida_alert('Error loading window color.', 'Error');
        taida_window_set_color('#808080');
    });

	window.setTimeout(taida_desktop_refresh, 100);

	if ($('#taida-contextmenu').length === 0) {
		$('body').append('<ul id="taida-contextmenu" class="context-menu"></ul>');
	}

	// Auto-hide on outside click
	$(document).on('click contextmenu', function() {
		$('#taida-contextmenu').hide();
	});
	
	/* Droppable
	 */
	if (taida_read_only == false) {
		$('div.desktop').droppable({
			accept: 'div.icon, div.detail',
			drop: function(event, ui) {
				var span = ui.helper.find('span').first();
				var source_filename = span.text();
				var source_path = span.attr('path');
				var source = source_path + '/' + source_filename;

				if (source_path == 'Desktop') {
					return;
				}

				taida_file_exists('Desktop/' + source_filename, function(exists) {
					var ctrl_pressed = taida_key_pressed(KEY_CTRL);

					var file_operation = function() {
						if (ctrl_pressed) {
							taida_file_copy(source, _taida_desktop_path, undefined, function() {
								taida_alert('Error copying file.', 'Error');
							});
						} else {
							taida_file_move(source, _taida_desktop_path, undefined, function() {
								taida_alert('Error moving file.', 'Error');
							});
						}
					};

					if (exists) {
						taida_confirm('Destination file already exists. Overwrite?', file_operation);
					} else {
						file_operation();
					}

				});
			}
		});
	}

	/* Clicks
	 */
	$('div.desktop').on('click', function() {
		taida_startmenu_close();
		taida_window_unfocus_all()
	});

	$('div.desktop').on('contextmenu', function(event) {
		taida_startmenu_close();

		let menu_entries = [];

		if (bgVideo) {
			menu_entries.push({
				name: bgVideo.paused ? 'Play' : 'Pause',
				icon: bgVideo.paused ? 'play' : 'pause'
			});
		}

		taida_contextmenu_show($(this), event, menu_entries, taida_desktop_contextmenu_handler);
		return false;
	});


	/* Resize browser window
	 */
	var resize = 0;
	$(window).on('resize', function() {
		var current = ++resize;
		setTimeout(function() {
			if (current != resize) {
				return;
			}

			taida_desktop_rearrange();
			taida_taskbar_set_task_width();

			$('div.desktop div.windows div.window').each(function() {
				if ($(this).data('maximize') == undefined) {
					return true;
				}

				if ($(this).is(':visible') == false) {
					return true;
				}

				var settings = $(this).data('settings');
				if ((settings.resize != undefined) && (settings.resize != false)) {
					settings.resize();
				}
			});
		}, 100);
	});

	/* File changes
	 */
	taida_directory_upon_update(function(directory) {
		if (directory == _taida_desktop_path) {
			taida_desktop_refresh();
		}
	});

	/* Drop files
	 */
	if (taida_read_only == false) {
		$('div.desktop').on('dragover', function(event) {
			if ($('div.explorer').length == 0) {
				explorer_open(_taida_desktop_path);
			} else {
				$('div.explorer').each(function() {
					taida_window_raise($(this).parent().parent());
				});
			}

			event.preventDefault();
			event.stopPropagation();
		});

		$('div.desktop').on('drop', function(event) {
			event.preventDefault();
			event.stopPropagation();
		});
	}
});
```

### `public\js\directory.js`

- **Size:** 3256 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

_taida_directory_update_callbacks = [];

/* Directory updates
 */
function taida_directory_upon_update(callback) {
	_taida_directory_update_callbacks.push(callback);
}

function taida_directory_notify_update(directory) {
	taida_directory_exists(directory, function(exists) {
		if (exists == false) {
			directory = taida_file_dirname(directory);
		}

		_taida_directory_update_callbacks.forEach(function(callback) {
			callback(directory);
		});
	});
}

/* Directory operations
 */
function taida_directory_list(path, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/dir/list/' + path,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var items = [];
		$(data).find('item').each(function() {
			var item = {
				name: $(this).find('name').text(),
				type: $(this).find('type').text(),
				link: $(this).find('link').text() == 'yes',
				target: $(this).find('target').text(),
				size: $(this).find('size').text(),
				create: $(this).find('create').text(),
				create_timestamp: $(this).find('create').attr('timestamp'),
				access: $(this).find('access').text(),
				access_timestamp: $(this).find('access').attr('timestamp')
			}
			items.push(item);
		});

		callback_done(items);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_exists(directory, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/dir/exists/' + directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('exists').text() == 'yes');
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_create(directory, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	$.post('/taida/dir/make', {
		directory: directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function() {
		directory = taida_file_dirname(directory);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_directory_remove(directory, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	directory = taida_file_prepare(directory);

	$.post('/taida/dir/remove', {
		directory: directory,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		directory = taida_file_dirname(directory);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}
```

### `public\js\file.js`

- **Size:** 13060 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const kB = 1024;
const MB = 1024 * kB;
const GB = 1024 * MB;

const TAIDA_NO_EXTENSION = '___';

/* File icon
 */
function taida_file_make_icon(item, path, type) {
	var name = item.name;
	var link = item.link;
	var target = item.target;

	if (type == 'directory') {
		var image = '/images/directory.png';
		var extension = '';
	} else {
		var extension = taida_file_extension(name);
		if (extension != false) {
			var image = taida_get_file_icon(extension);
		} else {
			var image = '/images/file.png';
			extension = '';
		}
	}

	if (target != undefined) {
		target = ' title="' + target + '"';
	} else {
		target = '';
	}

	return '<div class="icon" type="' + type + '" ext="' + extension + '" link="' + (link ? 'yes' : 'no' ) + '">' +
		'<img src="' + image + '" alt="' + name + '" draggable="false" />' +
		(link ? '<img src="/images/link.png" draggable="false" />' : '') +
		'<span path="' + path + '" type="' + type + '"' + target + '>' + name + '</span></div>';
}

/* File utility functions
 */
function taida_file_prepare(path) {
	while (path.startsWith('/')) {
		path = path.substring(1);
	}

	while (path.endsWith('/')) {
		path = path.substring(0, path.length - 1);
	}

	return path;
}

function taida_file_filename(filename) {
	var pos = filename.lastIndexOf('/');

	if (pos == -1) {
		return filename;
	}

	return filename.substring(pos + 1);
}

function taida_file_dirname(filename) {
	var pos = filename.lastIndexOf('/');

	if (pos == -1) {
		return '';
	}

	return filename.substring(0, pos);
}

function taida_file_extension(filename) {
	var slash = filename.lastIndexOf('/');

	if (slash != -1) {
		filename = filename.substr(slash + 1);
	}

	var pos = filename.lastIndexOf('.');

	if (pos == -1) {
		return TAIDA_NO_EXTENSION;
	}

	return filename.substr(pos + 1);
}

function taida_download_url(filename) {
	url = '/taida/file/download/' + url_encode(filename);

	if ($('div.desktop').attr('debug') == 'yes') {
		var date = new Date();
		url += '?' + date.getTime();
	}

	return url;
}

/* Dialog window
 */
function _taida_file_dialog_update(dialog_window, default_filename = undefined) {
	var path = dialog_window.data('path');

	dialog_window.find('div.path').text(path == '' ? '/' : '/' + path + '/');

	taida_directory_list(path, function(items) {
		var directories = dialog_window.find('div.directories');
		var files = dialog_window.find('div.files');
		var filename = dialog_window.find('div.filename input');

		directories.empty();
		files.empty();
		if (default_filename != undefined) {
			filename.val(default_filename);
		}

		/* Fill dialog
		 */
		items.forEach(function(item) {
			var name = $(this).find('name').text();
			if (item.type == 'directory') {
				directories.append('<div class="directory"><img src="/images/directory.png" />' + item.name + '</div>');
			} else {
				var icon = taida_file_make_icon(item, path, 'file');
				files.append(icon);
			}
		});

		/* Select directory
		 */
		dialog_window.find('div.directories div.directory').on('dblclick', function() {
			var dir = $(this).text();

			if (path == '') {
				path = dir;
			} else {
				path += '/' + dir;
			}

			dialog_window.data('path', path);
			_taida_file_dialog_update(dialog_window);
		});

		/* Select file
		 */
		dialog_window.find('div.files div.icon').on('click', function() {
			filename.val($(this).find('span').text());
		});

		dialog_window.find('div.files div.icon').on('dblclick', function() {
			var callback = dialog_window.data('callback');
			callback(path + '/' + $(this).find('span').text());
			dialog_window.close();
		});
	}, function(result) {
		if (result == 401) {
			dialog_window.close();
			alert('Login has been expired. No access to disk.');
			taida_logout(true);
		} else if ((path != '/') && (path != '')) {
			var parts = path.split('/');
			parts.pop();
			path = parts.join('/');

			dialog_window.data('path', path);
			_taida_file_dialog_update(dialog_window, default_filename);
		}
	});
}

function taida_file_dialog(action, callback, directory = '', filename = undefined) {
	var dialog =
		'<div class="file_dialog">' +
		'<button class="btn btn-default btn-xs up"><img src="/images/chevron-up.svg" width="16" height="16" style="vertical-align: middle;"></button>' +
		'<div class="path"></div>' +
		'<div class="directories"></div>' +
		'<div class="files"></div>' +
		'<div class="filename"><input placeholder="Enter filename..." class="form-control" /></div>' +
		'<div class="btn-group">' +
		'<input type="button" value="' + action + '" class="btn btn-default action" />' +
		'<input type="button" value="Cancel" class="btn btn-default cancel" />' +
		'</div>' +
		'</div>';
	var dialog_window = $(dialog).taida_window({
		header: action + ' file',
		width: 700,
		height: 350,
		maximize: false,
		minimize: false,
		resize: false,
		dialog: true,
		open: function() {
			dialog_window.find('input.form-control').focus();
		},
		close: function() {
			$(document).off('keydown', key_handler);
		}
	});

	dialog_window.open();

	var key_handler = function(event) {
		if (event.which == 27) {
			dialog_window.find('div.btn-group input.cancel').trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	dialog_window.find('button.up').on('click', function() {
		var path = dialog_window.data('path');

		if (path == '') {
			return;
		}

		var parts = path.split('/');
		parts.pop();
		path = parts.join('/');

		dialog_window.data('path', path);
		_taida_file_dialog_update(dialog_window);
	});

	dialog_window.find('input.action').on('click', function() {
		var filename = dialog_window.find('div.filename input').val();

		if (filename == '') {
			return;
		}

		var path = dialog_window.data('path');
		var callback = dialog_window.data('callback');
		callback(path + '/' + filename);

		dialog_window.close();
	});

	dialog_window.find('input.cancel').on('click', function() {
		dialog_window.close();
	});

	dialog_window.data('path', directory);
	dialog_window.data('callback', callback);

	_taida_file_dialog_update(dialog_window, filename);
}

/* File operations
 */
function taida_file_nice_size(size, bytes = false) {
	if (size > GB) {
		size = (size / GB).toFixed(1) + " GB";
	} else if (size > MB) {
		size = (size / MB).toFixed(1) + " MB";
	} else if (size > kB) {
		size = (size / kB).toFixed(1) + " kB";
	} else if (bytes) {
		size = size + " bytes";
	}

	return size;
}

function taida_file_type(filename, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/file/type/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('type').text());
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_exists(filename, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/file/exists/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		callback_done($(data).find('exists').text() == 'yes');
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_open(filename, callback_done, callback_fail = undefined) {
	filename = taida_file_prepare(filename);

	$.ajax({
		url: '/taida/file/load/' + filename,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var content = atob($(data).find('content').text());
		callback_done(content);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_save(filename, content, binary = false, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	if (binary) {
		content = btoa(content);
	}

	$.post('/taida/file/save', {
		filename: filename,
		content: content,
		encoding: (binary ? 'base64' : 'none'),
		timeout: TAIDA_FS_TIMEOUT
	}).done(function(data) {
		var directory = taida_file_dirname(filename);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_rename(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	destination = taida_file_prepare(destination);

	var parts = source.split('/');
	var filename = parts.pop();
	if (filename == destination) {
		return;
	}

	$.post('/taida/file/rename', {
		source: source,
		new_filename: destination,
		timeout: TAIDA_FS_TIMEOUT
	}).done(function() {
		var source_path = taida_file_dirname(source);
		taida_directory_notify_update(source_path);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_move(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	var source_path = taida_file_dirname(source);
	destination = taida_file_prepare(destination);

	if (source_path == destination) {
		return;
	}

	$.post('/taida/file/move', {
		source: source,
		destination: destination
	}).done(function() {
		taida_directory_notify_update(source_path);
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_copy(source, destination, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	source = taida_file_prepare(source);
	var source_path = taida_file_dirname(source);
	destination = taida_file_prepare(destination);

	if (source_path == destination) {
		return;
	}

	$.post('/taida/file/copy', {
		source: source,
		destination: destination
	}).done(function() {
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_link(filename, link, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	$.post('/taida/file/link', {
		source: filename,
		destination: link
	}).done(function() {
		var destination = taida_file_dirname(link);
		taida_directory_notify_update(destination);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_remove(filename, callback_done = undefined, callback_fail = undefined) {
	if (taida_read_only) {
		if (callback_fail != undefined) {
			callback_fail(403, 'readonly');
		}
		return;
	}

	filename = taida_file_prepare(filename);

	$.post('/taida/file/remove', {
		filename: filename
	}).done(function(data) {
		var directory = taida_file_dirname(filename);
		taida_directory_notify_update(directory);

		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}

function taida_file_search(filename, path, callback_done, callback_fail = undefined) {
	$.post('/taida/file/search', {
		search: filename,
		path: path
	}).done(function(data) {
		var result = [];

		$(data).find('file').each(function() {
			var item = {
				filename: $(this).text(),
				type: $(this).attr('type')
			};
			result.push(item);
		});

		callback_done(result);
	}).fail(function(result) {
		if (callback_fail != undefined) {
			callback_fail(result.status, result.statusText);
		}
	});
}
```

### `public\js\jquery-ui.js`

- **Size:** 71998 bytes
- **Extension:** `.js`

```javascript
/*! jQuery UI - v1.13.2 - 2023-04-03
* http://jqueryui.com
* Includes: widget.js, position.js, data.js, disable-selection.js, keycode.js, scroll-parent.js, widgets/draggable.js, widgets/droppable.js, widgets/resizable.js, widgets/mouse.js, widgets/slider.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

!function(t){"use strict";"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)}(function(z){"use strict";z.ui=z.ui||{};z.ui.version="1.13.2";var o,i=0,a=Array.prototype.hasOwnProperty,r=Array.prototype.slice;z.cleanData=(o=z.cleanData,function(t){for(var e,i,s=0;null!=(i=t[s]);s++)(e=z._data(i,"events"))&&e.remove&&z(i).triggerHandler("remove");o(t)}),z.widget=function(t,i,e){var s,o,n,a={},r=t.split(".")[0],h=r+"-"+(t=t.split(".")[1]);return e||(e=i,i=z.Widget),Array.isArray(e)&&(e=z.extend.apply(null,[{}].concat(e))),z.expr.pseudos[h.toLowerCase()]=function(t){return!!z.data(t,h)},z[r]=z[r]||{},s=z[r][t],o=z[r][t]=function(t,e){if(!this||!this._createWidget)return new o(t,e);arguments.length&&this._createWidget(t,e)},z.extend(o,s,{version:e.version,_proto:z.extend({},e),_childConstructors:[]}),(n=new i).options=z.widget.extend({},n.options),z.each(e,function(e,s){function o(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}a[e]="function"==typeof s?function(){var t,e=this._super,i=this._superApply;return this._super=o,this._superApply=n,t=s.apply(this,arguments),this._super=e,this._superApply=i,t}:s}),o.prototype=z.widget.extend(n,{widgetEventPrefix:s&&n.widgetEventPrefix||t},a,{constructor:o,namespace:r,widgetName:t,widgetFullName:h}),s?(z.each(s._childConstructors,function(t,e){var i=e.prototype;z.widget(i.namespace+"."+i.widgetName,o,e._proto)}),delete s._childConstructors):i._childConstructors.push(o),z.widget.bridge(t,o),o},z.widget.extend=function(t){for(var e,i,s=r.call(arguments,1),o=0,n=s.length;o<n;o++)for(e in s[o])i=s[o][e],a.call(s[o],e)&&void 0!==i&&(z.isPlainObject(i)?t[e]=z.isPlainObject(t[e])?z.widget.extend({},t[e],i):z.widget.extend({},i):t[e]=i);return t},z.widget.bridge=function(n,e){var a=e.prototype.widgetFullName||n;z.fn[n]=function(i){var t="string"==typeof i,s=r.call(arguments,1),o=this;return t?this.length||"instance"!==i?this.each(function(){var t,e=z.data(this,a);return"instance"===i?(o=e,!1):e?"function"!=typeof e[i]||"_"===i.charAt(0)?z.error("no such method '"+i+"' for "+n+" widget instance"):(t=e[i].apply(e,s))!==e&&void 0!==t?(o=t&&t.jquery?o.pushStack(t.get()):t,!1):void 0:z.error("cannot call methods on "+n+" prior to initialization; attempted to call method '"+i+"'")}):o=void 0:(s.length&&(i=z.widget.extend.apply(null,[i].concat(s))),this.each(function(){var t=z.data(this,a);t?(t.option(i||{}),t._init&&t._init()):z.data(this,a,new e(i,this))})),o}},z.Widget=function(){},z.Widget._childConstructors=[],z.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(t,e){e=z(e||this.defaultElement||this)[0],this.element=z(e),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=z(),this.hoverable=z(),this.focusable=z(),this.classesElementLookup={},e!==this&&(z.data(e,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===e&&this.destroy()}}),this.document=z(e.style?e.ownerDocument:e.document||e),this.window=z(this.document[0].defaultView||this.document[0].parentWindow)),this.options=z.widget.extend({},this.options,this._getCreateOptions(),t),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:z.noop,_create:z.noop,_init:z.noop,destroy:function(){var i=this;this._destroy(),z.each(this.classesElementLookup,function(t,e){i._removeClass(e,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:z.noop,widget:function(){return this.element},option:function(t,e){var i,s,o,n=t;if(0===arguments.length)return z.widget.extend({},this.options);if("string"==typeof t)if(n={},t=(i=t.split(".")).shift(),i.length){for(s=n[t]=z.widget.extend({},this.options[t]),o=0;o<i.length-1;o++)s[i[o]]=s[i[o]]||{},s=s[i[o]];if(t=i.pop(),1===arguments.length)return void 0===s[t]?null:s[t];s[t]=e}else{if(1===arguments.length)return void 0===this.options[t]?null:this.options[t];n[t]=e}return this._setOptions(n),this},_setOptions:function(t){for(var e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(t){var e,i,s;for(e in t)s=this.classesElementLookup[e],t[e]!==this.options.classes[e]&&s&&s.length&&(i=z(s.get()),this._removeClass(s,e),i.addClass(this._classes({element:i,keys:e,classes:t,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(o){var n=[],a=this;function t(t,e){for(var i,s=0;s<t.length;s++)i=a.classesElementLookup[t[s]]||z(),i=o.add?(function(){var i=[];o.element.each(function(t,e){z.map(a.classesElementLookup,function(t){return t}).some(function(t){return t.is(e)})||i.push(e)}),a._on(z(i),{remove:"_untrackClassesElement"})}(),z(z.uniqueSort(i.get().concat(o.element.get())))):z(i.not(o.element).get()),a.classesElementLookup[t[s]]=i,n.push(t[s]),e&&o.classes[t[s]]&&n.push(o.classes[t[s]])}return(o=z.extend({element:this.element,classes:this.options.classes||{}},o)).keys&&t(o.keys.match(/\S+/g)||[],!0),o.extra&&t(o.extra.match(/\S+/g)||[]),n.join(" ")},_untrackClassesElement:function(i){var s=this;z.each(s.classesElementLookup,function(t,e){-1!==z.inArray(i.target,e)&&(s.classesElementLookup[t]=z(e.not(i.target).get()))}),this._off(z(i.target))},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){var o="string"==typeof t||null===t,i={extra:o?e:i,keys:o?t:e,element:o?this.element:t,add:s="boolean"==typeof s?s:i};return i.element.toggleClass(this._classes(i),s),this},_on:function(o,n,t){var a,r=this;"boolean"!=typeof o&&(t=n,n=o,o=!1),t?(n=a=z(n),this.bindings=this.bindings.add(n)):(t=n,n=this.element,a=this.widget()),z.each(t,function(t,e){function i(){if(o||!0!==r.options.disabled&&!z(this).hasClass("ui-state-disabled"))return("string"==typeof e?r[e]:e).apply(r,arguments)}"string"!=typeof e&&(i.guid=e.guid=e.guid||i.guid||z.guid++);var s=t.match(/^([\w:-]*)\s*(.*)$/),t=s[1]+r.eventNamespace,s=s[2];s?a.on(t,s,i):n.on(t,i)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.off(e),this.bindings=z(this.bindings.not(t).get()),this.focusable=z(this.focusable.not(t).get()),this.hoverable=z(this.hoverable.not(t).get())},_delay:function(t,e){var i=this;return setTimeout(function(){return("string"==typeof t?i[t]:t).apply(i,arguments)},e||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){this._addClass(z(t.currentTarget),null,"ui-state-hover")},mouseleave:function(t){this._removeClass(z(t.currentTarget),null,"ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){this._addClass(z(t.currentTarget),null,"ui-state-focus")},focusout:function(t){this._removeClass(z(t.currentTarget),null,"ui-state-focus")}})},_trigger:function(t,e,i){var s,o,n=this.options[t];if(i=i||{},(e=z.Event(e)).type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),e.target=this.element[0],o=e.originalEvent)for(s in o)s in e||(e[s]=o[s]);return this.element.trigger(e,i),!("function"==typeof n&&!1===n.apply(this.element[0],[e].concat(i))||e.isDefaultPrevented())}},z.each({show:"fadeIn",hide:"fadeOut"},function(n,a){z.Widget.prototype["_"+n]=function(e,t,i){var s,o=(t="string"==typeof t?{effect:t}:t)?!0!==t&&"number"!=typeof t&&t.effect||a:n;"number"==typeof(t=t||{})?t={duration:t}:!0===t&&(t={}),s=!z.isEmptyObject(t),t.complete=i,t.delay&&e.delay(t.delay),s&&z.effects&&z.effects.effect[o]?e[n](t):o!==n&&e[o]?e[o](t.duration,t.easing,i):e.queue(function(t){z(this)[n](),i&&i.call(e[0]),t()})}});var s,x,P,n,h,l,p,u,C;z.widget;function H(t,e,i){return[parseFloat(t[0])*(u.test(t[0])?e/100:1),parseFloat(t[1])*(u.test(t[1])?i/100:1)]}function E(t,e){return parseInt(z.css(t,e),10)||0}function S(t){return null!=t&&t===t.window}x=Math.max,P=Math.abs,n=/left|center|right/,h=/top|center|bottom/,l=/[\+\-]\d+(\.[\d]+)?%?/,p=/^\w+/,u=/%$/,C=z.fn.position,z.position={scrollbarWidth:function(){if(void 0!==s)return s;var t,e=z("<div style='display:block;position:absolute;width:200px;height:200px;overflow:hidden;'><div style='height:300px;width:auto;'></div></div>"),i=e.children()[0];return z("body").append(e),t=i.offsetWidth,e.css("overflow","scroll"),t===(i=i.offsetWidth)&&(i=e[0].clientWidth),e.remove(),s=t-i},getScrollInfo:function(t){var e=t.isWindow||t.isDocument?"":t.element.css("overflow-x"),i=t.isWindow||t.isDocument?"":t.element.css("overflow-y"),e="scroll"===e||"auto"===e&&t.width<t.element[0].scrollWidth;return{width:"scroll"===i||"auto"===i&&t.height<t.element[0].scrollHeight?z.position.scrollbarWidth():0,height:e?z.position.scrollbarWidth():0}},getWithinInfo:function(t){var e=z(t||window),i=S(e[0]),s=!!e[0]&&9===e[0].nodeType;return{element:e,isWindow:i,isDocument:s,offset:!i&&!s?z(t).offset():{left:0,top:0},scrollLeft:e.scrollLeft(),scrollTop:e.scrollTop(),width:e.outerWidth(),height:e.outerHeight()}}},z.fn.position=function(u){if(!u||!u.of)return C.apply(this,arguments);var c,d,f,g,m,t,_="string"==typeof(u=z.extend({},u)).of?z(document).find(u.of):z(u.of),v=z.position.getWithinInfo(u.within),w=z.position.getScrollInfo(v),b=(u.collision||"flip").split(" "),y={},e=9===(t=(e=_)[0]).nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:S(t)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:t.preventDefault?{width:0,height:0,offset:{top:t.pageY,left:t.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()};return _[0].preventDefault&&(u.at="left top"),d=e.width,f=e.height,m=z.extend({},g=e.offset),z.each(["my","at"],function(){var t,e,i=(u[this]||"").split(" ");(i=1===i.length?n.test(i[0])?i.concat(["center"]):h.test(i[0])?["center"].concat(i):["center","center"]:i)[0]=n.test(i[0])?i[0]:"center",i[1]=h.test(i[1])?i[1]:"center",t=l.exec(i[0]),e=l.exec(i[1]),y[this]=[t?t[0]:0,e?e[0]:0],u[this]=[p.exec(i[0])[0],p.exec(i[1])[0]]}),1===b.length&&(b[1]=b[0]),"right"===u.at[0]?m.left+=d:"center"===u.at[0]&&(m.left+=d/2),"bottom"===u.at[1]?m.top+=f:"center"===u.at[1]&&(m.top+=f/2),c=H(y.at,d,f),m.left+=c[0],m.top+=c[1],this.each(function(){var i,t,a=z(this),r=a.outerWidth(),h=a.outerHeight(),e=E(this,"marginLeft"),s=E(this,"marginTop"),o=r+e+E(this,"marginRight")+w.width,n=h+s+E(this,"marginBottom")+w.height,l=z.extend({},m),p=H(y.my,a.outerWidth(),a.outerHeight());"right"===u.my[0]?l.left-=r:"center"===u.my[0]&&(l.left-=r/2),"bottom"===u.my[1]?l.top-=h:"center"===u.my[1]&&(l.top-=h/2),l.left+=p[0],l.top+=p[1],i={marginLeft:e,marginTop:s},z.each(["left","top"],function(t,e){z.ui.position[b[t]]&&z.ui.position[b[t]][e](l,{targetWidth:d,targetHeight:f,elemWidth:r,elemHeight:h,collisionPosition:i,collisionWidth:o,collisionHeight:n,offset:[c[0]+p[0],c[1]+p[1]],my:u.my,at:u.at,within:v,elem:a})}),u.using&&(t=function(t){var e=g.left-l.left,i=e+d-r,s=g.top-l.top,o=s+f-h,n={target:{element:_,left:g.left,top:g.top,width:d,height:f},element:{element:a,left:l.left,top:l.top,width:r,height:h},horizontal:i<0?"left":0<e?"right":"center",vertical:o<0?"top":0<s?"bottom":"middle"};d<r&&P(e+i)<d&&(n.horizontal="center"),f<h&&P(s+o)<f&&(n.vertical="middle"),x(P(e),P(i))>x(P(s),P(o))?n.important="horizontal":n.important="vertical",u.using.call(this,t,n)}),a.offset(z.extend(l,{using:t}))})},z.ui.position={fit:{left:function(t,e){var i=e.within,s=i.isWindow?i.scrollLeft:i.offset.left,o=i.width,n=t.left-e.collisionPosition.marginLeft,a=s-n,r=n+e.collisionWidth-o-s;e.collisionWidth>o?0<a&&r<=0?(i=t.left+a+e.collisionWidth-o-s,t.left+=a-i):t.left=!(0<r&&a<=0)&&r<a?s+o-e.collisionWidth:s:0<a?t.left+=a:0<r?t.left-=r:t.left=x(t.left-n,t.left)},top:function(t,e){var i=e.within,s=i.isWindow?i.scrollTop:i.offset.top,o=e.within.height,n=t.top-e.collisionPosition.marginTop,a=s-n,r=n+e.collisionHeight-o-s;e.collisionHeight>o?0<a&&r<=0?(i=t.top+a+e.collisionHeight-o-s,t.top+=a-i):t.top=!(0<r&&a<=0)&&r<a?s+o-e.collisionHeight:s:0<a?t.top+=a:0<r?t.top-=r:t.top=x(t.top-n,t.top)}},flip:{left:function(t,e){var i=e.within,s=i.offset.left+i.scrollLeft,o=i.width,n=i.isWindow?i.scrollLeft:i.offset.left,a=t.left-e.collisionPosition.marginLeft,r=a-n,h=a+e.collisionWidth-o-n,l="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,i="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,a=-2*e.offset[0];r<0?((s=t.left+l+i+a+e.collisionWidth-o-s)<0||s<P(r))&&(t.left+=l+i+a):0<h&&(0<(n=t.left-e.collisionPosition.marginLeft+l+i+a-n)||P(n)<h)&&(t.left+=l+i+a)},top:function(t,e){var i=e.within,s=i.offset.top+i.scrollTop,o=i.height,n=i.isWindow?i.scrollTop:i.offset.top,a=t.top-e.collisionPosition.marginTop,r=a-n,h=a+e.collisionHeight-o-n,l="top"===e.my[1]?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,i="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,a=-2*e.offset[1];r<0?((s=t.top+l+i+a+e.collisionHeight-o-s)<0||s<P(r))&&(t.top+=l+i+a):0<h&&(0<(n=t.top-e.collisionPosition.marginTop+l+i+a-n)||P(n)<h)&&(t.top+=l+i+a)}},flipfit:{left:function(){z.ui.position.flip.left.apply(this,arguments),z.ui.position.fit.left.apply(this,arguments)},top:function(){z.ui.position.flip.top.apply(this,arguments),z.ui.position.fit.top.apply(this,arguments)}}};z.ui.position,z.extend(z.expr.pseudos,{data:z.expr.createPseudo?z.expr.createPseudo(function(e){return function(t){return!!z.data(t,e)}}):function(t,e,i){return!!z.data(t,i[3])}}),z.fn.extend({disableSelection:(t="onselectstart"in document.createElement("div")?"selectstart":"mousedown",function(){return this.on(t+".ui-disableSelection",function(t){t.preventDefault()})}),enableSelection:function(){return this.off(".ui-disableSelection")}}),z.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38},z.fn.scrollParent=function(t){var e=this.css("position"),i="absolute"===e,s=t?/(auto|scroll|hidden)/:/(auto|scroll)/,t=this.parents().filter(function(){var t=z(this);return(!i||"static"!==t.css("position"))&&s.test(t.css("overflow")+t.css("overflow-y")+t.css("overflow-x"))}).eq(0);return"fixed"!==e&&t.length?t:z(this[0].ownerDocument||document)},z.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var t,c=!1;z(document).on("mouseup",function(){c=!1});z.widget("ui.mouse",{version:"1.13.2",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(t){if(!0===z.data(t.target,e.widgetName+".preventClickEvent"))return z.removeData(t.target,e.widgetName+".preventClickEvent"),t.stopImmediatePropagation(),!1}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!c){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var e=this,i=1===t.which,s=!("string"!=typeof this.options.cancel||!t.target.nodeName)&&z(t.target).closest(this.options.cancel).length;return i&&!s&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){e.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=!1!==this._mouseStart(t),!this._mouseStarted)?(t.preventDefault(),!0):(!0===z.data(t.target,this.widgetName+".preventClickEvent")&&z.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return e._mouseMove(t)},this._mouseUpDelegate=function(t){return e._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),c=!0)):!0}},_mouseMove:function(t){if(this._mouseMoved){if(z.ui.ie&&(!document.documentMode||document.documentMode<9)&&!t.button)return this._mouseUp(t);if(!t.which)if(t.originalEvent.altKey||t.originalEvent.ctrlKey||t.originalEvent.metaKey||t.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(t)}return(t.which||t.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=!1!==this._mouseStart(this._mouseDownEvent,t),this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&z.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,c=!1,t.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),z.ui.plugin={add:function(t,e,i){var s,o=z.ui[t].prototype;for(s in i)o.plugins[s]=o.plugins[s]||[],o.plugins[s].push([e,i[s]])},call:function(t,e,i,s){var o,n=t.plugins[e];if(n&&(s||t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType))for(o=0;o<n.length;o++)t.options[n[o][0]]&&n[o][1].apply(t.element,i)}},z.ui.safeActiveElement=function(e){var i;try{i=e.activeElement}catch(t){i=e.body}return i=!(i=i||e.body).nodeName?e.body:i},z.ui.safeBlur=function(t){t&&"body"!==t.nodeName.toLowerCase()&&z(t).trigger("blur")};z.widget("ui.draggable",z.ui.mouse,{version:"1.13.2",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this._addClass("ui-draggable"),this._setHandleClassName(),this._mouseInit()},_setOption:function(t,e){this._super(t,e),"handle"===t&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){(this.helper||this.element).is(".ui-draggable-dragging")?this.destroyOnClear=!0:(this._removeHandleClassName(),this._mouseDestroy())},_mouseCapture:function(t){var e=this.options;return!(this.helper||e.disabled||0<z(t.target).closest(".ui-resizable-handle").length)&&(this.handle=this._getHandle(t),!!this.handle&&(this._blurActiveElement(t),this._blockFrames(!0===e.iframeFix?"iframe":e.iframeFix),!0))},_blockFrames:function(t){this.iframeBlocks=this.document.find(t).map(function(){var t=z(this);return z("<div>").css("position","absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(t){var e=z.ui.safeActiveElement(this.document[0]);z(t.target).closest(e).length||z.ui.safeBlur(e)},_mouseStart:function(t){var e=this.options;return this.helper=this._createHelper(t),this._addClass(this.helper,"ui-draggable-dragging"),this._cacheHelperProportions(),z.ui.ddmanager&&(z.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=0<this.helper.parents().filter(function(){return"fixed"===z(this).css("position")}).length,this.positionAbs=this.element.offset(),this._refreshOffsets(t),this.originalPosition=this.position=this._generatePosition(t,!1),this.originalPageX=t.pageX,this.originalPageY=t.pageY,e.cursorAt&&this._adjustOffsetFromHelper(e.cursorAt),this._setContainment(),!1===this._trigger("start",t)?(this._clear(),!1):(this._cacheHelperProportions(),z.ui.ddmanager&&!e.dropBehaviour&&z.ui.ddmanager.prepareOffsets(this,t),this._mouseDrag(t,!0),z.ui.ddmanager&&z.ui.ddmanager.dragStart(this,t),!0)},_refreshOffsets:function(t){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:t.pageX-this.offset.left,top:t.pageY-this.offset.top}},_mouseDrag:function(t,e){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(t,!0),this.positionAbs=this._convertPositionTo("absolute"),!e){e=this._uiHash();if(!1===this._trigger("drag",t,e))return this._mouseUp(new z.Event("mouseup",t)),!1;this.position=e.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",z.ui.ddmanager&&z.ui.ddmanager.drag(this,t),!1},_mouseStop:function(t){var e=this,i=!1;return z.ui.ddmanager&&!this.options.dropBehaviour&&(i=z.ui.ddmanager.drop(this,t)),this.dropped&&(i=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!i||"valid"===this.options.revert&&i||!0===this.options.revert||"function"==typeof this.options.revert&&this.options.revert.call(this.element,i)?z(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){!1!==e._trigger("stop",t)&&e._clear()}):!1!==this._trigger("stop",t)&&this._clear(),!1},_mouseUp:function(t){return this._unblockFrames(),z.ui.ddmanager&&z.ui.ddmanager.dragStop(this,t),this.handleElement.is(t.target)&&this.element.trigger("focus"),z.ui.mouse.prototype._mouseUp.call(this,t)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp(new z.Event("mouseup",{target:this.element[0]})):this._clear(),this},_getHandle:function(t){return!this.options.handle||!!z(t.target).closest(this.element.find(this.options.handle)).length},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this._addClass(this.handleElement,"ui-draggable-handle")},_removeHandleClassName:function(){this._removeClass(this.handleElement,"ui-draggable-handle")},_createHelper:function(t){var e=this.options,i="function"==typeof e.helper,t=i?z(e.helper.apply(this.element[0],[t])):"clone"===e.helper?this.element.clone().removeAttr("id"):this.element;return t.parents("body").length||t.appendTo("parent"===e.appendTo?this.element[0].parentNode:e.appendTo),i&&t[0]===this.element[0]&&this._setPositionRelative(),t[0]===this.element[0]||/(fixed|absolute)/.test(t.css("position"))||t.css("position","absolute"),t},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(t){"string"==typeof t&&(t=t.split(" ")),"left"in(t=Array.isArray(t)?{left:+t[0],top:+t[1]||0}:t)&&(this.offset.click.left=t.left+this.margins.left),"right"in t&&(this.offset.click.left=this.helperProportions.width-t.right+this.margins.left),"top"in t&&(this.offset.click.top=t.top+this.margins.top),"bottom"in t&&(this.offset.click.top=this.helperProportions.height-t.bottom+this.margins.top)},_isRootNode:function(t){return/(html|body)/i.test(t.tagName)||t===this.document[0]},_getParentOffset:function(){var t=this.offsetParent.offset(),e=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==e&&z.contains(this.scrollParent[0],this.offsetParent[0])&&(t.left+=this.scrollParent.scrollLeft(),t.top+=this.scrollParent.scrollTop()),{top:(t=this._isRootNode(this.offsetParent[0])?{top:0,left:0}:t).top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:t.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var t=this.element.position(),e=this._isRootNode(this.scrollParent[0]);return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+(e?0:this.scrollParent.scrollTop()),left:t.left-(parseInt(this.helper.css("left"),10)||0)+(e?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var t,e,i,s=this.options,o=this.document[0];this.relativeContainer=null,s.containment?"window"!==s.containment?"document"!==s.containment?s.containment.constructor!==Array?("parent"===s.containment&&(s.containment=this.helper[0].parentNode),(i=(e=z(s.containment))[0])&&(t=/(scroll|auto)/.test(e.css("overflow")),this.containment=[(parseInt(e.css("borderLeftWidth"),10)||0)+(parseInt(e.css("paddingLeft"),10)||0),(parseInt(e.css("borderTopWidth"),10)||0)+(parseInt(e.css("paddingTop"),10)||0),(t?Math.max(i.scrollWidth,i.offsetWidth):i.offsetWidth)-(parseInt(e.css("borderRightWidth"),10)||0)-(parseInt(e.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(t?Math.max(i.scrollHeight,i.offsetHeight):i.offsetHeight)-(parseInt(e.css("borderBottomWidth"),10)||0)-(parseInt(e.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=e)):this.containment=s.containment:this.containment=[0,0,z(o).width()-this.helperProportions.width-this.margins.left,(z(o).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]:this.containment=[z(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,z(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,z(window).scrollLeft()+z(window).width()-this.helperProportions.width-this.margins.left,z(window).scrollTop()+(z(window).height()||o.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]:this.containment=null},_convertPositionTo:function(t,e){e=e||this.position;var i="absolute"===t?1:-1,t=this._isRootNode(this.scrollParent[0]);return{top:e.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:t?0:this.offset.scroll.top)*i,left:e.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:t?0:this.offset.scroll.left)*i}},_generatePosition:function(t,e){var i,s=this.options,o=this._isRootNode(this.scrollParent[0]),n=t.pageX,a=t.pageY;return o&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),e&&(this.containment&&(i=this.relativeContainer?(i=this.relativeContainer.offset(),[this.containment[0]+i.left,this.containment[1]+i.top,this.containment[2]+i.left,this.containment[3]+i.top]):this.containment,t.pageX-this.offset.click.left<i[0]&&(n=i[0]+this.offset.click.left),t.pageY-this.offset.click.top<i[1]&&(a=i[1]+this.offset.click.top),t.pageX-this.offset.click.left>i[2]&&(n=i[2]+this.offset.click.left),t.pageY-this.offset.click.top>i[3]&&(a=i[3]+this.offset.click.top)),s.grid&&(t=s.grid[1]?this.originalPageY+Math.round((a-this.originalPageY)/s.grid[1])*s.grid[1]:this.originalPageY,a=!i||t-this.offset.click.top>=i[1]||t-this.offset.click.top>i[3]?t:t-this.offset.click.top>=i[1]?t-s.grid[1]:t+s.grid[1],t=s.grid[0]?this.originalPageX+Math.round((n-this.originalPageX)/s.grid[0])*s.grid[0]:this.originalPageX,n=!i||t-this.offset.click.left>=i[0]||t-this.offset.click.left>i[2]?t:t-this.offset.click.left>=i[0]?t-s.grid[0]:t+s.grid[0]),"y"===s.axis&&(n=this.originalPageX),"x"===s.axis&&(a=this.originalPageY)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:o?0:this.offset.scroll.top),left:n-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:o?0:this.offset.scroll.left)}},_clear:function(){this._removeClass(this.helper,"ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_trigger:function(t,e,i){return i=i||this._uiHash(),z.ui.plugin.call(this,t,[e,i,this],!0),/^(drag|start|stop)/.test(t)&&(this.positionAbs=this._convertPositionTo("absolute"),i.offset=this.positionAbs),z.Widget.prototype._trigger.call(this,t,e,i)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),z.ui.plugin.add("draggable","connectToSortable",{start:function(e,t,i){var s=z.extend({},t,{item:i.element});i.sortables=[],z(i.options.connectToSortable).each(function(){var t=z(this).sortable("instance");t&&!t.options.disabled&&(i.sortables.push(t),t.refreshPositions(),t._trigger("activate",e,s))})},stop:function(e,t,i){var s=z.extend({},t,{item:i.element});i.cancelHelperRemoval=!1,z.each(i.sortables,function(){var t=this;t.isOver?(t.isOver=0,i.cancelHelperRemoval=!0,t.cancelHelperRemoval=!1,t._storedCSS={position:t.placeholder.css("position"),top:t.placeholder.css("top"),left:t.placeholder.css("left")},t._mouseStop(e),t.options.helper=t.options._helper):(t.cancelHelperRemoval=!0,t._trigger("deactivate",e,s))})},drag:function(i,s,o){z.each(o.sortables,function(){var t=!1,e=this;e.positionAbs=o.positionAbs,e.helperProportions=o.helperProportions,e.offset.click=o.offset.click,e._intersectsWith(e.containerCache)&&(t=!0,z.each(o.sortables,function(){return this.positionAbs=o.positionAbs,this.helperProportions=o.helperProportions,this.offset.click=o.offset.click,t=this!==e&&this._intersectsWith(this.containerCache)&&z.contains(e.element[0],this.element[0])?!1:t})),t?(e.isOver||(e.isOver=1,o._parent=s.helper.parent(),e.currentItem=s.helper.appendTo(e.element).data("ui-sortable-item",!0),e.options._helper=e.options.helper,e.options.helper=function(){return s.helper[0]},i.target=e.currentItem[0],e._mouseCapture(i,!0),e._mouseStart(i,!0,!0),e.offset.click.top=o.offset.click.top,e.offset.click.left=o.offset.click.left,e.offset.parent.left-=o.offset.parent.left-e.offset.parent.left,e.offset.parent.top-=o.offset.parent.top-e.offset.parent.top,o._trigger("toSortable",i),o.dropped=e.element,z.each(o.sortables,function(){this.refreshPositions()}),o.currentItem=o.element,e.fromOutside=o),e.currentItem&&(e._mouseDrag(i),s.position=e.position)):e.isOver&&(e.isOver=0,e.cancelHelperRemoval=!0,e.options._revert=e.options.revert,e.options.revert=!1,e._trigger("out",i,e._uiHash(e)),e._mouseStop(i,!0),e.options.revert=e.options._revert,e.options.helper=e.options._helper,e.placeholder&&e.placeholder.remove(),s.helper.appendTo(o._parent),o._refreshOffsets(i),s.position=o._generatePosition(i,!0),o._trigger("fromSortable",i),o.dropped=!1,z.each(o.sortables,function(){this.refreshPositions()}))})}}),z.ui.plugin.add("draggable","cursor",{start:function(t,e,i){var s=z("body"),i=i.options;s.css("cursor")&&(i._cursor=s.css("cursor")),s.css("cursor",i.cursor)},stop:function(t,e,i){i=i.options;i._cursor&&z("body").css("cursor",i._cursor)}}),z.ui.plugin.add("draggable","opacity",{start:function(t,e,i){e=z(e.helper),i=i.options;e.css("opacity")&&(i._opacity=e.css("opacity")),e.css("opacity",i.opacity)},stop:function(t,e,i){i=i.options;i._opacity&&z(e.helper).css("opacity",i._opacity)}}),z.ui.plugin.add("draggable","scroll",{start:function(t,e,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(t,e,i){var s=i.options,o=!1,n=i.scrollParentNotHidden[0],a=i.document[0];n!==a&&"HTML"!==n.tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+n.offsetHeight-t.pageY<s.scrollSensitivity?n.scrollTop=o=n.scrollTop+s.scrollSpeed:t.pageY-i.overflowOffset.top<s.scrollSensitivity&&(n.scrollTop=o=n.scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+n.offsetWidth-t.pageX<s.scrollSensitivity?n.scrollLeft=o=n.scrollLeft+s.scrollSpeed:t.pageX-i.overflowOffset.left<s.scrollSensitivity&&(n.scrollLeft=o=n.scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(t.pageY-z(a).scrollTop()<s.scrollSensitivity?o=z(a).scrollTop(z(a).scrollTop()-s.scrollSpeed):z(window).height()-(t.pageY-z(a).scrollTop())<s.scrollSensitivity&&(o=z(a).scrollTop(z(a).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(t.pageX-z(a).scrollLeft()<s.scrollSensitivity?o=z(a).scrollLeft(z(a).scrollLeft()-s.scrollSpeed):z(window).width()-(t.pageX-z(a).scrollLeft())<s.scrollSensitivity&&(o=z(a).scrollLeft(z(a).scrollLeft()+s.scrollSpeed)))),!1!==o&&z.ui.ddmanager&&!s.dropBehaviour&&z.ui.ddmanager.prepareOffsets(i,t)}}),z.ui.plugin.add("draggable","snap",{start:function(t,e,i){var s=i.options;i.snapElements=[],z(s.snap.constructor!==String?s.snap.items||":data(ui-draggable)":s.snap).each(function(){var t=z(this),e=t.offset();this!==i.element[0]&&i.snapElements.push({item:this,width:t.outerWidth(),height:t.outerHeight(),top:e.top,left:e.left})})},drag:function(t,e,i){for(var s,o,n,a,r,h,l,p,u,c=i.options,d=c.snapTolerance,f=e.offset.left,g=f+i.helperProportions.width,m=e.offset.top,_=m+i.helperProportions.height,v=i.snapElements.length-1;0<=v;v--)h=(r=i.snapElements[v].left-i.margins.left)+i.snapElements[v].width,p=(l=i.snapElements[v].top-i.margins.top)+i.snapElements[v].height,g<r-d||h+d<f||_<l-d||p+d<m||!z.contains(i.snapElements[v].item.ownerDocument,i.snapElements[v].item)?(i.snapElements[v].snapping&&i.options.snap.release&&i.options.snap.release.call(i.element,t,z.extend(i._uiHash(),{snapItem:i.snapElements[v].item})),i.snapElements[v].snapping=!1):("inner"!==c.snapMode&&(s=Math.abs(l-_)<=d,o=Math.abs(p-m)<=d,n=Math.abs(r-g)<=d,a=Math.abs(h-f)<=d,s&&(e.position.top=i._convertPositionTo("relative",{top:l-i.helperProportions.height,left:0}).top),o&&(e.position.top=i._convertPositionTo("relative",{top:p,left:0}).top),n&&(e.position.left=i._convertPositionTo("relative",{top:0,left:r-i.helperProportions.width}).left),a&&(e.position.left=i._convertPositionTo("relative",{top:0,left:h}).left)),u=s||o||n||a,"outer"!==c.snapMode&&(s=Math.abs(l-m)<=d,o=Math.abs(p-_)<=d,n=Math.abs(r-f)<=d,a=Math.abs(h-g)<=d,s&&(e.position.top=i._convertPositionTo("relative",{top:l,left:0}).top),o&&(e.position.top=i._convertPositionTo("relative",{top:p-i.helperProportions.height,left:0}).top),n&&(e.position.left=i._convertPositionTo("relative",{top:0,left:r}).left),a&&(e.position.left=i._convertPositionTo("relative",{top:0,left:h-i.helperProportions.width}).left)),!i.snapElements[v].snapping&&(s||o||n||a||u)&&i.options.snap.snap&&i.options.snap.snap.call(i.element,t,z.extend(i._uiHash(),{snapItem:i.snapElements[v].item})),i.snapElements[v].snapping=s||o||n||a||u)}}),z.ui.plugin.add("draggable","stack",{start:function(t,e,i){var s,i=i.options,i=z.makeArray(z(i.stack)).sort(function(t,e){return(parseInt(z(t).css("zIndex"),10)||0)-(parseInt(z(e).css("zIndex"),10)||0)});i.length&&(s=parseInt(z(i[0]).css("zIndex"),10)||0,z(i).each(function(t){z(this).css("zIndex",s+t)}),this.css("zIndex",s+i.length))}}),z.ui.plugin.add("draggable","zIndex",{start:function(t,e,i){e=z(e.helper),i=i.options;e.css("zIndex")&&(i._zIndex=e.css("zIndex")),e.css("zIndex",i.zIndex)},stop:function(t,e,i){i=i.options;i._zIndex&&z(e.helper).css("zIndex",i._zIndex)}});z.ui.draggable;function d(t,e,i){return e<=t&&t<e+i}z.widget("ui.droppable",{version:"1.13.2",widgetEventPrefix:"drop",options:{accept:"*",addClasses:!0,greedy:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var t,e=this.options,i=e.accept;this.isover=!1,this.isout=!0,this.accept="function"==typeof i?i:function(t){return t.is(i)},this.proportions=function(){if(!arguments.length)return t=t||{width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};t=arguments[0]},this._addToManager(e.scope),e.addClasses&&this._addClass("ui-droppable")},_addToManager:function(t){z.ui.ddmanager.droppables[t]=z.ui.ddmanager.droppables[t]||[],z.ui.ddmanager.droppables[t].push(this)},_splice:function(t){for(var e=0;e<t.length;e++)t[e]===this&&t.splice(e,1)},_destroy:function(){var t=z.ui.ddmanager.droppables[this.options.scope];this._splice(t)},_setOption:function(t,e){var i;"accept"===t?this.accept="function"==typeof e?e:function(t){return t.is(e)}:"scope"===t&&(i=z.ui.ddmanager.droppables[this.options.scope],this._splice(i),this._addToManager(e)),this._super(t,e)},_activate:function(t){var e=z.ui.ddmanager.current;this._addActiveClass(),e&&this._trigger("activate",t,this.ui(e))},_deactivate:function(t){var e=z.ui.ddmanager.current;this._removeActiveClass(),e&&this._trigger("deactivate",t,this.ui(e))},_over:function(t){var e=z.ui.ddmanager.current;e&&(e.currentItem||e.element)[0]!==this.element[0]&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this._addHoverClass(),this._trigger("over",t,this.ui(e)))},_out:function(t){var e=z.ui.ddmanager.current;e&&(e.currentItem||e.element)[0]!==this.element[0]&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this._removeHoverClass(),this._trigger("out",t,this.ui(e)))},_drop:function(e,t){var i=t||z.ui.ddmanager.current,s=!1;return!(!i||(i.currentItem||i.element)[0]===this.element[0])&&(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var t=z(this).droppable("instance");if(t.options.greedy&&!t.options.disabled&&t.options.scope===i.options.scope&&t.accept.call(t.element[0],i.currentItem||i.element)&&z.ui.intersect(i,z.extend(t,{offset:t.element.offset()}),t.options.tolerance,e))return!(s=!0)}),!s&&(!!this.accept.call(this.element[0],i.currentItem||i.element)&&(this._removeActiveClass(),this._removeHoverClass(),this._trigger("drop",e,this.ui(i)),this.element)))},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}},_addHoverClass:function(){this._addClass("ui-droppable-hover")},_removeHoverClass:function(){this._removeClass("ui-droppable-hover")},_addActiveClass:function(){this._addClass("ui-droppable-active")},_removeActiveClass:function(){this._removeClass("ui-droppable-active")}}),z.ui.intersect=function(t,e,i,s){if(!e.offset)return!1;var o=(t.positionAbs||t.position.absolute).left+t.margins.left,n=(t.positionAbs||t.position.absolute).top+t.margins.top,a=o+t.helperProportions.width,r=n+t.helperProportions.height,h=e.offset.left,l=e.offset.top,p=h+e.proportions().width,u=l+e.proportions().height;switch(i){case"fit":return h<=o&&a<=p&&l<=n&&r<=u;case"intersect":return h<o+t.helperProportions.width/2&&a-t.helperProportions.width/2<p&&l<n+t.helperProportions.height/2&&r-t.helperProportions.height/2<u;case"pointer":return d(s.pageY,l,e.proportions().height)&&d(s.pageX,h,e.proportions().width);case"touch":return(l<=n&&n<=u||l<=r&&r<=u||n<l&&u<r)&&(h<=o&&o<=p||h<=a&&a<=p||o<h&&p<a);default:return!1}},!(z.ui.ddmanager={current:null,droppables:{default:[]},prepareOffsets:function(t,e){var i,s,o=z.ui.ddmanager.droppables[t.options.scope]||[],n=e?e.type:null,a=(t.currentItem||t.element).find(":data(ui-droppable)").addBack();t:for(i=0;i<o.length;i++)if(!(o[i].options.disabled||t&&!o[i].accept.call(o[i].element[0],t.currentItem||t.element))){for(s=0;s<a.length;s++)if(a[s]===o[i].element[0]){o[i].proportions().height=0;continue t}o[i].visible="none"!==o[i].element.css("display"),o[i].visible&&("mousedown"===n&&o[i]._activate.call(o[i],e),o[i].offset=o[i].element.offset(),o[i].proportions({width:o[i].element[0].offsetWidth,height:o[i].element[0].offsetHeight}))}},drop:function(t,e){var i=!1;return z.each((z.ui.ddmanager.droppables[t.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&z.ui.intersect(t,this,this.options.tolerance,e)&&(i=this._drop.call(this,e)||i),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],t.currentItem||t.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,e)))}),i},dragStart:function(t,e){t.element.parentsUntil("body").on("scroll.droppable",function(){t.options.refreshPositions||z.ui.ddmanager.prepareOffsets(t,e)})},drag:function(o,n){o.options.refreshPositions&&z.ui.ddmanager.prepareOffsets(o,n),z.each(z.ui.ddmanager.droppables[o.options.scope]||[],function(){var t,e,i,s;this.options.disabled||this.greedyChild||!this.visible||(s=!(i=z.ui.intersect(o,this,this.options.tolerance,n))&&this.isover?"isout":i&&!this.isover?"isover":null)&&(this.options.greedy&&(e=this.options.scope,(i=this.element.parents(":data(ui-droppable)").filter(function(){return z(this).droppable("instance").options.scope===e})).length&&((t=z(i[0]).droppable("instance")).greedyChild="isover"===s)),t&&"isover"===s&&(t.isover=!1,t.isout=!0,t._out.call(t,n)),this[s]=!0,this["isout"===s?"isover":"isout"]=!1,this["isover"===s?"_over":"_out"].call(this,n),t&&"isout"===s&&(t.isout=!1,t.isover=!0,t._over.call(t,n)))})},dragStop:function(t,e){t.element.parentsUntil("body").off("scroll.droppable"),t.options.refreshPositions||z.ui.ddmanager.prepareOffsets(t,e)}})!==z.uiBackCompat&&z.widget("ui.droppable",z.ui.droppable,{options:{hoverClass:!1,activeClass:!1},_addActiveClass:function(){this._super(),this.options.activeClass&&this.element.addClass(this.options.activeClass)},_removeActiveClass:function(){this._super(),this.options.activeClass&&this.element.removeClass(this.options.activeClass)},_addHoverClass:function(){this._super(),this.options.hoverClass&&this.element.addClass(this.options.hoverClass)},_removeHoverClass:function(){this._super(),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass)}});z.ui.droppable;z.widget("ui.resizable",z.ui.mouse,{version:"1.13.2",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,classes:{"ui-resizable-se":"ui-icon ui-icon-gripsmall-diagonal-se"},containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_num:function(t){return parseFloat(t)||0},_isNumber:function(t){return!isNaN(parseFloat(t))},_hasScroll:function(t,e){if("hidden"===z(t).css("overflow"))return!1;var i=e&&"left"===e?"scrollLeft":"scrollTop",e=!1;if(0<t[i])return!0;try{t[i]=1,e=0<t[i],t[i]=0}catch(t){}return e},_create:function(){var t,e=this.options,i=this;this._addClass("ui-resizable"),z.extend(this,{_aspectRatio:!!e.aspectRatio,aspectRatio:e.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:e.helper||e.ghost||e.animate?e.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i)&&(this.element.wrap(z("<div class='ui-wrapper'></div>").css({overflow:"hidden",position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.resizable("instance")),this.elementIsWrapper=!0,t={marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom"),marginLeft:this.originalElement.css("marginLeft")},this.element.css(t),this.originalElement.css("margin",0),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css(t),this._proportionallyResize()),this._setupHandles(),e.autoHide&&z(this.element).on("mouseenter",function(){e.disabled||(i._removeClass("ui-resizable-autohide"),i._handles.show())}).on("mouseleave",function(){e.disabled||i.resizing||(i._addClass("ui-resizable-autohide"),i._handles.hide())}),this._mouseInit()},_destroy:function(){this._mouseDestroy(),this._addedHandles.remove();function t(t){z(t).removeData("resizable").removeData("ui-resizable").off(".resizable")}var e;return this.elementIsWrapper&&(t(this.element),e=this.element,this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")}).insertAfter(e),e.remove()),this.originalElement.css("resize",this.originalResizeStyle),t(this.originalElement),this},_setOption:function(t,e){switch(this._super(t,e),t){case"handles":this._removeHandles(),this._setupHandles();break;case"aspectRatio":this._aspectRatio=!!e}},_setupHandles:function(){var t,e,i,s,o,n=this.options,a=this;if(this.handles=n.handles||(z(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this._handles=z(),this._addedHandles=z(),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),i=this.handles.split(","),this.handles={},e=0;e<i.length;e++)s="ui-resizable-"+(t=String.prototype.trim.call(i[e])),o=z("<div>"),this._addClass(o,"ui-resizable-handle "+s),o.css({zIndex:n.zIndex}),this.handles[t]=".ui-resizable-"+t,this.element.children(this.handles[t]).length||(this.element.append(o),this._addedHandles=this._addedHandles.add(o));this._renderAxis=function(t){var e,i,s;for(e in t=t||this.element,this.handles)this.handles[e].constructor===String?this.handles[e]=this.element.children(this.handles[e]).first().show():(this.handles[e].jquery||this.handles[e].nodeType)&&(this.handles[e]=z(this.handles[e]),this._on(this.handles[e],{mousedown:a._mouseDown})),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i)&&(i=z(this.handles[e],this.element),s=/sw|ne|nw|se|n|s/.test(e)?i.outerHeight():i.outerWidth(),i=["padding",/ne|nw|n/.test(e)?"Top":/se|sw|s/.test(e)?"Bottom":/^e$/.test(e)?"Right":"Left"].join(""),t.css(i,s),this._proportionallyResize()),this._handles=this._handles.add(this.handles[e])},this._renderAxis(this.element),this._handles=this._handles.add(this.element.find(".ui-resizable-handle")),this._handles.disableSelection(),this._handles.on("mouseover",function(){a.resizing||(this.className&&(o=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),a.axis=o&&o[1]?o[1]:"se")}),n.autoHide&&(this._handles.hide(),this._addClass("ui-resizable-autohide"))},_removeHandles:function(){this._addedHandles.remove()},_mouseCapture:function(t){var e,i,s=!1;for(e in this.handles)(i=z(this.handles[e])[0])!==t.target&&!z.contains(i,t.target)||(s=!0);return!this.options.disabled&&s},_mouseStart:function(t){var e,i,s=this.options,o=this.element;return this.resizing=!0,this._renderProxy(),e=this._num(this.helper.css("left")),i=this._num(this.helper.css("top")),s.containment&&(e+=z(s.containment).scrollLeft()||0,i+=z(s.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:e,top:i},this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:o.width(),height:o.height()},this.originalSize=this._helper?{width:o.outerWidth(),height:o.outerHeight()}:{width:o.width(),height:o.height()},this.sizeDiff={width:o.outerWidth()-o.width(),height:o.outerHeight()-o.height()},this.originalPosition={left:e,top:i},this.originalMousePosition={left:t.pageX,top:t.pageY},this.aspectRatio="number"==typeof s.aspectRatio?s.aspectRatio:this.originalSize.width/this.originalSize.height||1,s=z(".ui-resizable-"+this.axis).css("cursor"),z("body").css("cursor","auto"===s?this.axis+"-resize":s),this._addClass("ui-resizable-resizing"),this._propagate("start",t),!0},_mouseDrag:function(t){var e=this.originalMousePosition,i=this.axis,s=t.pageX-e.left||0,e=t.pageY-e.top||0,i=this._change[i];return this._updatePrevProperties(),i&&(e=i.apply(this,[t,s,e]),this._updateVirtualBoundaries(t.shiftKey),(this._aspectRatio||t.shiftKey)&&(e=this._updateRatio(e,t)),e=this._respectSize(e,t),this._updateCache(e),this._propagate("resize",t),e=this._applyChanges(),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),z.isEmptyObject(e)||(this._updatePrevProperties(),this._trigger("resize",t,this.ui()),this._applyChanges())),!1},_mouseStop:function(t){this.resizing=!1;var e,i,s,o=this.options,n=this;return this._helper&&(s=(e=(i=this._proportionallyResizeElements).length&&/textarea/i.test(i[0].nodeName))&&this._hasScroll(i[0],"left")?0:n.sizeDiff.height,i=e?0:n.sizeDiff.width,e={width:n.helper.width()-i,height:n.helper.height()-s},i=parseFloat(n.element.css("left"))+(n.position.left-n.originalPosition.left)||null,s=parseFloat(n.element.css("top"))+(n.position.top-n.originalPosition.top)||null,o.animate||this.element.css(z.extend(e,{top:s,left:i})),n.helper.height(n.size.height),n.helper.width(n.size.width),this._helper&&!o.animate&&this._proportionallyResize()),z("body").css("cursor","auto"),this._removeClass("ui-resizable-resizing"),this._propagate("stop",t),this._helper&&this.helper.remove(),!1},_updatePrevProperties:function(){this.prevPosition={top:this.position.top,left:this.position.left},this.prevSize={width:this.size.width,height:this.size.height}},_applyChanges:function(){var t={};return this.position.top!==this.prevPosition.top&&(t.top=this.position.top+"px"),this.position.left!==this.prevPosition.left&&(t.left=this.position.left+"px"),this.size.width!==this.prevSize.width&&(t.width=this.size.width+"px"),this.size.height!==this.prevSize.height&&(t.height=this.size.height+"px"),this.helper.css(t),t},_updateVirtualBoundaries:function(t){var e,i,s=this.options,o={minWidth:this._isNumber(s.minWidth)?s.minWidth:0,maxWidth:this._isNumber(s.maxWidth)?s.maxWidth:1/0,minHeight:this._isNumber(s.minHeight)?s.minHeight:0,maxHeight:this._isNumber(s.maxHeight)?s.maxHeight:1/0};(this._aspectRatio||t)&&(e=o.minHeight*this.aspectRatio,i=o.minWidth/this.aspectRatio,s=o.maxHeight*this.aspectRatio,t=o.maxWidth/this.aspectRatio,e>o.minWidth&&(o.minWidth=e),i>o.minHeight&&(o.minHeight=i),s<o.maxWidth&&(o.maxWidth=s),t<o.maxHeight&&(o.maxHeight=t)),this._vBoundaries=o},_updateCache:function(t){this.offset=this.helper.offset(),this._isNumber(t.left)&&(this.position.left=t.left),this._isNumber(t.top)&&(this.position.top=t.top),this._isNumber(t.height)&&(this.size.height=t.height),this._isNumber(t.width)&&(this.size.width=t.width)},_updateRatio:function(t){var e=this.position,i=this.size,s=this.axis;return this._isNumber(t.height)?t.width=t.height*this.aspectRatio:this._isNumber(t.width)&&(t.height=t.width/this.aspectRatio),"sw"===s&&(t.left=e.left+(i.width-t.width),t.top=null),"nw"===s&&(t.top=e.top+(i.height-t.height),t.left=e.left+(i.width-t.width)),t},_respectSize:function(t){var e=this._vBoundaries,i=this.axis,s=this._isNumber(t.width)&&e.maxWidth&&e.maxWidth<t.width,o=this._isNumber(t.height)&&e.maxHeight&&e.maxHeight<t.height,n=this._isNumber(t.width)&&e.minWidth&&e.minWidth>t.width,a=this._isNumber(t.height)&&e.minHeight&&e.minHeight>t.height,r=this.originalPosition.left+this.originalSize.width,h=this.originalPosition.top+this.originalSize.height,l=/sw|nw|w/.test(i),i=/nw|ne|n/.test(i);return n&&(t.width=e.minWidth),a&&(t.height=e.minHeight),s&&(t.width=e.maxWidth),o&&(t.height=e.maxHeight),n&&l&&(t.left=r-e.minWidth),s&&l&&(t.left=r-e.maxWidth),a&&i&&(t.top=h-e.minHeight),o&&i&&(t.top=h-e.maxHeight),t.width||t.height||t.left||!t.top?t.width||t.height||t.top||!t.left||(t.left=null):t.top=null,t},_getPaddingPlusBorderDimensions:function(t){for(var e=0,i=[],s=[t.css("borderTopWidth"),t.css("borderRightWidth"),t.css("borderBottomWidth"),t.css("borderLeftWidth")],o=[t.css("paddingTop"),t.css("paddingRight"),t.css("paddingBottom"),t.css("paddingLeft")];e<4;e++)i[e]=parseFloat(s[e])||0,i[e]+=parseFloat(o[e])||0;return{height:i[0]+i[2],width:i[1]+i[3]}},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var t,e=0,i=this.helper||this.element;e<this._proportionallyResizeElements.length;e++)t=this._proportionallyResizeElements[e],this.outerDimensions||(this.outerDimensions=this._getPaddingPlusBorderDimensions(t)),t.css({height:i.height()-this.outerDimensions.height||0,width:i.width()-this.outerDimensions.width||0})},_renderProxy:function(){var t=this.element,e=this.options;this.elementOffset=t.offset(),this._helper?(this.helper=this.helper||z("<div></div>").css({overflow:"hidden"}),this._addClass(this.helper,this._helper),this.helper.css({width:this.element.outerWidth(),height:this.element.outerHeight(),position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++e.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(t,e){return{width:this.originalSize.width+e}},w:function(t,e){var i=this.originalSize;return{left:this.originalPosition.left+e,width:i.width-e}},n:function(t,e,i){var s=this.originalSize;return{top:this.originalPosition.top+i,height:s.height-i}},s:function(t,e,i){return{height:this.originalSize.height+i}},se:function(t,e,i){return z.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[t,e,i]))},sw:function(t,e,i){return z.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[t,e,i]))},ne:function(t,e,i){return z.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[t,e,i]))},nw:function(t,e,i){return z.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[t,e,i]))}},_propagate:function(t,e){z.ui.plugin.call(this,t,[e,this.ui()]),"resize"!==t&&this._trigger(t,e,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),z.ui.plugin.add("resizable","animate",{stop:function(e){var i=z(this).resizable("instance"),t=i.options,s=i._proportionallyResizeElements,o=s.length&&/textarea/i.test(s[0].nodeName),n=o&&i._hasScroll(s[0],"left")?0:i.sizeDiff.height,a=o?0:i.sizeDiff.width,o={width:i.size.width-a,height:i.size.height-n},a=parseFloat(i.element.css("left"))+(i.position.left-i.originalPosition.left)||null,n=parseFloat(i.element.css("top"))+(i.position.top-i.originalPosition.top)||null;i.element.animate(z.extend(o,n&&a?{top:n,left:a}:{}),{duration:t.animateDuration,easing:t.animateEasing,step:function(){var t={width:parseFloat(i.element.css("width")),height:parseFloat(i.element.css("height")),top:parseFloat(i.element.css("top")),left:parseFloat(i.element.css("left"))};s&&s.length&&z(s[0]).css({width:t.width,height:t.height}),i._updateCache(t),i._propagate("resize",e)}})}}),z.ui.plugin.add("resizable","containment",{start:function(){var i,s,o=z(this).resizable("instance"),t=o.options,e=o.element,n=t.containment,a=n instanceof z?n.get(0):/parent/.test(n)?e.parent().get(0):n;a&&(o.containerElement=z(a),/document/.test(n)||n===document?(o.containerOffset={left:0,top:0},o.containerPosition={left:0,top:0},o.parentData={element:z(document),left:0,top:0,width:z(document).width(),height:z(document).height()||document.body.parentNode.scrollHeight}):(i=z(a),s=[],z(["Top","Right","Left","Bottom"]).each(function(t,e){s[t]=o._num(i.css("padding"+e))}),o.containerOffset=i.offset(),o.containerPosition=i.position(),o.containerSize={height:i.innerHeight()-s[3],width:i.innerWidth()-s[1]},t=o.containerOffset,e=o.containerSize.height,n=o.containerSize.width,n=o._hasScroll(a,"left")?a.scrollWidth:n,e=o._hasScroll(a)?a.scrollHeight:e,o.parentData={element:a,left:t.left,top:t.top,width:n,height:e}))},resize:function(t){var e=z(this).resizable("instance"),i=e.options,s=e.containerOffset,o=e.position,n=e._aspectRatio||t.shiftKey,a={top:0,left:0},r=e.containerElement,t=!0;r[0]!==document&&/static/.test(r.css("position"))&&(a=s),o.left<(e._helper?s.left:0)&&(e.size.width=e.size.width+(e._helper?e.position.left-s.left:e.position.left-a.left),n&&(e.size.height=e.size.width/e.aspectRatio,t=!1),e.position.left=i.helper?s.left:0),o.top<(e._helper?s.top:0)&&(e.size.height=e.size.height+(e._helper?e.position.top-s.top:e.position.top),n&&(e.size.width=e.size.height*e.aspectRatio,t=!1),e.position.top=e._helper?s.top:0),i=e.containerElement.get(0)===e.element.parent().get(0),o=/relative|absolute/.test(e.containerElement.css("position")),i&&o?(e.offset.left=e.parentData.left+e.position.left,e.offset.top=e.parentData.top+e.position.top):(e.offset.left=e.element.offset().left,e.offset.top=e.element.offset().top),o=Math.abs(e.sizeDiff.width+(e._helper?e.offset.left-a.left:e.offset.left-s.left)),s=Math.abs(e.sizeDiff.height+(e._helper?e.offset.top-a.top:e.offset.top-s.top)),o+e.size.width>=e.parentData.width&&(e.size.width=e.parentData.width-o,n&&(e.size.height=e.size.width/e.aspectRatio,t=!1)),s+e.size.height>=e.parentData.height&&(e.size.height=e.parentData.height-s,n&&(e.size.width=e.size.height*e.aspectRatio,t=!1)),t||(e.position.left=e.prevPosition.left,e.position.top=e.prevPosition.top,e.size.width=e.prevSize.width,e.size.height=e.prevSize.height)},stop:function(){var t=z(this).resizable("instance"),e=t.options,i=t.containerOffset,s=t.containerPosition,o=t.containerElement,n=z(t.helper),a=n.offset(),r=n.outerWidth()-t.sizeDiff.width,n=n.outerHeight()-t.sizeDiff.height;t._helper&&!e.animate&&/relative/.test(o.css("position"))&&z(this).css({left:a.left-s.left-i.left,width:r,height:n}),t._helper&&!e.animate&&/static/.test(o.css("position"))&&z(this).css({left:a.left-s.left-i.left,width:r,height:n})}}),z.ui.plugin.add("resizable","alsoResize",{start:function(){var t=z(this).resizable("instance").options;z(t.alsoResize).each(function(){var t=z(this);t.data("ui-resizable-alsoresize",{width:parseFloat(t.width()),height:parseFloat(t.height()),left:parseFloat(t.css("left")),top:parseFloat(t.css("top"))})})},resize:function(t,i){var e=z(this).resizable("instance"),s=e.options,o=e.originalSize,n=e.originalPosition,a={height:e.size.height-o.height||0,width:e.size.width-o.width||0,top:e.position.top-n.top||0,left:e.position.left-n.left||0};z(s.alsoResize).each(function(){var t=z(this),s=z(this).data("ui-resizable-alsoresize"),o={},e=t.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];z.each(e,function(t,e){var i=(s[e]||0)+(a[e]||0);i&&0<=i&&(o[e]=i||null)}),t.css(o)})},stop:function(){z(this).removeData("ui-resizable-alsoresize")}}),z.ui.plugin.add("resizable","ghost",{start:function(){var t=z(this).resizable("instance"),e=t.size;t.ghost=t.originalElement.clone(),t.ghost.css({opacity:.25,display:"block",position:"relative",height:e.height,width:e.width,margin:0,left:0,top:0}),t._addClass(t.ghost,"ui-resizable-ghost"),!1!==z.uiBackCompat&&"string"==typeof t.options.ghost&&t.ghost.addClass(this.options.ghost),t.ghost.appendTo(t.helper)},resize:function(){var t=z(this).resizable("instance");t.ghost&&t.ghost.css({position:"relative",height:t.size.height,width:t.size.width})},stop:function(){var t=z(this).resizable("instance");t.ghost&&t.helper&&t.helper.get(0).removeChild(t.ghost.get(0))}}),z.ui.plugin.add("resizable","grid",{resize:function(){var t,e=z(this).resizable("instance"),i=e.options,s=e.size,o=e.originalSize,n=e.originalPosition,a=e.axis,r="number"==typeof i.grid?[i.grid,i.grid]:i.grid,h=r[0]||1,l=r[1]||1,p=Math.round((s.width-o.width)/h)*h,u=Math.round((s.height-o.height)/l)*l,c=o.width+p,d=o.height+u,f=i.maxWidth&&i.maxWidth<c,g=i.maxHeight&&i.maxHeight<d,m=i.minWidth&&i.minWidth>c,s=i.minHeight&&i.minHeight>d;i.grid=r,m&&(c+=h),s&&(d+=l),f&&(c-=h),g&&(d-=l),/^(se|s|e)$/.test(a)?(e.size.width=c,e.size.height=d):/^(ne)$/.test(a)?(e.size.width=c,e.size.height=d,e.position.top=n.top-u):/^(sw)$/.test(a)?(e.size.width=c,e.size.height=d,e.position.left=n.left-p):((d-l<=0||c-h<=0)&&(t=e._getPaddingPlusBorderDimensions(this)),0<d-l?(e.size.height=d,e.position.top=n.top-u):(d=l-t.height,e.size.height=d,e.position.top=n.top+o.height-d),0<c-h?(e.size.width=c,e.position.left=n.left-p):(c=h-t.width,e.size.width=c,e.position.left=n.left+o.width-c))}});z.ui.resizable,z.widget("ui.slider",z.ui.mouse,{version:"1.13.2",widgetEventPrefix:"slide",options:{animate:!1,classes:{"ui-slider":"ui-corner-all","ui-slider-handle":"ui-corner-all","ui-slider-range":"ui-corner-all ui-widget-header"},distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},numPages:5,_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this._calculateNewMax(),this._addClass("ui-slider ui-slider-"+this.orientation,"ui-widget ui-widget-content"),this._refresh(),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var t,e=this.options,i=this.element.find(".ui-slider-handle"),s=[],o=e.values&&e.values.length||1;for(i.length>o&&(i.slice(o).remove(),i=i.slice(0,o)),t=i.length;t<o;t++)s.push("<span tabindex='0'></span>");this.handles=i.add(z(s.join("")).appendTo(this.element)),this._addClass(this.handles,"ui-slider-handle","ui-state-default"),this.handle=this.handles.eq(0),this.handles.each(function(t){z(this).data("ui-slider-handle-index",t).attr("tabIndex",0)})},_createRange:function(){var t=this.options;t.range?(!0===t.range&&(t.values?t.values.length&&2!==t.values.length?t.values=[t.values[0],t.values[0]]:Array.isArray(t.values)&&(t.values=t.values.slice(0)):t.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?(this._removeClass(this.range,"ui-slider-range-min ui-slider-range-max"),this.range.css({left:"",bottom:""})):(this.range=z("<div>").appendTo(this.element),this._addClass(this.range,"ui-slider-range")),"min"!==t.range&&"max"!==t.range||this._addClass(this.range,"ui-slider-range-"+t.range)):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){this._off(this.handles),this._on(this.handles,this._handleEvents),this._hoverable(this.handles),this._focusable(this.handles)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this._mouseDestroy()},_mouseCapture:function(t){var i,s,o,n,e,a,r=this,h=this.options;return!h.disabled&&(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),a={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(a),s=this._valueMax()-this._valueMin()+1,this.handles.each(function(t){var e=Math.abs(i-r.values(t));(e<s||s===e&&(t===r._lastChangedValue||r.values(t)===h.min))&&(s=e,o=z(this),n=t)}),!1!==this._start(t,n)&&(this._mouseSliding=!0,this._handleIndex=n,this._addClass(o,null,"ui-state-active"),o.trigger("focus"),e=o.offset(),a=!z(t.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=a?{left:0,top:0}:{left:t.pageX-e.left-o.width()/2,top:t.pageY-e.top-o.height()/2-(parseInt(o.css("borderTopWidth"),10)||0)-(parseInt(o.css("borderBottomWidth"),10)||0)+(parseInt(o.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(t,n,i),this._animateOff=!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},e=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,e),!1},_mouseStop:function(t){return this._removeClass(this.handles,null,"ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,t="horizontal"===this.orientation?(e=this.elementSize.width,t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),t=t/e;return(t=1<t?1:t)<0&&(t=0),"vertical"===this.orientation&&(t=1-t),e=this._valueMax()-this._valueMin(),e=this._valueMin()+t*e,this._trimAlignValue(e)},_uiHash:function(t,e,i){var s={handle:this.handles[t],handleIndex:t,value:void 0!==e?e:this.value()};return this._hasMultipleValues()&&(s.value=void 0!==e?e:this.values(t),s.values=i||this.values()),s},_hasMultipleValues:function(){return this.options.values&&this.options.values.length},_start:function(t,e){return this._trigger("start",t,this._uiHash(e))},_slide:function(t,e,i){var s,o=this.value(),n=this.values();this._hasMultipleValues()&&(s=this.values(e?0:1),o=this.values(e),2===this.options.values.length&&!0===this.options.range&&(i=0===e?Math.min(s,i):Math.max(s,i)),n[e]=i),i!==o&&!1!==this._trigger("slide",t,this._uiHash(e,i,n))&&(this._hasMultipleValues()?this.values(e,i):this.value(i))},_stop:function(t,e){this._trigger("stop",t,this._uiHash(e))},_change:function(t,e){this._keySliding||this._mouseSliding||(this._lastChangedValue=e,this._trigger("change",t,this._uiHash(e)))},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),void this._change(null,0)):this._value()},values:function(t,e){var i,s,o;if(1<arguments.length)return this.options.values[t]=this._trimAlignValue(e),this._refreshValue(),void this._change(null,t);if(!arguments.length)return this._values();if(!Array.isArray(t))return this._hasMultipleValues()?this._values(t):this.value();for(i=this.options.values,s=t,o=0;o<i.length;o+=1)i[o]=this._trimAlignValue(s[o]),this._change(null,o);this._refreshValue()},_setOption:function(t,e){var i,s=0;switch("range"===t&&!0===this.options.range&&("min"===e?(this.options.value=this._values(0),this.options.values=null):"max"===e&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),Array.isArray(this.options.values)&&(s=this.options.values.length),this._super(t,e),t){case"orientation":this._detectOrientation(),this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-"+this.orientation),this._refreshValue(),this.options.range&&this._refreshRange(e),this.handles.css("horizontal"===e?"bottom":"left","");break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),i=s-1;0<=i;i--)this._change(null,i);this._animateOff=!1;break;case"step":case"min":case"max":this._animateOff=!0,this._calculateNewMax(),this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_setOptionDisabled:function(t){this._super(t),this._toggleClass(null,"ui-state-disabled",!!t)},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i;if(arguments.length)return t=this.options.values[t],t=this._trimAlignValue(t);if(this._hasMultipleValues()){for(e=this.options.values.slice(),i=0;i<e.length;i+=1)e[i]=this._trimAlignValue(e[i]);return e}return[]},_trimAlignValue:function(t){if(t<=this._valueMin())return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=0<this.options.step?this.options.step:1,i=(t-this._valueMin())%e,t=t-i;return 2*Math.abs(i)>=e&&(t+=0<i?e:-e),parseFloat(t.toFixed(5))},_calculateNewMax:function(){var t=this.options.max,e=this._valueMin(),i=this.options.step;(t=Math.round((t-e)/i)*i+e)>this.options.max&&(t-=i),this.max=parseFloat(t.toFixed(this._precision()))},_precision:function(){var t=this._precisionOf(this.options.step);return t=null!==this.options.min?Math.max(t,this._precisionOf(this.options.min)):t},_precisionOf:function(t){var e=t.toString(),t=e.indexOf(".");return-1===t?0:e.length-t-1},_valueMin:function(){return this.options.min},_valueMax:function(){return this.max},_refreshRange:function(t){"vertical"===t&&this.range.css({width:"",left:""}),"horizontal"===t&&this.range.css({height:"",bottom:""})},_refreshValue:function(){var e,i,t,s,o,n=this.options.range,a=this.options,r=this,h=!this._animateOff&&a.animate,l={};this._hasMultipleValues()?this.handles.each(function(t){i=(r.values(t)-r._valueMin())/(r._valueMax()-r._valueMin())*100,l["horizontal"===r.orientation?"left":"bottom"]=i+"%",z(this).stop(1,1)[h?"animate":"css"](l,a.animate),!0===r.options.range&&("horizontal"===r.orientation?(0===t&&r.range.stop(1,1)[h?"animate":"css"]({left:i+"%"},a.animate),1===t&&r.range[h?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:a.animate})):(0===t&&r.range.stop(1,1)[h?"animate":"css"]({bottom:i+"%"},a.animate),1===t&&r.range[h?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:a.animate}))),e=i}):(t=this.value(),s=this._valueMin(),o=this._valueMax(),i=o!==s?(t-s)/(o-s)*100:0,l["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[h?"animate":"css"](l,a.animate),"min"===n&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:i+"%"},a.animate),"max"===n&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:100-i+"%"},a.animate),"min"===n&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:i+"%"},a.animate),"max"===n&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:100-i+"%"},a.animate))},_handleEvents:{keydown:function(t){var e,i,s,o=z(t.target).data("ui-slider-handle-index");switch(t.keyCode){case z.ui.keyCode.HOME:case z.ui.keyCode.END:case z.ui.keyCode.PAGE_UP:case z.ui.keyCode.PAGE_DOWN:case z.ui.keyCode.UP:case z.ui.keyCode.RIGHT:case z.ui.keyCode.DOWN:case z.ui.keyCode.LEFT:if(t.preventDefault(),!this._keySliding&&(this._keySliding=!0,this._addClass(z(t.target),null,"ui-state-active"),!1===this._start(t,o)))return}switch(s=this.options.step,e=i=this._hasMultipleValues()?this.values(o):this.value(),t.keyCode){case z.ui.keyCode.HOME:i=this._valueMin();break;case z.ui.keyCode.END:i=this._valueMax();break;case z.ui.keyCode.PAGE_UP:i=this._trimAlignValue(e+(this._valueMax()-this._valueMin())/this.numPages);break;case z.ui.keyCode.PAGE_DOWN:i=this._trimAlignValue(e-(this._valueMax()-this._valueMin())/this.numPages);break;case z.ui.keyCode.UP:case z.ui.keyCode.RIGHT:if(e===this._valueMax())return;i=this._trimAlignValue(e+s);break;case z.ui.keyCode.DOWN:case z.ui.keyCode.LEFT:if(e===this._valueMin())return;i=this._trimAlignValue(e-s)}this._slide(t,o,i)},keyup:function(t){var e=z(t.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(t,e),this._change(t,e),this._removeClass(z(t.target),null,"ui-state-active"))}}})});
```

### `public\js\jquery.js`

- **Size:** 87464 bytes
- **Extension:** `.js`

```javascript
/*! jQuery v3.7.0 | (c) OpenJS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(ie,e){"use strict";var oe=[],r=Object.getPrototypeOf,ae=oe.slice,g=oe.flat?function(e){return oe.flat.call(e)}:function(e){return oe.concat.apply([],e)},s=oe.push,se=oe.indexOf,n={},i=n.toString,ue=n.hasOwnProperty,o=ue.toString,a=o.call(Object),le={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType&&"function"!=typeof e.item},y=function(e){return null!=e&&e===e.window},C=ie.document,u={type:!0,src:!0,nonce:!0,noModule:!0};function m(e,t,n){var r,i,o=(n=n||C).createElement("script");if(o.text=e,t)for(r in u)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?n[i.call(e)]||"object":typeof e}var t="3.7.0",l=/HTML$/i,ce=function(e,t){return new ce.fn.init(e,t)};function c(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!v(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&0<t&&t-1 in e)}function fe(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}ce.fn=ce.prototype={jquery:t,constructor:ce,length:0,toArray:function(){return ae.call(this)},get:function(e){return null==e?ae.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=ce.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return ce.each(this,e)},map:function(n){return this.pushStack(ce.map(this,function(e,t){return n.call(e,t,e)}))},slice:function(){return this.pushStack(ae.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(ce.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(ce.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:oe.sort,splice:oe.splice},ce.extend=ce.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||v(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(ce.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||ce.isPlainObject(n)?n:{},i=!1,a[t]=ce.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},ce.extend({expando:"jQuery"+(t+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==i.call(e))&&(!(t=r(e))||"function"==typeof(n=ue.call(t,"constructor")&&t.constructor)&&o.call(n)===a)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){m(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(c(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},text:function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i)return e.textContent;if(3===i||4===i)return e.nodeValue}else while(t=e[r++])n+=ce.text(t);return n},makeArray:function(e,t){var n=t||[];return null!=e&&(c(Object(e))?ce.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:se.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!l.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(c(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return g(a)},guid:1,support:le}),"function"==typeof Symbol&&(ce.fn[Symbol.iterator]=oe[Symbol.iterator]),ce.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){n["[object "+t+"]"]=t.toLowerCase()});var pe=oe.pop,de=oe.sort,he=oe.splice,ge="[\\x20\\t\\r\\n\\f]",ve=new RegExp("^"+ge+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ge+"+$","g");ce.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||1!==n.nodeType||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var f=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function p(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}ce.escapeSelector=function(e){return(e+"").replace(f,p)};var ye=C,me=s;!function(){var e,b,w,o,a,T,r,C,d,i,k=me,S=ce.expando,E=0,n=0,s=W(),c=W(),u=W(),h=W(),l=function(e,t){return e===t&&(a=!0),0},f="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",t="(?:\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",p="\\["+ge+"*("+t+")(?:"+ge+"*([*^$|!~]?=)"+ge+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+t+"))|)"+ge+"*\\]",g=":("+t+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+p+")*)|.*)\\)|)",v=new RegExp(ge+"+","g"),y=new RegExp("^"+ge+"*,"+ge+"*"),m=new RegExp("^"+ge+"*([>+~]|"+ge+")"+ge+"*"),x=new RegExp(ge+"|>"),j=new RegExp(g),A=new RegExp("^"+t+"$"),D={ID:new RegExp("^#("+t+")"),CLASS:new RegExp("^\\.("+t+")"),TAG:new RegExp("^("+t+"|[*])"),ATTR:new RegExp("^"+p),PSEUDO:new RegExp("^"+g),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ge+"*(even|odd|(([+-]|)(\\d*)n|)"+ge+"*(?:([+-]|)"+ge+"*(\\d+)|))"+ge+"*\\)|)","i"),bool:new RegExp("^(?:"+f+")$","i"),needsContext:new RegExp("^"+ge+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ge+"*((?:-\\d)?\\d*)"+ge+"*\\)|)(?=[^-]|$)","i")},N=/^(?:input|select|textarea|button)$/i,q=/^h\d$/i,L=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,H=/[+~]/,O=new RegExp("\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\([^\\r\\n\\f])","g"),P=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},R=function(){V()},M=J(function(e){return!0===e.disabled&&fe(e,"fieldset")},{dir:"parentNode",next:"legend"});try{k.apply(oe=ae.call(ye.childNodes),ye.childNodes),oe[ye.childNodes.length].nodeType}catch(e){k={apply:function(e,t){me.apply(e,ae.call(t))},call:function(e){me.apply(e,ae.call(arguments,1))}}}function I(t,e,n,r){var i,o,a,s,u,l,c,f=e&&e.ownerDocument,p=e?e.nodeType:9;if(n=n||[],"string"!=typeof t||!t||1!==p&&9!==p&&11!==p)return n;if(!r&&(V(e),e=e||T,C)){if(11!==p&&(u=L.exec(t)))if(i=u[1]){if(9===p){if(!(a=e.getElementById(i)))return n;if(a.id===i)return k.call(n,a),n}else if(f&&(a=f.getElementById(i))&&I.contains(e,a)&&a.id===i)return k.call(n,a),n}else{if(u[2])return k.apply(n,e.getElementsByTagName(t)),n;if((i=u[3])&&e.getElementsByClassName)return k.apply(n,e.getElementsByClassName(i)),n}if(!(h[t+" "]||d&&d.test(t))){if(c=t,f=e,1===p&&(x.test(t)||m.test(t))){(f=H.test(t)&&z(e.parentNode)||e)==e&&le.scope||((s=e.getAttribute("id"))?s=ce.escapeSelector(s):e.setAttribute("id",s=S)),o=(l=Y(t)).length;while(o--)l[o]=(s?"#"+s:":scope")+" "+Q(l[o]);c=l.join(",")}try{return k.apply(n,f.querySelectorAll(c)),n}catch(e){h(t,!0)}finally{s===S&&e.removeAttribute("id")}}}return re(t.replace(ve,"$1"),e,n,r)}function W(){var r=[];return function e(t,n){return r.push(t+" ")>b.cacheLength&&delete e[r.shift()],e[t+" "]=n}}function F(e){return e[S]=!0,e}function $(e){var t=T.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function B(t){return function(e){return fe(e,"input")&&e.type===t}}function _(t){return function(e){return(fe(e,"input")||fe(e,"button"))&&e.type===t}}function X(t){return function(e){return"form"in e?e.parentNode&&!1===e.disabled?"label"in e?"label"in e.parentNode?e.parentNode.disabled===t:e.disabled===t:e.isDisabled===t||e.isDisabled!==!t&&M(e)===t:e.disabled===t:"label"in e&&e.disabled===t}}function U(a){return F(function(o){return o=+o,F(function(e,t){var n,r=a([],e.length,o),i=r.length;while(i--)e[n=r[i]]&&(e[n]=!(t[n]=e[n]))})})}function z(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}function V(e){var t,n=e?e.ownerDocument||e:ye;return n!=T&&9===n.nodeType&&n.documentElement&&(r=(T=n).documentElement,C=!ce.isXMLDoc(T),i=r.matches||r.webkitMatchesSelector||r.msMatchesSelector,ye!=T&&(t=T.defaultView)&&t.top!==t&&t.addEventListener("unload",R),le.getById=$(function(e){return r.appendChild(e).id=ce.expando,!T.getElementsByName||!T.getElementsByName(ce.expando).length}),le.disconnectedMatch=$(function(e){return i.call(e,"*")}),le.scope=$(function(){return T.querySelectorAll(":scope")}),le.cssHas=$(function(){try{return T.querySelector(":has(*,:jqfake)"),!1}catch(e){return!0}}),le.getById?(b.filter.ID=function(e){var t=e.replace(O,P);return function(e){return e.getAttribute("id")===t}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n=t.getElementById(e);return n?[n]:[]}}):(b.filter.ID=function(e){var n=e.replace(O,P);return function(e){var t="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return t&&t.value===n}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),b.find.TAG=function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):t.querySelectorAll(e)},b.find.CLASS=function(e,t){if("undefined"!=typeof t.getElementsByClassName&&C)return t.getElementsByClassName(e)},d=[],$(function(e){var t;r.appendChild(e).innerHTML="<a id='"+S+"' href='' disabled='disabled'></a><select id='"+S+"-\r\\' disabled='disabled'><option selected=''></option></select>",e.querySelectorAll("[selected]").length||d.push("\\["+ge+"*(?:value|"+f+")"),e.querySelectorAll("[id~="+S+"-]").length||d.push("~="),e.querySelectorAll("a#"+S+"+*").length||d.push(".#.+[+~]"),e.querySelectorAll(":checked").length||d.push(":checked"),(t=T.createElement("input")).setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),r.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&d.push(":enabled",":disabled"),(t=T.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||d.push("\\["+ge+"*name"+ge+"*="+ge+"*(?:''|\"\")")}),le.cssHas||d.push(":has"),d=d.length&&new RegExp(d.join("|")),l=function(e,t){if(e===t)return a=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!le.sortDetached&&t.compareDocumentPosition(e)===n?e===T||e.ownerDocument==ye&&I.contains(ye,e)?-1:t===T||t.ownerDocument==ye&&I.contains(ye,t)?1:o?se.call(o,e)-se.call(o,t):0:4&n?-1:1)}),T}for(e in I.matches=function(e,t){return I(e,null,null,t)},I.matchesSelector=function(e,t){if(V(e),C&&!h[t+" "]&&(!d||!d.test(t)))try{var n=i.call(e,t);if(n||le.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){h(t,!0)}return 0<I(t,T,null,[e]).length},I.contains=function(e,t){return(e.ownerDocument||e)!=T&&V(e),ce.contains(e,t)},I.attr=function(e,t){(e.ownerDocument||e)!=T&&V(e);var n=b.attrHandle[t.toLowerCase()],r=n&&ue.call(b.attrHandle,t.toLowerCase())?n(e,t,!C):void 0;return void 0!==r?r:e.getAttribute(t)},I.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ce.uniqueSort=function(e){var t,n=[],r=0,i=0;if(a=!le.sortStable,o=!le.sortStable&&ae.call(e,0),de.call(e,l),a){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)he.call(e,n[r],1)}return o=null,e},ce.fn.uniqueSort=function(){return this.pushStack(ce.uniqueSort(ae.apply(this)))},(b=ce.expr={cacheLength:50,createPseudo:F,match:D,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(O,P),e[3]=(e[3]||e[4]||e[5]||"").replace(O,P),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||I.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&I.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return D.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&j.test(n)&&(t=Y(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(O,P).toLowerCase();return"*"===e?function(){return!0}:function(e){return fe(e,t)}},CLASS:function(e){var t=s[e+" "];return t||(t=new RegExp("(^|"+ge+")"+e+"("+ge+"|$)"))&&s(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(n,r,i){return function(e){var t=I.attr(e,n);return null==t?"!="===r:!r||(t+="","="===r?t===i:"!="===r?t!==i:"^="===r?i&&0===t.indexOf(i):"*="===r?i&&-1<t.indexOf(i):"$="===r?i&&t.slice(-i.length)===i:"~="===r?-1<(" "+t.replace(v," ")+" ").indexOf(i):"|="===r&&(t===i||t.slice(0,i.length+1)===i+"-"))}},CHILD:function(d,e,t,h,g){var v="nth"!==d.slice(0,3),y="last"!==d.slice(-4),m="of-type"===e;return 1===h&&0===g?function(e){return!!e.parentNode}:function(e,t,n){var r,i,o,a,s,u=v!==y?"nextSibling":"previousSibling",l=e.parentNode,c=m&&e.nodeName.toLowerCase(),f=!n&&!m,p=!1;if(l){if(v){while(u){o=e;while(o=o[u])if(m?fe(o,c):1===o.nodeType)return!1;s=u="only"===d&&!s&&"nextSibling"}return!0}if(s=[y?l.firstChild:l.lastChild],y&&f){p=(a=(r=(i=l[S]||(l[S]={}))[d]||[])[0]===E&&r[1])&&r[2],o=a&&l.childNodes[a];while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if(1===o.nodeType&&++p&&o===e){i[d]=[E,a,p];break}}else if(f&&(p=a=(r=(i=e[S]||(e[S]={}))[d]||[])[0]===E&&r[1]),!1===p)while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if((m?fe(o,c):1===o.nodeType)&&++p&&(f&&((i=o[S]||(o[S]={}))[d]=[E,p]),o===e))break;return(p-=g)===h||p%h==0&&0<=p/h}}},PSEUDO:function(e,o){var t,a=b.pseudos[e]||b.setFilters[e.toLowerCase()]||I.error("unsupported pseudo: "+e);return a[S]?a(o):1<a.length?(t=[e,e,"",o],b.setFilters.hasOwnProperty(e.toLowerCase())?F(function(e,t){var n,r=a(e,o),i=r.length;while(i--)e[n=se.call(e,r[i])]=!(t[n]=r[i])}):function(e){return a(e,0,t)}):a}},pseudos:{not:F(function(e){var r=[],i=[],s=ne(e.replace(ve,"$1"));return s[S]?F(function(e,t,n,r){var i,o=s(e,null,r,[]),a=e.length;while(a--)(i=o[a])&&(e[a]=!(t[a]=i))}):function(e,t,n){return r[0]=e,s(r,null,n,i),r[0]=null,!i.pop()}}),has:F(function(t){return function(e){return 0<I(t,e).length}}),contains:F(function(t){return t=t.replace(O,P),function(e){return-1<(e.textContent||ce.text(e)).indexOf(t)}}),lang:F(function(n){return A.test(n||"")||I.error("unsupported lang: "+n),n=n.replace(O,P).toLowerCase(),function(e){var t;do{if(t=C?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return(t=t.toLowerCase())===n||0===t.indexOf(n+"-")}while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var t=ie.location&&ie.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===r},focus:function(e){return e===function(){try{return T.activeElement}catch(e){}}()&&T.hasFocus()&&!!(e.type||e.href||~e.tabIndex)},enabled:X(!1),disabled:X(!0),checked:function(e){return fe(e,"input")&&!!e.checked||fe(e,"option")&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!b.pseudos.empty(e)},header:function(e){return q.test(e.nodeName)},input:function(e){return N.test(e.nodeName)},button:function(e){return fe(e,"input")&&"button"===e.type||fe(e,"button")},text:function(e){var t;return fe(e,"input")&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:U(function(){return[0]}),last:U(function(e,t){return[t-1]}),eq:U(function(e,t,n){return[n<0?n+t:n]}),even:U(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:U(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:U(function(e,t,n){var r;for(r=n<0?n+t:t<n?t:n;0<=--r;)e.push(r);return e}),gt:U(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=b.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})b.pseudos[e]=B(e);for(e in{submit:!0,reset:!0})b.pseudos[e]=_(e);function G(){}function Y(e,t){var n,r,i,o,a,s,u,l=c[e+" "];if(l)return t?0:l.slice(0);a=e,s=[],u=b.preFilter;while(a){for(o in n&&!(r=y.exec(a))||(r&&(a=a.slice(r[0].length)||a),s.push(i=[])),n=!1,(r=m.exec(a))&&(n=r.shift(),i.push({value:n,type:r[0].replace(ve," ")}),a=a.slice(n.length)),b.filter)!(r=D[o].exec(a))||u[o]&&!(r=u[o](r))||(n=r.shift(),i.push({value:n,type:o,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?I.error(e):c(e,s).slice(0)}function Q(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function J(a,e,t){var s=e.dir,u=e.next,l=u||s,c=t&&"parentNode"===l,f=n++;return e.first?function(e,t,n){while(e=e[s])if(1===e.nodeType||c)return a(e,t,n);return!1}:function(e,t,n){var r,i,o=[E,f];if(n){while(e=e[s])if((1===e.nodeType||c)&&a(e,t,n))return!0}else while(e=e[s])if(1===e.nodeType||c)if(i=e[S]||(e[S]={}),u&&fe(e,u))e=e[s]||e;else{if((r=i[l])&&r[0]===E&&r[1]===f)return o[2]=r[2];if((i[l]=o)[2]=a(e,t,n))return!0}return!1}}function K(i){return 1<i.length?function(e,t,n){var r=i.length;while(r--)if(!i[r](e,t,n))return!1;return!0}:i[0]}function Z(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function ee(d,h,g,v,y,e){return v&&!v[S]&&(v=ee(v)),y&&!y[S]&&(y=ee(y,e)),F(function(e,t,n,r){var i,o,a,s,u=[],l=[],c=t.length,f=e||function(e,t,n){for(var r=0,i=t.length;r<i;r++)I(e,t[r],n);return n}(h||"*",n.nodeType?[n]:n,[]),p=!d||!e&&h?f:Z(f,u,d,n,r);if(g?g(p,s=y||(e?d:c||v)?[]:t,n,r):s=p,v){i=Z(s,l),v(i,[],n,r),o=i.length;while(o--)(a=i[o])&&(s[l[o]]=!(p[l[o]]=a))}if(e){if(y||d){if(y){i=[],o=s.length;while(o--)(a=s[o])&&i.push(p[o]=a);y(null,s=[],i,r)}o=s.length;while(o--)(a=s[o])&&-1<(i=y?se.call(e,a):u[o])&&(e[i]=!(t[i]=a))}}else s=Z(s===t?s.splice(c,s.length):s),y?y(null,t,s,r):k.apply(t,s)})}function te(e){for(var i,t,n,r=e.length,o=b.relative[e[0].type],a=o||b.relative[" "],s=o?1:0,u=J(function(e){return e===i},a,!0),l=J(function(e){return-1<se.call(i,e)},a,!0),c=[function(e,t,n){var r=!o&&(n||t!=w)||((i=t).nodeType?u(e,t,n):l(e,t,n));return i=null,r}];s<r;s++)if(t=b.relative[e[s].type])c=[J(K(c),t)];else{if((t=b.filter[e[s].type].apply(null,e[s].matches))[S]){for(n=++s;n<r;n++)if(b.relative[e[n].type])break;return ee(1<s&&K(c),1<s&&Q(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(ve,"$1"),t,s<n&&te(e.slice(s,n)),n<r&&te(e=e.slice(n)),n<r&&Q(e))}c.push(t)}return K(c)}function ne(e,t){var n,v,y,m,x,r,i=[],o=[],a=u[e+" "];if(!a){t||(t=Y(e)),n=t.length;while(n--)(a=te(t[n]))[S]?i.push(a):o.push(a);(a=u(e,(v=o,m=0<(y=i).length,x=0<v.length,r=function(e,t,n,r,i){var o,a,s,u=0,l="0",c=e&&[],f=[],p=w,d=e||x&&b.find.TAG("*",i),h=E+=null==p?1:Math.random()||.1,g=d.length;for(i&&(w=t==T||t||i);l!==g&&null!=(o=d[l]);l++){if(x&&o){a=0,t||o.ownerDocument==T||(V(o),n=!C);while(s=v[a++])if(s(o,t||T,n)){k.call(r,o);break}i&&(E=h)}m&&((o=!s&&o)&&u--,e&&c.push(o))}if(u+=l,m&&l!==u){a=0;while(s=y[a++])s(c,f,t,n);if(e){if(0<u)while(l--)c[l]||f[l]||(f[l]=pe.call(r));f=Z(f)}k.apply(r,f),i&&!e&&0<f.length&&1<u+y.length&&ce.uniqueSort(r)}return i&&(E=h,w=p),c},m?F(r):r))).selector=e}return a}function re(e,t,n,r){var i,o,a,s,u,l="function"==typeof e&&e,c=!r&&Y(e=l.selector||e);if(n=n||[],1===c.length){if(2<(o=c[0]=c[0].slice(0)).length&&"ID"===(a=o[0]).type&&9===t.nodeType&&C&&b.relative[o[1].type]){if(!(t=(b.find.ID(a.matches[0].replace(O,P),t)||[])[0]))return n;l&&(t=t.parentNode),e=e.slice(o.shift().value.length)}i=D.needsContext.test(e)?0:o.length;while(i--){if(a=o[i],b.relative[s=a.type])break;if((u=b.find[s])&&(r=u(a.matches[0].replace(O,P),H.test(o[0].type)&&z(t.parentNode)||t))){if(o.splice(i,1),!(e=r.length&&Q(o)))return k.apply(n,r),n;break}}}return(l||ne(e,c))(r,t,!C,n,!t||H.test(e)&&z(t.parentNode)||t),n}G.prototype=b.filters=b.pseudos,b.setFilters=new G,le.sortStable=S.split("").sort(l).join("")===S,V(),le.sortDetached=$(function(e){return 1&e.compareDocumentPosition(T.createElement("fieldset"))}),ce.find=I,ce.expr[":"]=ce.expr.pseudos,ce.unique=ce.uniqueSort,I.compile=ne,I.select=re,I.setDocument=V,I.escape=ce.escapeSelector,I.getText=ce.text,I.isXML=ce.isXMLDoc,I.selectors=ce.expr,I.support=ce.support,I.uniqueSort=ce.uniqueSort}();var d=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&ce(e).is(n))break;r.push(e)}return r},h=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},b=ce.expr.match.needsContext,w=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function T(e,n,r){return v(n)?ce.grep(e,function(e,t){return!!n.call(e,t,e)!==r}):n.nodeType?ce.grep(e,function(e){return e===n!==r}):"string"!=typeof n?ce.grep(e,function(e){return-1<se.call(n,e)!==r}):ce.filter(n,e,r)}ce.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?ce.find.matchesSelector(r,e)?[r]:[]:ce.find.matches(e,ce.grep(t,function(e){return 1===e.nodeType}))},ce.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(ce(e).filter(function(){for(t=0;t<r;t++)if(ce.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)ce.find(e,i[t],n);return 1<r?ce.uniqueSort(n):n},filter:function(e){return this.pushStack(T(this,e||[],!1))},not:function(e){return this.pushStack(T(this,e||[],!0))},is:function(e){return!!T(this,"string"==typeof e&&b.test(e)?ce(e):e||[],!1).length}});var k,S=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(ce.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||k,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&3<=e.length?[null,e,null]:S.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof ce?t[0]:t,ce.merge(this,ce.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:C,!0)),w.test(r[1])&&ce.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=C.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(ce):ce.makeArray(e,this)}).prototype=ce.fn,k=ce(C);var E=/^(?:parents|prev(?:Until|All))/,j={children:!0,contents:!0,next:!0,prev:!0};function A(e,t){while((e=e[t])&&1!==e.nodeType);return e}ce.fn.extend({has:function(e){var t=ce(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(ce.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&ce(e);if(!b.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?-1<a.index(n):1===n.nodeType&&ce.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(1<o.length?ce.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?se.call(ce(e),this[0]):se.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(ce.uniqueSort(ce.merge(this.get(),ce(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),ce.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return d(e,"parentNode")},parentsUntil:function(e,t,n){return d(e,"parentNode",n)},next:function(e){return A(e,"nextSibling")},prev:function(e){return A(e,"previousSibling")},nextAll:function(e){return d(e,"nextSibling")},prevAll:function(e){return d(e,"previousSibling")},nextUntil:function(e,t,n){return d(e,"nextSibling",n)},prevUntil:function(e,t,n){return d(e,"previousSibling",n)},siblings:function(e){return h((e.parentNode||{}).firstChild,e)},children:function(e){return h(e.firstChild)},contents:function(e){return null!=e.contentDocument&&r(e.contentDocument)?e.contentDocument:(fe(e,"template")&&(e=e.content||e),ce.merge([],e.childNodes))}},function(r,i){ce.fn[r]=function(e,t){var n=ce.map(this,i,e);return"Until"!==r.slice(-5)&&(t=e),t&&"string"==typeof t&&(n=ce.filter(t,n)),1<this.length&&(j[r]||ce.uniqueSort(n),E.test(r)&&n.reverse()),this.pushStack(n)}});var D=/[^\x20\t\r\n\f]+/g;function N(e){return e}function q(e){throw e}function L(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}ce.Callbacks=function(r){var e,n;r="string"==typeof r?(e=r,n={},ce.each(e.match(D)||[],function(e,t){n[t]=!0}),n):ce.extend({},r);var i,t,o,a,s=[],u=[],l=-1,c=function(){for(a=a||r.once,o=i=!0;u.length;l=-1){t=u.shift();while(++l<s.length)!1===s[l].apply(t[0],t[1])&&r.stopOnFalse&&(l=s.length,t=!1)}r.memory||(t=!1),i=!1,a&&(s=t?[]:"")},f={add:function(){return s&&(t&&!i&&(l=s.length-1,u.push(t)),function n(e){ce.each(e,function(e,t){v(t)?r.unique&&f.has(t)||s.push(t):t&&t.length&&"string"!==x(t)&&n(t)})}(arguments),t&&!i&&c()),this},remove:function(){return ce.each(arguments,function(e,t){var n;while(-1<(n=ce.inArray(t,s,n)))s.splice(n,1),n<=l&&l--}),this},has:function(e){return e?-1<ce.inArray(e,s):0<s.length},empty:function(){return s&&(s=[]),this},disable:function(){return a=u=[],s=t="",this},disabled:function(){return!s},lock:function(){return a=u=[],t||i||(s=t=""),this},locked:function(){return!!a},fireWith:function(e,t){return a||(t=[e,(t=t||[]).slice?t.slice():t],u.push(t),i||c()),this},fire:function(){return f.fireWith(this,arguments),this},fired:function(){return!!o}};return f},ce.extend({Deferred:function(e){var o=[["notify","progress",ce.Callbacks("memory"),ce.Callbacks("memory"),2],["resolve","done",ce.Callbacks("once memory"),ce.Callbacks("once memory"),0,"resolved"],["reject","fail",ce.Callbacks("once memory"),ce.Callbacks("once memory"),1,"rejected"]],i="pending",a={state:function(){return i},always:function(){return s.done(arguments).fail(arguments),this},"catch":function(e){return a.then(null,e)},pipe:function(){var i=arguments;return ce.Deferred(function(r){ce.each(o,function(e,t){var n=v(i[t[4]])&&i[t[4]];s[t[1]](function(){var e=n&&n.apply(this,arguments);e&&v(e.promise)?e.promise().progress(r.notify).done(r.resolve).fail(r.reject):r[t[0]+"With"](this,n?[e]:arguments)})}),i=null}).promise()},then:function(t,n,r){var u=0;function l(i,o,a,s){return function(){var n=this,r=arguments,e=function(){var e,t;if(!(i<u)){if((e=a.apply(n,r))===o.promise())throw new TypeError("Thenable self-resolution");t=e&&("object"==typeof e||"function"==typeof e)&&e.then,v(t)?s?t.call(e,l(u,o,N,s),l(u,o,q,s)):(u++,t.call(e,l(u,o,N,s),l(u,o,q,s),l(u,o,N,o.notifyWith))):(a!==N&&(n=void 0,r=[e]),(s||o.resolveWith)(n,r))}},t=s?e:function(){try{e()}catch(e){ce.Deferred.exceptionHook&&ce.Deferred.exceptionHook(e,t.error),u<=i+1&&(a!==q&&(n=void 0,r=[e]),o.rejectWith(n,r))}};i?t():(ce.Deferred.getErrorHook?t.error=ce.Deferred.getErrorHook():ce.Deferred.getStackHook&&(t.error=ce.Deferred.getStackHook()),ie.setTimeout(t))}}return ce.Deferred(function(e){o[0][3].add(l(0,e,v(r)?r:N,e.notifyWith)),o[1][3].add(l(0,e,v(t)?t:N)),o[2][3].add(l(0,e,v(n)?n:q))}).promise()},promise:function(e){return null!=e?ce.extend(e,a):a}},s={};return ce.each(o,function(e,t){var n=t[2],r=t[5];a[t[1]]=n.add,r&&n.add(function(){i=r},o[3-e][2].disable,o[3-e][3].disable,o[0][2].lock,o[0][3].lock),n.add(t[3].fire),s[t[0]]=function(){return s[t[0]+"With"](this===s?void 0:this,arguments),this},s[t[0]+"With"]=n.fireWith}),a.promise(s),e&&e.call(s,s),s},when:function(e){var n=arguments.length,t=n,r=Array(t),i=ae.call(arguments),o=ce.Deferred(),a=function(t){return function(e){r[t]=this,i[t]=1<arguments.length?ae.call(arguments):e,--n||o.resolveWith(r,i)}};if(n<=1&&(L(e,o.done(a(t)).resolve,o.reject,!n),"pending"===o.state()||v(i[t]&&i[t].then)))return o.then();while(t--)L(i[t],a(t),o.reject);return o.promise()}});var H=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;ce.Deferred.exceptionHook=function(e,t){ie.console&&ie.console.warn&&e&&H.test(e.name)&&ie.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},ce.readyException=function(e){ie.setTimeout(function(){throw e})};var O=ce.Deferred();function P(){C.removeEventListener("DOMContentLoaded",P),ie.removeEventListener("load",P),ce.ready()}ce.fn.ready=function(e){return O.then(e)["catch"](function(e){ce.readyException(e)}),this},ce.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--ce.readyWait:ce.isReady)||(ce.isReady=!0)!==e&&0<--ce.readyWait||O.resolveWith(C,[ce])}}),ce.ready.then=O.then,"complete"===C.readyState||"loading"!==C.readyState&&!C.documentElement.doScroll?ie.setTimeout(ce.ready):(C.addEventListener("DOMContentLoaded",P),ie.addEventListener("load",P));var R=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n))for(s in i=!0,n)R(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,v(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(ce(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},M=/^-ms-/,I=/-([a-z])/g;function W(e,t){return t.toUpperCase()}function F(e){return e.replace(M,"ms-").replace(I,W)}var $=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function B(){this.expando=ce.expando+B.uid++}B.uid=1,B.prototype={cache:function(e){var t=e[this.expando];return t||(t={},$(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[F(t)]=n;else for(r in t)i[F(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][F(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(F):(t=F(t))in r?[t]:t.match(D)||[]).length;while(n--)delete r[t[n]]}(void 0===t||ce.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!ce.isEmptyObject(t)}};var _=new B,X=new B,U=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,z=/[A-Z]/g;function V(e,t,n){var r,i;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(z,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n="true"===(i=n)||"false"!==i&&("null"===i?null:i===+i+""?+i:U.test(i)?JSON.parse(i):i)}catch(e){}X.set(e,t,n)}else n=void 0;return n}ce.extend({hasData:function(e){return X.hasData(e)||_.hasData(e)},data:function(e,t,n){return X.access(e,t,n)},removeData:function(e,t){X.remove(e,t)},_data:function(e,t,n){return _.access(e,t,n)},_removeData:function(e,t){_.remove(e,t)}}),ce.fn.extend({data:function(n,e){var t,r,i,o=this[0],a=o&&o.attributes;if(void 0===n){if(this.length&&(i=X.get(o),1===o.nodeType&&!_.get(o,"hasDataAttrs"))){t=a.length;while(t--)a[t]&&0===(r=a[t].name).indexOf("data-")&&(r=F(r.slice(5)),V(o,r,i[r]));_.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof n?this.each(function(){X.set(this,n)}):R(this,function(e){var t;if(o&&void 0===e)return void 0!==(t=X.get(o,n))?t:void 0!==(t=V(o,n))?t:void 0;this.each(function(){X.set(this,n,e)})},null,e,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){X.remove(this,e)})}}),ce.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=_.get(e,t),n&&(!r||Array.isArray(n)?r=_.access(e,t,ce.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=ce.queue(e,t),r=n.length,i=n.shift(),o=ce._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,function(){ce.dequeue(e,t)},o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return _.get(e,n)||_.access(e,n,{empty:ce.Callbacks("once memory").add(function(){_.remove(e,[t+"queue",n])})})}}),ce.fn.extend({queue:function(t,n){var e=2;return"string"!=typeof t&&(n=t,t="fx",e--),arguments.length<e?ce.queue(this[0],t):void 0===n?this:this.each(function(){var e=ce.queue(this,t,n);ce._queueHooks(this,t),"fx"===t&&"inprogress"!==e[0]&&ce.dequeue(this,t)})},dequeue:function(e){return this.each(function(){ce.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=ce.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=_.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var G=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,Y=new RegExp("^(?:([+-])=|)("+G+")([a-z%]*)$","i"),Q=["Top","Right","Bottom","Left"],J=C.documentElement,K=function(e){return ce.contains(e.ownerDocument,e)},Z={composed:!0};J.getRootNode&&(K=function(e){return ce.contains(e.ownerDocument,e)||e.getRootNode(Z)===e.ownerDocument});var ee=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&K(e)&&"none"===ce.css(e,"display")};function te(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return ce.css(e,t,"")},u=s(),l=n&&n[3]||(ce.cssNumber[t]?"":"px"),c=e.nodeType&&(ce.cssNumber[t]||"px"!==l&&+u)&&Y.exec(ce.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)ce.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,ce.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var ne={};function re(e,t){for(var n,r,i,o,a,s,u,l=[],c=0,f=e.length;c<f;c++)(r=e[c]).style&&(n=r.style.display,t?("none"===n&&(l[c]=_.get(r,"display")||null,l[c]||(r.style.display="")),""===r.style.display&&ee(r)&&(l[c]=(u=a=o=void 0,a=(i=r).ownerDocument,s=i.nodeName,(u=ne[s])||(o=a.body.appendChild(a.createElement(s)),u=ce.css(o,"display"),o.parentNode.removeChild(o),"none"===u&&(u="block"),ne[s]=u)))):"none"!==n&&(l[c]="none",_.set(r,"display",n)));for(c=0;c<f;c++)null!=l[c]&&(e[c].style.display=l[c]);return e}ce.fn.extend({show:function(){return re(this,!0)},hide:function(){return re(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ee(this)?ce(this).show():ce(this).hide()})}});var xe,be,we=/^(?:checkbox|radio)$/i,Te=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,Ce=/^$|^module$|\/(?:java|ecma)script/i;xe=C.createDocumentFragment().appendChild(C.createElement("div")),(be=C.createElement("input")).setAttribute("type","radio"),be.setAttribute("checked","checked"),be.setAttribute("name","t"),xe.appendChild(be),le.checkClone=xe.cloneNode(!0).cloneNode(!0).lastChild.checked,xe.innerHTML="<textarea>x</textarea>",le.noCloneChecked=!!xe.cloneNode(!0).lastChild.defaultValue,xe.innerHTML="<option></option>",le.option=!!xe.lastChild;var ke={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Se(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&fe(e,t)?ce.merge([e],n):n}function Ee(e,t){for(var n=0,r=e.length;n<r;n++)_.set(e[n],"globalEval",!t||_.get(t[n],"globalEval"))}ke.tbody=ke.tfoot=ke.colgroup=ke.caption=ke.thead,ke.th=ke.td,le.option||(ke.optgroup=ke.option=[1,"<select multiple='multiple'>","</select>"]);var je=/<|&#?\w+;/;function Ae(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))ce.merge(p,o.nodeType?[o]:o);else if(je.test(o)){a=a||f.appendChild(t.createElement("div")),s=(Te.exec(o)||["",""])[1].toLowerCase(),u=ke[s]||ke._default,a.innerHTML=u[1]+ce.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;ce.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&-1<ce.inArray(o,r))i&&i.push(o);else if(l=K(o),a=Se(f.appendChild(o),"script"),l&&Ee(a),n){c=0;while(o=a[c++])Ce.test(o.type||"")&&n.push(o)}return f}var De=/^([^.]*)(?:\.(.+)|)/;function Ne(){return!0}function qe(){return!1}function Le(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)Le(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=qe;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return ce().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=ce.guid++)),e.each(function(){ce.event.add(this,t,i,r,n)})}function He(e,r,t){t?(_.set(e,r,!1),ce.event.add(e,r,{namespace:!1,handler:function(e){var t,n=_.get(this,r);if(1&e.isTrigger&&this[r]){if(n)(ce.event.special[r]||{}).delegateType&&e.stopPropagation();else if(n=ae.call(arguments),_.set(this,r,n),this[r](),t=_.get(this,r),_.set(this,r,!1),n!==t)return e.stopImmediatePropagation(),e.preventDefault(),t}else n&&(_.set(this,r,ce.event.trigger(n[0],n.slice(1),this)),e.stopPropagation(),e.isImmediatePropagationStopped=Ne)}})):void 0===_.get(e,r)&&ce.event.add(e,r,Ne)}ce.event={global:{},add:function(t,e,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.get(t);if($(t)){n.handler&&(n=(o=n).handler,i=o.selector),i&&ce.find.matchesSelector(J,i),n.guid||(n.guid=ce.guid++),(u=v.events)||(u=v.events=Object.create(null)),(a=v.handle)||(a=v.handle=function(e){return"undefined"!=typeof ce&&ce.event.triggered!==e.type?ce.event.dispatch.apply(t,arguments):void 0}),l=(e=(e||"").match(D)||[""]).length;while(l--)d=g=(s=De.exec(e[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=ce.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=ce.event.special[d]||{},c=ce.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&ce.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(t,r,h,a)||t.addEventListener&&t.addEventListener(d,a)),f.add&&(f.add.call(t,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),ce.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.hasData(e)&&_.get(e);if(v&&(u=v.events)){l=(t=(t||"").match(D)||[""]).length;while(l--)if(d=g=(s=De.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d){f=ce.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,v.handle)||ce.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)ce.event.remove(e,d+t[l],n,r,!0);ce.isEmptyObject(u)&&_.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=ce.event.fix(e),l=(_.get(this,"events")||Object.create(null))[u.type]||[],c=ce.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,u)){a=ce.event.handlers.call(this,u,l),t=0;while((i=a[t++])&&!u.isPropagationStopped()){u.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!u.isImmediatePropagationStopped())u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((ce.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&1<=e.button))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?-1<ce(i,this).index(l):ce.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(t,e){Object.defineProperty(ce.Event.prototype,t,{enumerable:!0,configurable:!0,get:v(e)?function(){if(this.originalEvent)return e(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[t]},set:function(e){Object.defineProperty(this,t,{enumerable:!0,configurable:!0,writable:!0,value:e})}})},fix:function(e){return e[ce.expando]?e:new ce.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click",!0),!1},trigger:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click"),!0},_default:function(e){var t=e.target;return we.test(t.type)&&t.click&&fe(t,"input")&&_.get(t,"click")||fe(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},ce.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},ce.Event=function(e,t){if(!(this instanceof ce.Event))return new ce.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ne:qe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&ce.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[ce.expando]=!0},ce.Event.prototype={constructor:ce.Event,isDefaultPrevented:qe,isPropagationStopped:qe,isImmediatePropagationStopped:qe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ne,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ne,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ne,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},ce.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},ce.event.addProp),ce.each({focus:"focusin",blur:"focusout"},function(r,i){function o(e){if(C.documentMode){var t=_.get(this,"handle"),n=ce.event.fix(e);n.type="focusin"===e.type?"focus":"blur",n.isSimulated=!0,t(e),n.target===n.currentTarget&&t(n)}else ce.event.simulate(i,e.target,ce.event.fix(e))}ce.event.special[r]={setup:function(){var e;if(He(this,r,!0),!C.documentMode)return!1;(e=_.get(this,i))||this.addEventListener(i,o),_.set(this,i,(e||0)+1)},trigger:function(){return He(this,r),!0},teardown:function(){var e;if(!C.documentMode)return!1;(e=_.get(this,i)-1)?_.set(this,i,e):(this.removeEventListener(i,o),_.remove(this,i))},_default:function(e){return _.get(e.target,r)},delegateType:i},ce.event.special[i]={setup:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i);n||(C.documentMode?this.addEventListener(i,o):e.addEventListener(r,o,!0)),_.set(t,i,(n||0)+1)},teardown:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i)-1;n?_.set(t,i,n):(C.documentMode?this.removeEventListener(i,o):e.removeEventListener(r,o,!0),_.remove(t,i))}}}),ce.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,i){ce.event.special[e]={delegateType:i,bindType:i,handle:function(e){var t,n=e.relatedTarget,r=e.handleObj;return n&&(n===this||ce.contains(this,n))||(e.type=r.origType,t=r.handler.apply(this,arguments),e.type=i),t}}}),ce.fn.extend({on:function(e,t,n,r){return Le(this,e,t,n,r)},one:function(e,t,n,r){return Le(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,ce(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=qe),this.each(function(){ce.event.remove(this,e,n,t)})}});var Oe=/<script|<style|<link/i,Pe=/checked\s*(?:[^=]|=\s*.checked.)/i,Re=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function Me(e,t){return fe(e,"table")&&fe(11!==t.nodeType?t:t.firstChild,"tr")&&ce(e).children("tbody")[0]||e}function Ie(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function We(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Fe(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(_.hasData(e)&&(s=_.get(e).events))for(i in _.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)ce.event.add(t,i,s[i][n]);X.hasData(e)&&(o=X.access(e),a=ce.extend({},o),X.set(t,a))}}function $e(n,r,i,o){r=g(r);var e,t,a,s,u,l,c=0,f=n.length,p=f-1,d=r[0],h=v(d);if(h||1<f&&"string"==typeof d&&!le.checkClone&&Pe.test(d))return n.each(function(e){var t=n.eq(e);h&&(r[0]=d.call(this,e,t.html())),$e(t,r,i,o)});if(f&&(t=(e=Ae(r,n[0].ownerDocument,!1,n,o)).firstChild,1===e.childNodes.length&&(e=t),t||o)){for(s=(a=ce.map(Se(e,"script"),Ie)).length;c<f;c++)u=e,c!==p&&(u=ce.clone(u,!0,!0),s&&ce.merge(a,Se(u,"script"))),i.call(n[c],u,c);if(s)for(l=a[a.length-1].ownerDocument,ce.map(a,We),c=0;c<s;c++)u=a[c],Ce.test(u.type||"")&&!_.access(u,"globalEval")&&ce.contains(l,u)&&(u.src&&"module"!==(u.type||"").toLowerCase()?ce._evalUrl&&!u.noModule&&ce._evalUrl(u.src,{nonce:u.nonce||u.getAttribute("nonce")},l):m(u.textContent.replace(Re,""),u,l))}return n}function Be(e,t,n){for(var r,i=t?ce.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||ce.cleanData(Se(r)),r.parentNode&&(n&&K(r)&&Ee(Se(r,"script")),r.parentNode.removeChild(r));return e}ce.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s,u,l,c=e.cloneNode(!0),f=K(e);if(!(le.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||ce.isXMLDoc(e)))for(a=Se(c),r=0,i=(o=Se(e)).length;r<i;r++)s=o[r],u=a[r],void 0,"input"===(l=u.nodeName.toLowerCase())&&we.test(s.type)?u.checked=s.checked:"input"!==l&&"textarea"!==l||(u.defaultValue=s.defaultValue);if(t)if(n)for(o=o||Se(e),a=a||Se(c),r=0,i=o.length;r<i;r++)Fe(o[r],a[r]);else Fe(e,c);return 0<(a=Se(c,"script")).length&&Ee(a,!f&&Se(e,"script")),c},cleanData:function(e){for(var t,n,r,i=ce.event.special,o=0;void 0!==(n=e[o]);o++)if($(n)){if(t=n[_.expando]){if(t.events)for(r in t.events)i[r]?ce.event.remove(n,r):ce.removeEvent(n,r,t.handle);n[_.expando]=void 0}n[X.expando]&&(n[X.expando]=void 0)}}}),ce.fn.extend({detach:function(e){return Be(this,e,!0)},remove:function(e){return Be(this,e)},text:function(e){return R(this,function(e){return void 0===e?ce.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return $e(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Me(this,e).appendChild(e)})},prepend:function(){return $e(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Me(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(ce.cleanData(Se(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return ce.clone(this,e,t)})},html:function(e){return R(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Oe.test(e)&&!ke[(Te.exec(e)||["",""])[1].toLowerCase()]){e=ce.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(ce.cleanData(Se(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var n=[];return $e(this,arguments,function(e){var t=this.parentNode;ce.inArray(this,n)<0&&(ce.cleanData(Se(this)),t&&t.replaceChild(e,this))},n)}}),ce.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,a){ce.fn[e]=function(e){for(var t,n=[],r=ce(e),i=r.length-1,o=0;o<=i;o++)t=o===i?this:this.clone(!0),ce(r[o])[a](t),s.apply(n,t.get());return this.pushStack(n)}});var _e=new RegExp("^("+G+")(?!px)[a-z%]+$","i"),Xe=/^--/,Ue=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=ie),t.getComputedStyle(e)},ze=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Ve=new RegExp(Q.join("|"),"i");function Ge(e,t,n){var r,i,o,a,s=Xe.test(t),u=e.style;return(n=n||Ue(e))&&(a=n.getPropertyValue(t)||n[t],s&&a&&(a=a.replace(ve,"$1")||void 0),""!==a||K(e)||(a=ce.style(e,t)),!le.pixelBoxStyles()&&_e.test(a)&&Ve.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=n.width,u.width=r,u.minWidth=i,u.maxWidth=o)),void 0!==a?a+"":a}function Ye(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",J.appendChild(u).appendChild(l);var e=ie.getComputedStyle(l);n="1%"!==e.top,s=12===t(e.marginLeft),l.style.right="60%",o=36===t(e.right),r=36===t(e.width),l.style.position="absolute",i=12===t(l.offsetWidth/3),J.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var n,r,i,o,a,s,u=C.createElement("div"),l=C.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",le.clearCloneStyle="content-box"===l.style.backgroundClip,ce.extend(le,{boxSizingReliable:function(){return e(),r},pixelBoxStyles:function(){return e(),o},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),s},scrollboxSize:function(){return e(),i},reliableTrDimensions:function(){var e,t,n,r;return null==a&&(e=C.createElement("table"),t=C.createElement("tr"),n=C.createElement("div"),e.style.cssText="position:absolute;left:-11111px;border-collapse:separate",t.style.cssText="border:1px solid",t.style.height="1px",n.style.height="9px",n.style.display="block",J.appendChild(e).appendChild(t).appendChild(n),r=ie.getComputedStyle(t),a=parseInt(r.height,10)+parseInt(r.borderTopWidth,10)+parseInt(r.borderBottomWidth,10)===t.offsetHeight,J.removeChild(e)),a}}))}();var Qe=["Webkit","Moz","ms"],Je=C.createElement("div").style,Ke={};function Ze(e){var t=ce.cssProps[e]||Ke[e];return t||(e in Je?e:Ke[e]=function(e){var t=e[0].toUpperCase()+e.slice(1),n=Qe.length;while(n--)if((e=Qe[n]+t)in Je)return e}(e)||e)}var et=/^(none|table(?!-c[ea]).+)/,tt={position:"absolute",visibility:"hidden",display:"block"},nt={letterSpacing:"0",fontWeight:"400"};function rt(e,t,n){var r=Y.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function it(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0,l=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(l+=ce.css(e,n+Q[a],!0,i)),r?("content"===n&&(u-=ce.css(e,"padding"+Q[a],!0,i)),"margin"!==n&&(u-=ce.css(e,"border"+Q[a]+"Width",!0,i))):(u+=ce.css(e,"padding"+Q[a],!0,i),"padding"!==n?u+=ce.css(e,"border"+Q[a]+"Width",!0,i):s+=ce.css(e,"border"+Q[a]+"Width",!0,i));return!r&&0<=o&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u+l}function ot(e,t,n){var r=Ue(e),i=(!le.boxSizingReliable()||n)&&"border-box"===ce.css(e,"boxSizing",!1,r),o=i,a=Ge(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(_e.test(a)){if(!n)return a;a="auto"}return(!le.boxSizingReliable()&&i||!le.reliableTrDimensions()&&fe(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===ce.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===ce.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+it(e,t,n||(i?"border":"content"),o,r,a)+"px"}function at(e,t,n,r,i){return new at.prototype.init(e,t,n,r,i)}ce.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Ge(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=F(t),u=Xe.test(t),l=e.style;if(u||(t=Ze(s)),a=ce.cssHooks[t]||ce.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"===(o=typeof n)&&(i=Y.exec(n))&&i[1]&&(n=te(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(ce.cssNumber[s]?"":"px")),le.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=F(t);return Xe.test(t)||(t=Ze(s)),(a=ce.cssHooks[t]||ce.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Ge(e,t,r)),"normal"===i&&t in nt&&(i=nt[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),ce.each(["height","width"],function(e,u){ce.cssHooks[u]={get:function(e,t,n){if(t)return!et.test(ce.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?ot(e,u,n):ze(e,tt,function(){return ot(e,u,n)})},set:function(e,t,n){var r,i=Ue(e),o=!le.scrollboxSize()&&"absolute"===i.position,a=(o||n)&&"border-box"===ce.css(e,"boxSizing",!1,i),s=n?it(e,u,n,a,i):0;return a&&o&&(s-=Math.ceil(e["offset"+u[0].toUpperCase()+u.slice(1)]-parseFloat(i[u])-it(e,u,"border",!1,i)-.5)),s&&(r=Y.exec(t))&&"px"!==(r[3]||"px")&&(e.style[u]=t,t=ce.css(e,u)),rt(0,t,s)}}}),ce.cssHooks.marginLeft=Ye(le.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Ge(e,"marginLeft"))||e.getBoundingClientRect().left-ze(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),ce.each({margin:"",padding:"",border:"Width"},function(i,o){ce.cssHooks[i+o]={expand:function(e){for(var t=0,n={},r="string"==typeof e?e.split(" "):[e];t<4;t++)n[i+Q[t]+o]=r[t]||r[t-2]||r[0];return n}},"margin"!==i&&(ce.cssHooks[i+o].set=rt)}),ce.fn.extend({css:function(e,t){return R(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Ue(e),i=t.length;a<i;a++)o[t[a]]=ce.css(e,t[a],!1,r);return o}return void 0!==n?ce.style(e,t,n):ce.css(e,t)},e,t,1<arguments.length)}}),((ce.Tween=at).prototype={constructor:at,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||ce.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(ce.cssNumber[n]?"":"px")},cur:function(){var e=at.propHooks[this.prop];return e&&e.get?e.get(this):at.propHooks._default.get(this)},run:function(e){var t,n=at.propHooks[this.prop];return this.options.duration?this.pos=t=ce.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):at.propHooks._default.set(this),this}}).init.prototype=at.prototype,(at.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=ce.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){ce.fx.step[e.prop]?ce.fx.step[e.prop](e):1!==e.elem.nodeType||!ce.cssHooks[e.prop]&&null==e.elem.style[Ze(e.prop)]?e.elem[e.prop]=e.now:ce.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=at.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},ce.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},ce.fx=at.prototype.init,ce.fx.step={};var st,ut,lt,ct,ft=/^(?:toggle|show|hide)$/,pt=/queueHooks$/;function dt(){ut&&(!1===C.hidden&&ie.requestAnimationFrame?ie.requestAnimationFrame(dt):ie.setTimeout(dt,ce.fx.interval),ce.fx.tick())}function ht(){return ie.setTimeout(function(){st=void 0}),st=Date.now()}function gt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=Q[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function vt(e,t,n){for(var r,i=(yt.tweeners[t]||[]).concat(yt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function yt(o,e,t){var n,a,r=0,i=yt.prefilters.length,s=ce.Deferred().always(function(){delete u.elem}),u=function(){if(a)return!1;for(var e=st||ht(),t=Math.max(0,l.startTime+l.duration-e),n=1-(t/l.duration||0),r=0,i=l.tweens.length;r<i;r++)l.tweens[r].run(n);return s.notifyWith(o,[l,n,t]),n<1&&i?t:(i||s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l]),!1)},l=s.promise({elem:o,props:ce.extend({},e),opts:ce.extend(!0,{specialEasing:{},easing:ce.easing._default},t),originalProperties:e,originalOptions:t,startTime:st||ht(),duration:t.duration,tweens:[],createTween:function(e,t){var n=ce.Tween(o,l.opts,e,t,l.opts.specialEasing[e]||l.opts.easing);return l.tweens.push(n),n},stop:function(e){var t=0,n=e?l.tweens.length:0;if(a)return this;for(a=!0;t<n;t++)l.tweens[t].run(1);return e?(s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l,e])):s.rejectWith(o,[l,e]),this}}),c=l.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=F(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=ce.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(c,l.opts.specialEasing);r<i;r++)if(n=yt.prefilters[r].call(l,o,c,l.opts))return v(n.stop)&&(ce._queueHooks(l.elem,l.opts.queue).stop=n.stop.bind(n)),n;return ce.map(c,vt,l),v(l.opts.start)&&l.opts.start.call(o,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),ce.fx.timer(ce.extend(u,{elem:o,anim:l,queue:l.opts.queue})),l}ce.Animation=ce.extend(yt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return te(n.elem,e,Y.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(D);for(var n,r=0,i=e.length;r<i;r++)n=e[r],yt.tweeners[n]=yt.tweeners[n]||[],yt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ee(e),v=_.get(e,"fxshow");for(r in n.queue||(null==(a=ce._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,ce.queue(e,"fx").length||a.empty.fire()})})),t)if(i=t[r],ft.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||ce.style(e,r)}if((u=!ce.isEmptyObject(t))||!ce.isEmptyObject(d))for(r in f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=v&&v.display)&&(l=_.get(e,"display")),"none"===(c=ce.css(e,"display"))&&(l?c=l:(re([e],!0),l=e.style.display||l,c=ce.css(e,"display"),re([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===ce.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1,d)u||(v?"hidden"in v&&(g=v.hidden):v=_.access(e,"fxshow",{display:l}),o&&(v.hidden=!g),g&&re([e],!0),p.done(function(){for(r in g||re([e]),_.remove(e,"fxshow"),d)ce.style(e,r,d[r])})),u=vt(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?yt.prefilters.unshift(e):yt.prefilters.push(e)}}),ce.speed=function(e,t,n){var r=e&&"object"==typeof e?ce.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return ce.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in ce.fx.speeds?r.duration=ce.fx.speeds[r.duration]:r.duration=ce.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&ce.dequeue(this,r.queue)},r},ce.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ee).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(t,e,n,r){var i=ce.isEmptyObject(t),o=ce.speed(e,n,r),a=function(){var e=yt(this,ce.extend({},t),o);(i||_.get(this,"finish"))&&e.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(i,e,o){var a=function(e){var t=e.stop;delete e.stop,t(o)};return"string"!=typeof i&&(o=e,e=i,i=void 0),e&&this.queue(i||"fx",[]),this.each(function(){var e=!0,t=null!=i&&i+"queueHooks",n=ce.timers,r=_.get(this);if(t)r[t]&&r[t].stop&&a(r[t]);else for(t in r)r[t]&&r[t].stop&&pt.test(t)&&a(r[t]);for(t=n.length;t--;)n[t].elem!==this||null!=i&&n[t].queue!==i||(n[t].anim.stop(o),e=!1,n.splice(t,1));!e&&o||ce.dequeue(this,i)})},finish:function(a){return!1!==a&&(a=a||"fx"),this.each(function(){var e,t=_.get(this),n=t[a+"queue"],r=t[a+"queueHooks"],i=ce.timers,o=n?n.length:0;for(t.finish=!0,ce.queue(this,a,[]),r&&r.stop&&r.stop.call(this,!0),e=i.length;e--;)i[e].elem===this&&i[e].queue===a&&(i[e].anim.stop(!0),i.splice(e,1));for(e=0;e<o;e++)n[e]&&n[e].finish&&n[e].finish.call(this);delete t.finish})}}),ce.each(["toggle","show","hide"],function(e,r){var i=ce.fn[r];ce.fn[r]=function(e,t,n){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(gt(r,!0),e,t,n)}}),ce.each({slideDown:gt("show"),slideUp:gt("hide"),slideToggle:gt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,r){ce.fn[e]=function(e,t,n){return this.animate(r,e,t,n)}}),ce.timers=[],ce.fx.tick=function(){var e,t=0,n=ce.timers;for(st=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||ce.fx.stop(),st=void 0},ce.fx.timer=function(e){ce.timers.push(e),ce.fx.start()},ce.fx.interval=13,ce.fx.start=function(){ut||(ut=!0,dt())},ce.fx.stop=function(){ut=null},ce.fx.speeds={slow:600,fast:200,_default:400},ce.fn.delay=function(r,e){return r=ce.fx&&ce.fx.speeds[r]||r,e=e||"fx",this.queue(e,function(e,t){var n=ie.setTimeout(e,r);t.stop=function(){ie.clearTimeout(n)}})},lt=C.createElement("input"),ct=C.createElement("select").appendChild(C.createElement("option")),lt.type="checkbox",le.checkOn=""!==lt.value,le.optSelected=ct.selected,(lt=C.createElement("input")).value="t",lt.type="radio",le.radioValue="t"===lt.value;var mt,xt=ce.expr.attrHandle;ce.fn.extend({attr:function(e,t){return R(this,ce.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){ce.removeAttr(this,e)})}}),ce.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?ce.prop(e,t,n):(1===o&&ce.isXMLDoc(e)||(i=ce.attrHooks[t.toLowerCase()]||(ce.expr.match.bool.test(t)?mt:void 0)),void 0!==n?null===n?void ce.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=ce.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!le.radioValue&&"radio"===t&&fe(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(D);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),mt={set:function(e,t,n){return!1===t?ce.removeAttr(e,n):e.setAttribute(n,n),n}},ce.each(ce.expr.match.bool.source.match(/\w+/g),function(e,t){var a=xt[t]||ce.find.attr;xt[t]=function(e,t,n){var r,i,o=t.toLowerCase();return n||(i=xt[o],xt[o]=r,r=null!=a(e,t,n)?o:null,xt[o]=i),r}});var bt=/^(?:input|select|textarea|button)$/i,wt=/^(?:a|area)$/i;function Tt(e){return(e.match(D)||[]).join(" ")}function Ct(e){return e.getAttribute&&e.getAttribute("class")||""}function kt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(D)||[]}ce.fn.extend({prop:function(e,t){return R(this,ce.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[ce.propFix[e]||e]})}}),ce.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&ce.isXMLDoc(e)||(t=ce.propFix[t]||t,i=ce.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=ce.find.attr(e,"tabindex");return t?parseInt(t,10):bt.test(e.nodeName)||wt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),le.optSelected||(ce.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),ce.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){ce.propFix[this.toLowerCase()]=this}),ce.fn.extend({addClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).addClass(t.call(this,e,Ct(this)))}):(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++)i=e[o],n.indexOf(" "+i+" ")<0&&(n+=i+" ");a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this},removeClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).removeClass(t.call(this,e,Ct(this)))}):arguments.length?(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++){i=e[o];while(-1<n.indexOf(" "+i+" "))n=n.replace(" "+i+" "," ")}a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this:this.attr("class","")},toggleClass:function(t,n){var e,r,i,o,a=typeof t,s="string"===a||Array.isArray(t);return v(t)?this.each(function(e){ce(this).toggleClass(t.call(this,e,Ct(this),n),n)}):"boolean"==typeof n&&s?n?this.addClass(t):this.removeClass(t):(e=kt(t),this.each(function(){if(s)for(o=ce(this),i=0;i<e.length;i++)r=e[i],o.hasClass(r)?o.removeClass(r):o.addClass(r);else void 0!==t&&"boolean"!==a||((r=Ct(this))&&_.set(this,"__className__",r),this.setAttribute&&this.setAttribute("class",r||!1===t?"":_.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&-1<(" "+Tt(Ct(n))+" ").indexOf(t))return!0;return!1}});var St=/\r/g;ce.fn.extend({val:function(n){var r,e,i,t=this[0];return arguments.length?(i=v(n),this.each(function(e){var t;1===this.nodeType&&(null==(t=i?n.call(this,e,ce(this).val()):n)?t="":"number"==typeof t?t+="":Array.isArray(t)&&(t=ce.map(t,function(e){return null==e?"":e+""})),(r=ce.valHooks[this.type]||ce.valHooks[this.nodeName.toLowerCase()])&&"set"in r&&void 0!==r.set(this,t,"value")||(this.value=t))})):t?(r=ce.valHooks[t.type]||ce.valHooks[t.nodeName.toLowerCase()])&&"get"in r&&void 0!==(e=r.get(t,"value"))?e:"string"==typeof(e=t.value)?e.replace(St,""):null==e?"":e:void 0}}),ce.extend({valHooks:{option:{get:function(e){var t=ce.find.attr(e,"value");return null!=t?t:Tt(ce.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!fe(n.parentNode,"optgroup"))){if(t=ce(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=ce.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=-1<ce.inArray(ce.valHooks.option.get(r),o))&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),ce.each(["radio","checkbox"],function(){ce.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<ce.inArray(ce(e).val(),t)}},le.checkOn||(ce.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var Et=ie.location,jt={guid:Date.now()},At=/\?/;ce.parseXML=function(e){var t,n;if(!e||"string"!=typeof e)return null;try{t=(new ie.DOMParser).parseFromString(e,"text/xml")}catch(e){}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||ce.error("Invalid XML: "+(n?ce.map(n.childNodes,function(e){return e.textContent}).join("\n"):e)),t};var Dt=/^(?:focusinfocus|focusoutblur)$/,Nt=function(e){e.stopPropagation()};ce.extend(ce.event,{trigger:function(e,t,n,r){var i,o,a,s,u,l,c,f,p=[n||C],d=ue.call(e,"type")?e.type:e,h=ue.call(e,"namespace")?e.namespace.split("."):[];if(o=f=a=n=n||C,3!==n.nodeType&&8!==n.nodeType&&!Dt.test(d+ce.event.triggered)&&(-1<d.indexOf(".")&&(d=(h=d.split(".")).shift(),h.sort()),u=d.indexOf(":")<0&&"on"+d,(e=e[ce.expando]?e:new ce.Event(d,"object"==typeof e&&e)).isTrigger=r?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:ce.makeArray(t,[e]),c=ce.event.special[d]||{},r||!c.trigger||!1!==c.trigger.apply(n,t))){if(!r&&!c.noBubble&&!y(n)){for(s=c.delegateType||d,Dt.test(s+d)||(o=o.parentNode);o;o=o.parentNode)p.push(o),a=o;a===(n.ownerDocument||C)&&p.push(a.defaultView||a.parentWindow||ie)}i=0;while((o=p[i++])&&!e.isPropagationStopped())f=o,e.type=1<i?s:c.bindType||d,(l=(_.get(o,"events")||Object.create(null))[e.type]&&_.get(o,"handle"))&&l.apply(o,t),(l=u&&o[u])&&l.apply&&$(o)&&(e.result=l.apply(o,t),!1===e.result&&e.preventDefault());return e.type=d,r||e.isDefaultPrevented()||c._default&&!1!==c._default.apply(p.pop(),t)||!$(n)||u&&v(n[d])&&!y(n)&&((a=n[u])&&(n[u]=null),ce.event.triggered=d,e.isPropagationStopped()&&f.addEventListener(d,Nt),n[d](),e.isPropagationStopped()&&f.removeEventListener(d,Nt),ce.event.triggered=void 0,a&&(n[u]=a)),e.result}},simulate:function(e,t,n){var r=ce.extend(new ce.Event,n,{type:e,isSimulated:!0});ce.event.trigger(r,null,t)}}),ce.fn.extend({trigger:function(e,t){return this.each(function(){ce.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return ce.event.trigger(e,t,n,!0)}});var qt=/\[\]$/,Lt=/\r?\n/g,Ht=/^(?:submit|button|image|reset|file)$/i,Ot=/^(?:input|select|textarea|keygen)/i;function Pt(n,e,r,i){var t;if(Array.isArray(e))ce.each(e,function(e,t){r||qt.test(n)?i(n,t):Pt(n+"["+("object"==typeof t&&null!=t?e:"")+"]",t,r,i)});else if(r||"object"!==x(e))i(n,e);else for(t in e)Pt(n+"["+t+"]",e[t],r,i)}ce.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!ce.isPlainObject(e))ce.each(e,function(){i(this.name,this.value)});else for(n in e)Pt(n,e[n],t,i);return r.join("&")},ce.fn.extend({serialize:function(){return ce.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=ce.prop(this,"elements");return e?ce.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!ce(this).is(":disabled")&&Ot.test(this.nodeName)&&!Ht.test(e)&&(this.checked||!we.test(e))}).map(function(e,t){var n=ce(this).val();return null==n?null:Array.isArray(n)?ce.map(n,function(e){return{name:t.name,value:e.replace(Lt,"\r\n")}}):{name:t.name,value:n.replace(Lt,"\r\n")}}).get()}});var Rt=/%20/g,Mt=/#.*$/,It=/([?&])_=[^&]*/,Wt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ft=/^(?:GET|HEAD)$/,$t=/^\/\//,Bt={},_t={},Xt="*/".concat("*"),Ut=C.createElement("a");function zt(o){return function(e,t){"string"!=typeof e&&(t=e,e="*");var n,r=0,i=e.toLowerCase().match(D)||[];if(v(t))while(n=i[r++])"+"===n[0]?(n=n.slice(1)||"*",(o[n]=o[n]||[]).unshift(t)):(o[n]=o[n]||[]).push(t)}}function Vt(t,i,o,a){var s={},u=t===_t;function l(e){var r;return s[e]=!0,ce.each(t[e]||[],function(e,t){var n=t(i,o,a);return"string"!=typeof n||u||s[n]?u?!(r=n):void 0:(i.dataTypes.unshift(n),l(n),!1)}),r}return l(i.dataTypes[0])||!s["*"]&&l("*")}function Gt(e,t){var n,r,i=ce.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&ce.extend(!0,e,r),e}Ut.href=Et.href,ce.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Et.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Xt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":ce.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Gt(Gt(e,ce.ajaxSettings),t):Gt(ce.ajaxSettings,e)},ajaxPrefilter:zt(Bt),ajaxTransport:zt(_t),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var c,f,p,n,d,r,h,g,i,o,v=ce.ajaxSetup({},t),y=v.context||v,m=v.context&&(y.nodeType||y.jquery)?ce(y):ce.event,x=ce.Deferred(),b=ce.Callbacks("once memory"),w=v.statusCode||{},a={},s={},u="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(h){if(!n){n={};while(t=Wt.exec(p))n[t[1].toLowerCase()+" "]=(n[t[1].toLowerCase()+" "]||[]).concat(t[2])}t=n[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return h?p:null},setRequestHeader:function(e,t){return null==h&&(e=s[e.toLowerCase()]=s[e.toLowerCase()]||e,a[e]=t),this},overrideMimeType:function(e){return null==h&&(v.mimeType=e),this},statusCode:function(e){var t;if(e)if(h)T.always(e[T.status]);else for(t in e)w[t]=[w[t],e[t]];return this},abort:function(e){var t=e||u;return c&&c.abort(t),l(0,t),this}};if(x.promise(T),v.url=((e||v.url||Et.href)+"").replace($t,Et.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(D)||[""],null==v.crossDomain){r=C.createElement("a");try{r.href=v.url,r.href=r.href,v.crossDomain=Ut.protocol+"//"+Ut.host!=r.protocol+"//"+r.host}catch(e){v.crossDomain=!0}}if(v.data&&v.processData&&"string"!=typeof v.data&&(v.data=ce.param(v.data,v.traditional)),Vt(Bt,v,t,T),h)return T;for(i in(g=ce.event&&v.global)&&0==ce.active++&&ce.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!Ft.test(v.type),f=v.url.replace(Mt,""),v.hasContent?v.data&&v.processData&&0===(v.contentType||"").indexOf("application/x-www-form-urlencoded")&&(v.data=v.data.replace(Rt,"+")):(o=v.url.slice(f.length),v.data&&(v.processData||"string"==typeof v.data)&&(f+=(At.test(f)?"&":"?")+v.data,delete v.data),!1===v.cache&&(f=f.replace(It,"$1"),o=(At.test(f)?"&":"?")+"_="+jt.guid+++o),v.url=f+o),v.ifModified&&(ce.lastModified[f]&&T.setRequestHeader("If-Modified-Since",ce.lastModified[f]),ce.etag[f]&&T.setRequestHeader("If-None-Match",ce.etag[f])),(v.data&&v.hasContent&&!1!==v.contentType||t.contentType)&&T.setRequestHeader("Content-Type",v.contentType),T.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+("*"!==v.dataTypes[0]?", "+Xt+"; q=0.01":""):v.accepts["*"]),v.headers)T.setRequestHeader(i,v.headers[i]);if(v.beforeSend&&(!1===v.beforeSend.call(y,T,v)||h))return T.abort();if(u="abort",b.add(v.complete),T.done(v.success),T.fail(v.error),c=Vt(_t,v,t,T)){if(T.readyState=1,g&&m.trigger("ajaxSend",[T,v]),h)return T;v.async&&0<v.timeout&&(d=ie.setTimeout(function(){T.abort("timeout")},v.timeout));try{h=!1,c.send(a,l)}catch(e){if(h)throw e;l(-1,e)}}else l(-1,"No Transport");function l(e,t,n,r){var i,o,a,s,u,l=t;h||(h=!0,d&&ie.clearTimeout(d),c=void 0,p=r||"",T.readyState=0<e?4:0,i=200<=e&&e<300||304===e,n&&(s=function(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(v,T,n)),!i&&-1<ce.inArray("script",v.dataTypes)&&ce.inArray("json",v.dataTypes)<0&&(v.converters["text script"]=function(){}),s=function(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(v,s,T,i),i?(v.ifModified&&((u=T.getResponseHeader("Last-Modified"))&&(ce.lastModified[f]=u),(u=T.getResponseHeader("etag"))&&(ce.etag[f]=u)),204===e||"HEAD"===v.type?l="nocontent":304===e?l="notmodified":(l=s.state,o=s.data,i=!(a=s.error))):(a=l,!e&&l||(l="error",e<0&&(e=0))),T.status=e,T.statusText=(t||l)+"",i?x.resolveWith(y,[o,l,T]):x.rejectWith(y,[T,l,a]),T.statusCode(w),w=void 0,g&&m.trigger(i?"ajaxSuccess":"ajaxError",[T,v,i?o:a]),b.fireWith(y,[T,l]),g&&(m.trigger("ajaxComplete",[T,v]),--ce.active||ce.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return ce.get(e,t,n,"json")},getScript:function(e,t){return ce.get(e,void 0,t,"script")}}),ce.each(["get","post"],function(e,i){ce[i]=function(e,t,n,r){return v(t)&&(r=r||n,n=t,t=void 0),ce.ajax(ce.extend({url:e,type:i,dataType:r,data:t,success:n},ce.isPlainObject(e)&&e))}}),ce.ajaxPrefilter(function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")}),ce._evalUrl=function(e,t,n){return ce.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){ce.globalEval(e,t,n)}})},ce.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=ce(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(n){return v(n)?this.each(function(e){ce(this).wrapInner(n.call(this,e))}):this.each(function(){var e=ce(this),t=e.contents();t.length?t.wrapAll(n):e.append(n)})},wrap:function(t){var n=v(t);return this.each(function(e){ce(this).wrapAll(n?t.call(this,e):t)})},unwrap:function(e){return this.parent(e).not("body").each(function(){ce(this).replaceWith(this.childNodes)}),this}}),ce.expr.pseudos.hidden=function(e){return!ce.expr.pseudos.visible(e)},ce.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},ce.ajaxSettings.xhr=function(){try{return new ie.XMLHttpRequest}catch(e){}};var Yt={0:200,1223:204},Qt=ce.ajaxSettings.xhr();le.cors=!!Qt&&"withCredentials"in Qt,le.ajax=Qt=!!Qt,ce.ajaxTransport(function(i){var o,a;if(le.cors||Qt&&!i.crossDomain)return{send:function(e,t){var n,r=i.xhr();if(r.open(i.type,i.url,i.async,i.username,i.password),i.xhrFields)for(n in i.xhrFields)r[n]=i.xhrFields[n];for(n in i.mimeType&&r.overrideMimeType&&r.overrideMimeType(i.mimeType),i.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest"),e)r.setRequestHeader(n,e[n]);o=function(e){return function(){o&&(o=a=r.onload=r.onerror=r.onabort=r.ontimeout=r.onreadystatechange=null,"abort"===e?r.abort():"error"===e?"number"!=typeof r.status?t(0,"error"):t(r.status,r.statusText):t(Yt[r.status]||r.status,r.statusText,"text"!==(r.responseType||"text")||"string"!=typeof r.responseText?{binary:r.response}:{text:r.responseText},r.getAllResponseHeaders()))}},r.onload=o(),a=r.onerror=r.ontimeout=o("error"),void 0!==r.onabort?r.onabort=a:r.onreadystatechange=function(){4===r.readyState&&ie.setTimeout(function(){o&&a()})},o=o("abort");try{r.send(i.hasContent&&i.data||null)}catch(e){if(o)throw e}},abort:function(){o&&o()}}}),ce.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),ce.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return ce.globalEval(e),e}}}),ce.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),ce.ajaxTransport("script",function(n){var r,i;if(n.crossDomain||n.scriptAttrs)return{send:function(e,t){r=ce("<script>").attr(n.scriptAttrs||{}).prop({charset:n.scriptCharset,src:n.url}).on("load error",i=function(e){r.remove(),i=null,e&&t("error"===e.type?404:200,e.type)}),C.head.appendChild(r[0])},abort:function(){i&&i()}}});var Jt,Kt=[],Zt=/(=)\?(?=&|$)|\?\?/;ce.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kt.pop()||ce.expando+"_"+jt.guid++;return this[e]=!0,e}}),ce.ajaxPrefilter("json jsonp",function(e,t,n){var r,i,o,a=!1!==e.jsonp&&(Zt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Zt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return r=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Zt,"$1"+r):!1!==e.jsonp&&(e.url+=(At.test(e.url)?"&":"?")+e.jsonp+"="+r),e.converters["script json"]=function(){return o||ce.error(r+" was not called"),o[0]},e.dataTypes[0]="json",i=ie[r],ie[r]=function(){o=arguments},n.always(function(){void 0===i?ce(ie).removeProp(r):ie[r]=i,e[r]&&(e.jsonpCallback=t.jsonpCallback,Kt.push(r)),o&&v(i)&&i(o[0]),o=i=void 0}),"script"}),le.createHTMLDocument=((Jt=C.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Jt.childNodes.length),ce.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(le.createHTMLDocument?((r=(t=C.implementation.createHTMLDocument("")).createElement("base")).href=C.location.href,t.head.appendChild(r)):t=C),o=!n&&[],(i=w.exec(e))?[t.createElement(i[1])]:(i=Ae([e],t,o),o&&o.length&&ce(o).remove(),ce.merge([],i.childNodes)));var r,i,o},ce.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return-1<s&&(r=Tt(e.slice(s)),e=e.slice(0,s)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),0<a.length&&ce.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?ce("<div>").append(ce.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},ce.expr.pseudos.animated=function(t){return ce.grep(ce.timers,function(e){return t===e.elem}).length},ce.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l=ce.css(e,"position"),c=ce(e),f={};"static"===l&&(e.style.position="relative"),s=c.offset(),o=ce.css(e,"top"),u=ce.css(e,"left"),("absolute"===l||"fixed"===l)&&-1<(o+u).indexOf("auto")?(a=(r=c.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),v(t)&&(t=t.call(e,n,ce.extend({},s))),null!=t.top&&(f.top=t.top-s.top+a),null!=t.left&&(f.left=t.left-s.left+i),"using"in t?t.using.call(e,f):c.css(f)}},ce.fn.extend({offset:function(t){if(arguments.length)return void 0===t?this:this.each(function(e){ce.offset.setOffset(this,t,e)});var e,n,r=this[0];return r?r.getClientRects().length?(e=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:e.top+n.pageYOffset,left:e.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===ce.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===ce.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=ce(e).offset()).top+=ce.css(e,"borderTopWidth",!0),i.left+=ce.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-ce.css(r,"marginTop",!0),left:t.left-i.left-ce.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===ce.css(e,"position"))e=e.offsetParent;return e||J})}}),ce.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,i){var o="pageYOffset"===i;ce.fn[t]=function(e){return R(this,function(e,t,n){var r;if(y(e)?r=e:9===e.nodeType&&(r=e.defaultView),void 0===n)return r?r[i]:e[t];r?r.scrollTo(o?r.pageXOffset:n,o?n:r.pageYOffset):e[t]=n},t,e,arguments.length)}}),ce.each(["top","left"],function(e,n){ce.cssHooks[n]=Ye(le.pixelPosition,function(e,t){if(t)return t=Ge(e,n),_e.test(t)?ce(e).position()[n]+"px":t})}),ce.each({Height:"height",Width:"width"},function(a,s){ce.each({padding:"inner"+a,content:s,"":"outer"+a},function(r,o){ce.fn[o]=function(e,t){var n=arguments.length&&(r||"boolean"!=typeof e),i=r||(!0===e||!0===t?"margin":"border");return R(this,function(e,t,n){var r;return y(e)?0===o.indexOf("outer")?e["inner"+a]:e.document.documentElement["client"+a]:9===e.nodeType?(r=e.documentElement,Math.max(e.body["scroll"+a],r["scroll"+a],e.body["offset"+a],r["offset"+a],r["client"+a])):void 0===n?ce.css(e,t,i):ce.style(e,t,n,i)},s,n?e:void 0,n)}})}),ce.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){ce.fn[t]=function(e){return this.on(t,e)}}),ce.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),ce.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,n){ce.fn[n]=function(e,t){return 0<arguments.length?this.on(n,null,e,t):this.trigger(n)}});var en=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;ce.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=ae.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(ae.call(arguments)))}).guid=e.guid=e.guid||ce.guid++,i},ce.holdReady=function(e){e?ce.readyWait++:ce.ready(!0)},ce.isArray=Array.isArray,ce.parseJSON=JSON.parse,ce.nodeName=fe,ce.isFunction=v,ce.isWindow=y,ce.camelCase=F,ce.type=x,ce.now=Date.now,ce.isNumeric=function(e){var t=ce.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},ce.trim=function(e){return null==e?"":(e+"").replace(en,"$1")},"function"==typeof define&&define.amd&&define("jquery",[],function(){return ce});var tn=ie.jQuery,nn=ie.$;return ce.noConflict=function(e){return ie.$===ce&&(ie.$=nn),e&&ie.jQuery===ce&&(ie.jQuery=tn),ce},"undefined"==typeof e&&(ie.jQuery=ie.$=ce),ce});
```

### `public\js\jquery.ui.touch-punch.js`

- **Size:** 1301 bytes
- **Extension:** `.js`

```javascript
/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);
```

### `public\js\library.js`

- **Size:** 3003 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

function array_remove(arr, val) {
	arr = arr.filter(function(item) {
		return item !== val
	});

	return arr;
}

function url_encode(uri) {
	if (uri != undefined) {
		var parts = uri.split('/');

		parts.forEach(function(value, key) {
			value = encodeURIComponent(value);
			value = value.replace(/'/g, '%27');
			parts[key] = value;
		});

		uri = parts.join('/');
	}

	return uri;
}

/* UTF-8
 */
function utf8_encode(str) {
	return unescape(encodeURIComponent(str));
}

function utf8_decode(str) {
	return decodeURIComponent(escape(str));
}

/* SHA256
 */
function sha256(ascii) {
	const rightRotate = function(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};

	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length';
	var i, j;
	var result = '';
	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	var hash = sha256.h = sha256.h || [];
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}

	ascii += '\x80';
	while (ascii[lengthProperty]%64 - 56) {
		ascii += '\x00';
	}

	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return;
		words[i>>2] |= j << ((3 - i)%4)*8;
	}

	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)

	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16);
		var oldHash = hash;

		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			var w15 = w[i - 15], w2 = w[i - 2];
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
				+ ((e&hash[5])^((~e)&hash[6]))
				+ k[i]
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3))
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10))
					)|0
				);

			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
				+ ((a&hash[1]) ^ (a&hash[2]) ^ (hash[1]&hash[2]));

			hash = [(temp1 + temp2)|0].concat(hash);
			hash[4] = (hash[4] + temp1)|0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i] >> (j*8)) & 255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}

	return result;
};
```

### `public\js\login.js`

- **Size:** 1115 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const KEY_ENTER = 13;

$(document).ready(function() {
	$('input#username').keypress(function(event) {
		if (event.which == KEY_ENTER) {
			$('input#password').focus();
		}
	});

	$('input#password').keypress(function(event) {
		if (event.which == KEY_ENTER) {
			$('button').first().trigger('click');
		}
	});

	$('button').first().on('click', function() {
		var username = $('input#username').val();
		var password = $('input#password').val();

		$.post('/', {
			username: username,
			password: password
		}).done(function(data) {
			window.location = '/';
		}).fail(function(result) {
			$('p.warning').remove();
			$('h1').after('<p class="warning">Invalid login.</p>');

			if ($('input#username').val() == '') {
				$('input#password').val('');
				$('input#username').focus();
			} else {
				$('input#password').val('').focus();
			}
		});
	});

	$('input#username').focus();
});
```

### `public\js\taida.js`

- **Size:** 13717 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const KEY_SHIFT = 16;
const KEY_CTRL = 17;
const TAIDA_FS_TIMEOUT = 30000;
const ANIMATE_SPEED = 300;

var _taida_setting_error_shown = false;
var _taida_file_icons = [];
var _taida_callbacks_open_file = {};
var _taida_callback_open_directory = undefined;
var _taida_keys_down = {};
var _taida_icon_context_menu = {};
var _taida_timestamp = Date.now();

/* taida basic dialogs
 */
function taida_alert(message, title = '', callback_close = undefined) {
	message = message.replaceAll('\n', '<br />');

	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var alert_window = $(dialog).taida_window({
		header: title,
		width: 500,
		maximize: false,
		minimize: false,
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	alert_window.find('div.btn-group input').on('click', function() {
		alert_window.close();

		if (callback_close != undefined) {
			callback_close();
		}
	});

	var key_handler = function(event) {
		if ((event.which != 13) && (event.which != 27)) {
			return;
		}

		alert_window.find('div.btn-group input').trigger('click');
	};
	$(document).on('keydown', key_handler);

	alert_window.open();
}

function taida_confirm(message, callback_okay, callback_cancel = undefined) {
	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'<input type="button" value="Cancel" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var confirm_window = $(dialog).taida_window({
		header: 'Confirm',
		width: 500,
		maximize: false,
		minimize: false,
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	confirm_window.find('div.btn-group input').first().on('click', function() {
		confirm_window.close();

		callback_okay();
	});

	confirm_window.find('div.btn-group input').last().on('click', function() {
		confirm_window.close();

		if (callback_cancel != undefined) {
			callback_cancel();
		}
	});

	var key_handler = function(event) {
		if (event.which == 13) {
			confirm_window.find('div.btn-group input').first().trigger('click');
		} else if (event.which == 27) {
			confirm_window.find('div.btn-group input').last().trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	confirm_window.open();
}

function taida_prompt(message, input, callback_okay, callback_cancel = undefined) {
	var dialog =
		'<div class="taida_dialog">' +
		'<div class="message">' + message + '</div>' +
		'<input type="text" value="' + input.replace('"', '\\"') + '" class="form-control" />' +
		'<div class="btn-group">' +
		'<input type="button" value="Ok" class="btn btn-default" />' +
		'<input type="button" value="Cancel" class="btn btn-default" />' +
		'</div>' +
		'</div>';
	var prompt_window = $(dialog).taida_window({
		header: 'Input',
		width: 500,
		maximize: false,
		minimize: false,
		open: function() {
			var input = prompt_window.find('input.form-control');
			var length = input.val().length;
			input.focus();
			input[0].setSelectionRange(length, length);
		},
		close: function() {
			$(document).off('keydown', key_handler);
		},
		resize: false,
		dialog: true
	});

	prompt_window.find('div.btn-group input').first().on('click', function() {
		var input = prompt_window.find('input.form-control').val();

		prompt_window.close();

		callback_okay(input);
	});

	prompt_window.find('div.btn-group input').last().on('click', function() {
		prompt_window.close();

		if (callback_cancel != undefined) {
			callback_cancel();
		}
	});

	var key_handler = function(event) {
		if (event.which == 13) {
			prompt_window.find('div.btn-group input').first().trigger('click');
		} else if (event.which == 27) {
			prompt_window.find('div.btn-group input').last().trigger('click');
		}
	};
	$(document).on('keydown', key_handler);

	prompt_window.open();
}

/* Context menu
 */
function taida_contextmenu_add_items(menu_entries, extension) {
	var items = _taida_icon_context_menu[extension];
	if (items == undefined) {
		return;
	}

	menu_entries.push('-');
	items.forEach(function(item) {
		menu_entries.push({ name: item.label, icon: item.icon, callback:item.callback });
	});
}

function taida_contextmenu_show(icon, event, menu_entries, callback) {
	var menu_x = event.clientX;
	var menu_y = event.clientY;
	var z_index = taida_window_max_zindex() + 2;

	var menu = $('<div class="context_menu" style="position:absolute; display:none; z-index:' + z_index + ';">');
	menu_entries.forEach(function(value) {
		if (value == '-') {
			menu.append('<div><hr /></div>');
		} else {
			var item = $('<div class="option"><span class="fa fa-' + value.icon + '"></span><span class="text">' + value.name + '</span></div>');

			if (value.callback != undefined) {
				var cb = value.callback;
			} else {
				var cb = callback;
			}

			item.on('mousedown', function() {
				$('body div.context_menu').remove();
				cb(icon, value.name);
			});

			menu.append(item);
		}
	});

	$('body div.context_menu').remove();
	$('body').append(menu);

	var desktop_width = Math.round($('div.desktop').width());
	var desktop_height = Math.round($('div.desktop').height());

	var menu = $('div.context_menu');
	var menu_width = Math.round(menu.outerWidth());
	var menu_height = Math.round(menu.outerHeight());

	if (menu_x + menu_width > desktop_width) {
		menu_x -= menu_width;
	}

	if (menu_y + menu_height > desktop_height) {
		menu_y -= menu_height;
	}

	menu.css('left', menu_x + 'px');
	menu.css('top', menu_y + 'px');
	menu.css('display', '');

	$(document).one('mousedown', function() {
		$('body div.context_menu').remove();
	});
}

function taida_contextmenu_extra_item(extension, label, icon, callback) {
	var entry = {
		label: label,
		icon: icon,
		callback: callback
	}

	if (_taida_icon_context_menu[extension] == undefined) {
		_taida_icon_context_menu[extension] = [];
	}

	_taida_icon_context_menu[extension].push(entry);
}

/* Icon functions
 */
function taida_icon_to_filename(icon) {
	var container = $(icon).parent();

	if (container.hasClass('icons') && container.parent().hasClass('desktop')) {
		/* Desktop
		 */
		return 'Desktop/' + $(icon).find('span').text();
	}

	if (container.hasClass('files') && container.parent().hasClass('explorer')) {
		/* Explorer
		 */
		var explorer_window = container.parent();
		var path = explorer_window.data('path');
		if (path != '') {
			path += '/';
		}

		return path + $(icon).find('span').first().text();
	}

	return undefined;
}

function taida_make_icon(name, image) {
	return '<div class="icon">' +
		'<img src="' + image + '" alt="' + name + '" title="' + name + '" draggable="false" />' +
		'<span>' + name + '</span></div>';
}

function taida_get_file_icon(extension) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var default_icon = '/images/file.png';
	var handler = _taida_callbacks_open_file[extension];

	if (_taida_file_icons.includes(extension)) {
		default_icon = '/images/icons/' + extension + '.png';
	}

	if (handler == undefined) {
		return default_icon;
	}

	if (handler.icon == undefined) {
		return default_icon;
	}

	return handler.icon;
}

/* File and directory handlers
 */
function taida_upon_file_open(extension, callback, icon = undefined) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var handler = {
		callback: callback,
		icon: icon
	}

	if (_taida_callbacks_open_file[extension] == undefined) {
		_taida_callbacks_open_file[extension] = handler;
	} else {
		taida_alert('Duplicate extension handler for .' + extension + ' files.', 'Taida error');
	}
}

function taida_upon_directory_open(callback) {
	if (_taida_callback_open_directory == undefined) {
		_taida_callback_open_directory = callback;
	}
}

function taida_get_file_handler(extension) {
	if (typeof extension === 'string') {
		extension = extension.toLowerCase();
	}

	var handler = _taida_callbacks_open_file[extension];

	if (handler == undefined) {
		return undefined;
	}

	return handler.callback;
}

function taida_get_directory_handler(extension) {
	return _taida_callback_open_directory;
}

/* Cookie
 */
function taida_get_cookie(cookie) {
	var parts = document.cookie.split(';');

	var cookies = {};
	parts.forEach(function(part) {
		var item = part.split('=');
		var key = item[0].trim();
		var value = item[1].trim();

		cookies[key] = value;
	});

	return cookies[cookie];
}

/* Settings
 */
function taida_setting_get(setting, callback_done, callback_fail = undefined) {
	$.ajax({
		url: '/taida/setting/' + setting
	}).done(function(data) {
		var result = $(data).find('result').text();
		callback_done(result);
	}).fail(function(result) {
		if ((result.status == 500) && (_taida_setting_error_shown == false)) {
			_taida_setting_error_shown = true;
			taida_alert('User settings file not found. Read INSTALL for instructions.', 'Taida error');
		}

		if (callback_fail != undefined) {
			callback_fail(result.status);
		}
	});
}

function taida_setting_set(setting, value, callback_done = undefined, callback_fail = undefined) {
	$.post('/taida/setting/' + setting, {
		value: value
	}).done(function() {
		if (callback_done != undefined) {
			callback_done();
		}
	}).fail(function(result) {
		if ((result.status == 500) && (_taida_setting_error_shown == false)) {
			_taida_setting_error_shown = true;
			taida_alert('User settings file not writable for webserver.', 'Taida error');
		}

		if (callback_fail != undefined) {
			callback_fail(result.status);
		}
	});
}

/* Dynamically add resources
 */
function taida_load_javascript(javascript) {
	if ($('div.desktop').attr('debug') == 'yes') {
		javascript += '?' + _taida_timestamp;
	}

	if ($('head script[src="' + javascript + '"]').length > 0) {
		return;
	}

	$('head').append('<script type="text/javascript" src="' + javascript + '"></script>');
}

function taida_load_stylesheet(stylesheet) {
	if ($('div.desktop').attr('debug') == 'yes') {
		stylesheet += '?' + _taida_timestamp;
	}

	if ($('head link[href="' + stylesheet + '"]').length > 0) {
		return;
	}

	$('head').append('<link rel="stylesheet" type="text/css" href="' + stylesheet + '" />');
}

/* Logout
 */
function taida_logout(force = false) {
	var taida_do_logout = function() {
		var login = $('div.desktop').attr('login');

		var logout = window.location.protocol + '//';

		if (login == 'http') {
			logout += 'log:out@';
		}

		logout += window.location.hostname;

		if (login == 'taida') {
			logout += '/?logout';
		}

		$('body').empty().css('background-color', '#202020');
		window.location = logout;
	};

	if (force) {
		taida_do_logout();
	} else if ($('div.windows div.window').length > 0) {
		taida_confirm('Close all windows and logout?', taida_do_logout);
	} else {
		taida_do_logout();
	}
}

/* Key press
 */
function taida_key_pressed(key) {
	return _taida_keys_down[key];
}

/* Main
 */
$(document).ready(function() {
	/* Custom icons
	 */
	$.ajax({
		url: '/taida/icon/default'
	}).done(function(data) {
		$(data).find('icon').each(function() {
			_taida_file_icons.push($(this).text());
		});
	}).fail(function() {
		taida_alert('Error loading custom icons.', 'Taida error');
	});

	/* Register ctrl press
	 */
	var keys_init = function() {
		_taida_keys_down[KEY_SHIFT] = false;
		_taida_keys_down[KEY_CTRL] = false;
	};

	$(window).focus(keys_init);
	keys_init();

	$('body').on('keydown', function(event) {
		if (_taida_keys_down[event.which] !== undefined) {
			_taida_keys_down[event.which] = true;
		}

		if (event.which == KEY_CTRL) {
			if ($('div.ui-draggable-dragging div.plus').length == 0) {
				var plus = '<div class="plus">+<div>';
				$('div.ui-draggable-dragging').prepend(plus);
			}
		}
	});

	$('body').on('keyup', function(event) {
		if (_taida_keys_down[event.which] !== undefined) {
			_taida_keys_down[event.which] = false;
		}

		if (event.which == KEY_CTRL) {
			$('div.ui-draggable-dragging').find('div.plus').remove();
		}
	});

	/* Keep session alive
	 */
	var timeout = $('div.desktop').attr('timeout');
	if ((timeout != undefined) && (timeout != '')) {
		timeout = parseInt(timeout);
		if (isNaN(timeout)) {
			taida_alert('Invalid session timeout.', 'Taida error');
		} else {
			timeout = (timeout - 10) * 1000;
			setInterval(function() {
				$.ajax({
					url: '/taida/ping'
				}).fail(function(result) {
					if (result.status == 401) {
						taida_logout(true);
					}
				});
			}, timeout);
		}
	}

	/* Check for autosave files
	 */
	$.ajax({
		url: '/taida/autosave'
	}).done(function(data) {
		$(data).find('autosave').each(function() {
			var autosave = $(this).text();
			var filename = taida_file_filename(autosave);
			var parts = filename.split('_');
			var app = parts[0] + '_open';
			window[app](autosave);
		});
	});
});
```

### `public\js\taskbar.js`

- **Size:** 5053 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

/* Start menu
 */
function taida_startmenu_add(label, icon, callback) {
	var entry = $('<div class="application"><img src="' + icon + '" class="icon" draggable="false" /><span>' + label + '</span></div>');

	entry.on('click', function() {
		taida_startmenu_close();
		callback();
	});

	var startmenu = $('div.taskbar div.startmenu div.applications');

	var applications = startmenu.find('div.application');
	if (applications.length == 0) {
		startmenu.append(entry);
		return;
	}

	label = label.toLowerCase();
	var first = applications.first().find('span').text().toLowerCase();

	if (label.localeCompare(first) == -1) {
		startmenu.prepend(entry);
		return;
	}

	var added = false;
	applications.each(function() {
		var name = $(this).find('span').text();
		if (label.localeCompare(name) == -1) {
			$(this).before(entry);
			added = true;
			return false;
		}
	});

	if (added == false) {
		startmenu.append(entry);
	}
}

function taida_startmenu_system(label, icon, callback) {
	var entry = $('<img src="' + icon + '" class="icon" alt="' + label + '" title="' + label + '" draggable="false" />');

	entry.on('click', function() {
		taida_startmenu_close();
		callback();
	});

	$('div.taskbar div.startmenu div.system').append(entry);
}

function taida_startmenu_close() {
	$('div.taskbar div.startmenu').hide();
}



/* Taskbar
 */
function taida_taskbar_add(task_id) {
	var task = $('div.windows div#' + task_id);
	var title = task.find('div.window-header div.title').text();
	var icon = task.find('img.icon').attr('src');
	if (icon != undefined) {
		icon = '<img src="' + icon + '" />';
	} else {
		icon = '';
	}

	var app_id = task_id.substr(11);

	$('div.taskbar div.tasks').append('<div class="task" taskid="' + task_id + '" title="' + title + ' (PID:' + app_id + ')">' + icon + '<span>' + title + '</span></div>');

	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').on('click', function(event) {
		if ($(this).hasClass('minimized')) {
			task.show();
			taida_window_raise(task);
			task.css('transform', 'translate(0, 0) scale(1)');
			var bar = $(this);

			window.setTimeout(function() {
				task.css('transition', '');
				task.css('transform', '');

				bar.removeClass('minimized');

				var settings = task.data('settings');
				if ((settings.resize != undefined) && (settings.resize != false)) {
					settings.resize();
				}
			}, ANIMATE_SPEED);
		} else if (task.find('span.fa-window-minimize').length == 0) {
			taida_window_raise(task);
		} else if (task.hasClass('focus') == false) {
			taida_window_raise(task);
		} else {
			taida_window_minimize(task_id);
		}

		event.stopPropagation();
	});

	taida_taskbar_set_task_width();
}

function taida_taskbar_focus(task_id) {
	$('div.taskbar div.tasks div.task').removeClass('focus');
	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').addClass('focus');
}

function taida_taskbar_remove(task_id) {
	$('div.taskbar div.tasks div.task[taskid=' + task_id + ']').remove();

	taida_taskbar_set_task_width();
}

function taida_taskbar_clock() {
	var clock = $('div.taskbar div.clock');

	var d = new Date();
	var time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
	var date = d.getDate() + '/' + (d.getMonth() + 1) + '/' + (1900 + d.getYear());

	clock.html(time + '<br />' + date);
}

function taida_taskbar_set_task_width() {
	var count = $('div.taskbar div.tasks div.task').length;
	if (count == 0) {
		return;
	}

	var width = $('div.taskbar').innerWidth() - $('div.taskbar div.start').outerWidth() -
	            $('div.taskbar div.quickstart').outerWidth() - $('div.taskbar div.clock').outerWidth();
	width = (width / count) - 7;

	$('div.taskbar div.tasks div.task').css('width', width + 'px');
}

/* Main
 */
$(document).ready(function() {
	$('div.taskbar div.start').on('click', function(event) {
		taida_window_unfocus_all()
		var zindex = taida_window_max_zindex() + 1;
		$('div.taskbar').css('z-index', zindex);
		$('div.taskbar div.startmenu').css('z-index', zindex + 1);
		$('div.taskbar div.startmenu').toggle(200);
		$('div.taskbar div.startmenu div.applications')[0].scrollTop = 0;
		event.stopPropagation();
	});

	$('div.taskbar').on('click', function(event) {
		taida_window_unfocus_all()
		event.stopPropagation();
	});

	$('div.taskbar div.startmenu').on('click', function(event) {
		event.stopPropagation();
	});

	taida_taskbar_clock();

	var d = new Date();
	window.setTimeout(function() {
		taida_taskbar_clock();
		window.setInterval(taida_taskbar_clock, 60000);
	}, (60 - d.getSeconds()) * 1000);

	if ($('div.desktop').attr('login') != 'none') {
		taida_startmenu_system('Logout', '/images/logout.png', taida_logout);
	}
});
```

### `public\js\user_javascript.js`

- **Size:** 2424 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

const USER_LOGIN_SCRIPT = 'login.ujs';
const USER_LOAD_SCRIPT = 'load.ujs';

var user_javascript_errors = [];

function javascript_execute_file(filename) {
	taida_file_exists(filename, function(exists) {
		if (exists == false) {
			taida_alert('Javascript not found.');
			return;
		}

		var js_id = 'js_' + sha256(filename);

		filename = '/taida/file/download/' + filename;

		if ($('div.desktop').attr('debug') == 'yes') {
			filename += '?' + Date.now();
		}

		$('head script#' + js_id).remove();
		$('head').append('<script id=\"' + js_id + '\" type="text/javascript" src="' + filename + '"></script>');
	});
}

function javascript_log_error(message) {
	message = '<div class="item">' + message + '</div>';

	user_javascript_errors.push(message);

	var error_apps = $('div.user_javascript_errors');

	if (error_apps.length > 0) {
		error_apps.append(message);
		return;
	}

	var error_content = '<div class="user_javascript_errors"></div>';
	var error_window = $(error_content).taida_window({
		header: 'User Javascript errors',
		icon: '/images/error.png',
		width: 500,
		height: 200
	});

	user_javascript_errors.forEach(function(error) {
		error_window.append(message);
	});

	error_window.open();
}

$(document).ready(function() {
	taida_upon_file_open('ujs', javascript_execute_file, '/images/application.png');

	/* Check login and load scripts
	 */
	if (parseInt($('div.desktop').attr('counter')) == 0) {
		taida_file_exists(USER_LOGIN_SCRIPT, function(exists) {
			if (exists) {
				javascript_execute_file(USER_LOGIN_SCRIPT);
			}
		});
	}

	taida_file_exists(USER_LOAD_SCRIPT, function(exists) {
		if (exists) {
			javascript_execute_file(USER_LOAD_SCRIPT);
		}
	});

	/* Debugging on mobile devices
	 */
	window.setTimeout(function() {
		if ($('div.desktop').attr('mobile') != 'yes') {
			return;
		}

		window.onerror = function(message, url, linenr) {  
			javascript_log_error('[ERROR] ' + message + ' (' + linenr + ')');
			return false;
		};

		var _console_log = console.log;
		console.log = function(message) {
			javascript_log_error('[CONSOLE] ' + message);
			_console_log.apply(console, arguments);
		};
	}, 500);
});
```

### `public\js\windows.js`

- **Size:** 16038 bytes
- **Extension:** `.js`

```javascript
/* Copyright (c) by Hugo Leisink <hugo@leisink.net>
 * This file is part of the Taida web desktop
 * https://gitlab.com/hsleisink/taida
 *
 * Licensed under the GPLv2 License
 */

var _taida_window_id_label = 'windowframe';

/* About
 */
function taida_window_about(win) {
	var title = win.find('div.window-header div.title').text();
	var id = win.find('div.window-body > div').data('windowframe_id');

	taida_alert('Application: ' + title + '\nProcess ID: ' + id, 'Window information');
}

/* Get window max z-index
 */
function taida_window_max_zindex() {
	var max_zindex = 0;

	$('div.windows > div').each(function() {
		var zindex = parseInt($(this).css('z-index'));
		if (isNaN(zindex) == false) {
			if (zindex > max_zindex) {
				max_zindex = zindex;
			}
		}
	});

	return max_zindex;
}

/* Raise window
 */
function taida_window_raise(windowframe) {
	if (windowframe.hasClass('focus')) {
		return;
	}

	taida_startmenu_close();

	if ($('div.windows > div.dialog:not(.closing)').length > 0) {
		if (windowframe.hasClass('dialog') == false) {
			return;
		}
	}

	var zindex = taida_window_max_zindex() + 1;
	windowframe.css('z-index', zindex);

	$('div.windows div.window').removeClass('focus');
	$('div.windows:not(focus) ul.nav ul').hide();

	windowframe.addClass('focus');

	taida_taskbar_focus(windowframe.prop('id'));
}

/* Maximize window
 */
function taida_window_maximize(window_id) {
    var windowframe = $('div.windows div#' + window_id);
    if (windowframe.length === 0) {
        console.error("taida_window_maximize: No window found with ID", window_id);
        return;
    }

    var windat = windowframe.data('maximize');
    if (windat === undefined) {
        var pos = windowframe.position();
        if (!pos) {
            console.error("taida_window_maximize: Could not get position of window", window_id);
            return;
        }
        windat = [ pos.left, pos.top, windowframe.width(), windowframe.height() ];
        windowframe.data('maximize', windat);
        var pos_x = 0;
        var pos_y = 0;
        var width = Math.round($('div.windows').width());
        var height = Math.round($('div.windows').height());
    } else {
        var [pos_x, pos_y, width, height] = windat;
        windowframe.removeData('maximize');
    }

    windowframe.animate({
        left: pos_x + 'px',
        top: pos_y + 'px',
        width: width + 'px',
        height: height + 'px'
    }, ANIMATE_SPEED, function() {
        var settings = windowframe.data('settings');
        if (settings.resize !== undefined && settings.resize !== false) {
            settings.resize();
        }
    });
}


/* Minimize window
 */
function taida_window_minimize(window_id) {
    var windowframe = $('div.windows div#' + window_id);
    if (windowframe.length === 0) {
        console.error("taida_window_minimize: No window found with ID", window_id);
        return;
    }

    var task = $('div.taskbar div.tasks div.task[taskid=' + window_id + ']');
    task.addClass('minimized');

    windowframe.removeClass('focus');

    var win_pos = windowframe.offset();
    var task_pos = task.offset();
    if (!win_pos || !task_pos) {
        console.error("taida_window_minimize: Failed to get window/task position");
        return;
    }

    var width = windowframe.width();
    var dx = (task_pos.left - win_pos.left).toString();
    var dy = (task_pos.top - win_pos.top).toString();

    windowframe.css('transition', 'all .3s ease-in');
    windowframe.css('transform', 'translate(' + dx + 'px, ' + dy + 'px) scale(0)');

    window.setTimeout(function() {
        windowframe.hide();
    }, ANIMATE_SPEED);
}


/* Unfocus all windows
 */
function taida_window_unfocus_all() {
	$('div.windows ul.nav ul').hide();
	$('div.desktop div.windows div.focus').removeClass('focus');
}

/* Set window color
 */
function taida_window_set_color(bgcolor) {
	if (typeof bgcolor != 'string') {
		return false;
	} else if (bgcolor.length != 7) {
		return false;
	} else if (bgcolor.substr(0, 1) != '#') {
		return false;
	}

	var red = Number('0x' + bgcolor.substr(1, 2)) / 255;
	var green = Number('0x' + bgcolor.substr(3, 2)) / 255;
	var blue = Number('0x' + bgcolor.substr(5, 2)) / 255;

	var max = Math.max(red, Math.max(green, blue));
	var min = Math.min(red, Math.min(green, blue));
	var luminosity = (max + min) / 2;

	var txt_color = (luminosity > 0.5) ? '#000000' : '#ffffff';

	$('head style#taida_window_color').remove();

	var style = '<style id="taida_window_color" type="text/css">\n' +
		'div.windows div.window div.window-header {' +
		'\tcolor: ' + txt_color + ';' +
		'\tbackground-color: ' + bgcolor + ';' +
		'}\n' +
		'</style>';

	$('head').append(style);

	return true;
}

/* Set window title
 */
function taida_window_set_title(windowframe, title) {
	windowframe.parent().parent().find('div.window-header div.title').text(title);

}

/* Window plugin
 */
(function($) {
	const MARGIN_BOTTOM = 30;

	var pluginName = 'taida_window';
	var defaults = {
		top: undefined,
		width: 600,
		minWidth: 400,
		height: undefined,
		bgcolor: undefined,
		header: 'Application',
		icon: undefined,
		menu: undefined,
		open: undefined,
		close: undefined,
		maximize: undefined,
		minimize: undefined,
		resize: undefined,
		dialog: false,
		taskbar: true
	};

	var mouse_offset_x;
	var mouse_offset_y

	/* Constructor
	 */
	var plugin = function(el, options) {
		var element = $(el);
		var settings = $.extend({}, defaults, options);
		var id = 1;
		while ($('div.windows div#' + _taida_window_id_label + id).length > 0) {
			id++;
		}

		if (settings.dialog == true) {
			settings.minimize = false;
		}

		element.data('windowframe_id', id);
		element.data('header', settings.header);

		var menu = '';
		if (settings.menu != undefined) {
			menu += '<ul class="nav nav-tabs">';
			for ([item, entries] of Object.entries(settings.menu)) {
				menu += '<li class="dropdown">' +
				        '<a class="dropdown-toggle" href="#" onClick="javascript:return false" ' +
				        ' ondragstart="return false">' + item +
				        '</a><ul class="dropdown-menu">';
				entries.forEach(function(entry) {
					if (entry == '-') {
						menu += '<li class="divider"></li>';
					} else {
						menu += '<li><a class="entry" href="#" onClick="javascript:return false" ondragstart="return false">' + entry + '</a></li>';
					}
				});
				menu += '</ul></li>';
			};
			menu += '</ul>';
		}

		/* Window frame
		 */

		var window_buttons =
			'<div class="window-buttons">' +
				(settings.minimize === true ? '' : '<span class="window-btn minimize-btn"></span>') +
				(settings.maximize === true ? '' : '<span class="window-btn maximize-btn"></span>') +
				(settings.close === true ? '' : '<span class="window-btn close-btn"></span>') +
			'</div>';
		var icon = (settings.icon == undefined) ? '' : '<img src="' + settings.icon + '" class="icon" />';
		var windowframe = '<div id="windowframe' + id + '" class="window" tabindex="' + id + '"><div class="window-header">' +
			icon + '<div class="title">' + settings.header + '</div>' + window_buttons + '</div>' +
			menu + '<div class="window-body"></div></div>';
		$('div.windows').append(windowframe);

		windowframe = $('div.windows div#' + _taida_window_id_label + id);
		windowframe.data('settings', settings);
		if (settings.dialog) {
			windowframe.addClass('dialog');
		}

		/* Menu
		 */
		windowframe.find('ul.nav > li').on('click', function(event) {
			taida_window_raise(windowframe);

			var visible = $(this).find('ul:visible').length > 0;
			$(this).parent().find('ul').hide();

			if (visible == false) {
				event.stopPropagation();

				$(this).find('ul').show(50);

				$('body').one('click', function() {
					windowframe.find('ul.nav ul').hide();
				});
			}
		});

		windowframe.find('ul.nav > li > a').mouseover(function(event) {
			var visible = $(this).parent().parent().find('ul:visible');

			if (visible.length == 0) {
				return;
			}

			if ($(this).is(visible.parent().children('a'))) {
				return;
			}

			$(this).parent().parent().find('ul').hide();
			$(this).parent().find('ul').show(50);
		});

		windowframe.find('ul.nav a.entry').on('click', function(event) {
			$(this).parent().parent().hide();

			var div = windowframe.find('div.window-body').children().first();
			settings.menuCallback(div, $(this).text());
			windowframe.find($('ul.nav li').removeClass('open'));

			event.stopPropagation();
		});

		/* Right-click dummy
		 */
		$('div.windows div#' + _taida_window_id_label + id).on('contextmenu', function() {
			menu_entries = [{ name: 'About this application', icon: 'info-circle' }];
			taida_contextmenu_show($(this), event, menu_entries, taida_window_about);

			taida_window_raise($(this));

			return false;
		});

		/* Window header buttons */
		windowframe.find('span.close-btn').on('click', function(event) {
			event.stopPropagation();
			windowframe_close.call($(this).closest('.window')[0]);
		});


		windowframe.find('span.maximize-btn').on('click', function(event) {
			var windowframe_id = $(this).closest('.window').attr('id');
			taida_window_maximize(windowframe_id);

			var windowframe = $('div.windows div#' + windowframe_id);
			var settings = windowframe.data('settings');
			if ((settings.resize != undefined) && (settings.resize != false)) {
				settings.resize();
			}
		});

		windowframe.find('span.minimize-btn').on('click', function(event) {
			var windowframe_id = $(this).closest('.window').attr('id');

			taida_window_minimize(windowframe_id);

			event.stopPropagation();
		});


		/* Add body
		 */
		var body = element.detach();
		windowframe.find('div.window-body').append(body.show());

		/* Style
		 */
		if (settings.width > window.innerWidth - 40) {
			settings.width = window.innerWidth - 40;
		}

		windowframe.css({
			display: 'none', position: 'absolute',
			boxShadow: '10px 10px 20px #181818',
			width: settings.width + 'px', zIndex: 1
		});

		if (settings.height + 50 > window.innerHeight - MARGIN_BOTTOM) {
			settings.height = window.innerHeight - MARGIN_BOTTOM - 50;
		}

		if (settings.height != undefined) {
			windowframe.css({
				height: (settings.height + 50) + 'px'
			});
		}

		if (settings.bgcolor != undefined) {
			windowframe.css('background-color', settings.bgcolor);
		}

		/* Click
		 */
		windowframe.on('click', function(event) {
			windowframe.find('ul.nav ul').hide();
			taida_window_raise($(this));

			event.stopPropagation();
		});

		/* Draggable
		 */
		windowframe.draggable({
			containment: 'div.windows',
			handle: 'div.window-header',
			start: function() {
				taida_window_raise($(this));
				taida_startmenu_close();
			},
			stop: function() {
				var pos = $(this).position();
				if (pos.left < 0) {
					$(this).css('left', '0px');
				}
				if (pos.top < 0) {
					$(this).css('top', '0px');
				}
			}
		});

		/* Resizable
		 */
		if (settings.resize !== false) {
			windowframe.resizable({
				minWidth: settings.minWidth,
				stop: function() {
					if ((settings.resize != undefined) && (settings.resize != false)) {
						settings.resize();
					}
					windowframe.removeData('maximize');
				}
			});
		}
	};

	/* Functions
	 */
	var unselect_text = function() {
		if (window.getSelection || document.getSelection) {
			window.getSelection().removeAllRanges();
		} else {
			document.selection.empty();
		}
	}

	var windowframe_open = function() {
		var windowframe_id = $(this).data('windowframe_id');
		var windowframe = $('div.windows div#' + _taida_window_id_label + windowframe_id);
		var settings = windowframe.data('settings');

		/* Dialog
		 */
		if (settings.dialog) {
			var zindex = taida_window_max_zindex() + 1;
			var overlay = '<div class="overlay overlay' + windowframe_id + '" style="z-index:' + zindex + '"></div>';
			$('div.windows').append(overlay);
			$('div.taskbar').append(overlay);
			$('div.overlay').on('click', function(event) {
				event.stopPropagation();
			});
			$('div.overlay').on('contextmenu', function(event) {
				event.stopPropagation();
				return false;
			});
		}

		taida_window_raise(windowframe);

		windowframe.fadeIn(400, function() {
			if (settings.open != undefined) {
				settings.open();
			}
		});

		if ((settings.dialog == false) && settings.taskbar) {
			taida_taskbar_add('windowframe' + windowframe_id);
		}

		/* Center windowframe
		 */
		var mobile_device = $('div.desktop').attr('mobile') == 'yes';

		var left = Math.round((window.innerWidth / 2) - (settings.width / 2));
		if (mobile_device == false) {
			left += Math.floor((Math.random() * 50) - 25);
		}
		if (left < 0) {
			left = 0;
		}
		windowframe.css('left', left + 'px');

		var height = windowframe.outerHeight(false);
		if (settings.top == undefined) {
			var top = Math.round((window.innerHeight / 2.5) - (height / 2));
			if (mobile_device == false) {
				top += Math.floor((Math.random() * 50) - 25);
			}
			if (top < 0) {
				top = 0;
			}
			windowframe.css('top', top + 'px');
		} else {
			windowframe.css('top', settings.top);
		}

		var pos = windowframe.position();
		if (pos.top < 0) windowframe.css('top', '0px');
		if (pos.left < 0) windowframe.css('left', '0px');
		var bottom = pos.top + height;
		if (bottom > window.innerHeight - MARGIN_BOTTOM) {
			windowframe.find('div.window-body').css({
				maxHeight: (height - (bottom - window.innerHeight) - 45 - MARGIN_BOTTOM) + 'px',
				overflowY: 'auto'
			});
		}
	};

	var windowframe_close = function(event) {
		// close via javascript?
		var windowframe_id = $(this).attr('id');
		if (windowframe_id == undefined) {
			// close via window header close button?
			windowframe_id = $(this).parent().parent().attr('id');
		}

		if (windowframe_id != undefined) {
			var windowframe = $('div.windows div#' + windowframe_id);
			var settings = windowframe.data('settings');

			if ((settings.close != undefined) && (settings.close != false)) {
				if (settings.close() === false) {
					return;
				}
			}

			windowframe.removeClass('focus');
			windowframe.addClass('closing');

			if (settings.dialog) {
				var id = windowframe.find('div.window-body > div').data('windowframe_id');
				$('div.windows div.overlay' + id).remove();
				$('div.taskbar div.overlay' + id).remove();
			}

			windowframe.fadeOut(200, function() {
				windowframe.remove();
				taida_taskbar_remove(windowframe_id);

				delete $(this);
			});
		} else {
			taida_confirm('Taida Error: Object has no window id. Remove anyway?', function() {
				$('div.windows div.overlay').remove();
				$('div.taskbar div.overlay').remove();
				$(this).parent().parent().remove();
			});
		}
	};

	var get_body = function() {
		var windowframe_id = $(this).data('windowframe_id');
		return $('div.windows div#' + _taida_window_id_label + windowframe_id + ' div.window-body').children().first();
	}

	var set_header = function(extra = '') {
		var header = $(this).data('header');
		if (extra != '') {
			header += ' :: ' + taida_file_filename(extra);
		}

		$(this).parent().parent().find('div.window-header div.title').text(header);

		var windowframe_id = $(this).data('windowframe_id');
		$('div.desktop div.taskbar div.tasks div[taskid=windowframe' + windowframe_id + '] span').text(header);
	}

	/* jQuery prototype
	 */
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			(new plugin(this, options));
		});
	};

	$.fn.extend({
		open: windowframe_open,
		close: windowframe_close,
		body: get_body,
		set_header: set_header
	});
})(jQuery);
```

### `taida_structure.py`

- **Size:** 4138 bytes
- **Extension:** `.py`

```python
from pathlib import Path
import math

# =========================
# CONFIG (NO SIZE LIMITS)
# =========================

ROOT_DIR = Path(r"C:\xampp\htdocs\taida")
OUTPUT_FILE = "taida_dump.md"

EXCLUDE_DIRS = {
    ".git", "__pycache__", "node_modules",
    ".venv", "dist", "build", "apps"
}

EXCLUDE_FILES = {OUTPUT_FILE}

TEXT_EXTENSIONS = {
    ".py", ".js", ".ts", ".php",
    ".html", ".css",
    ".json", ".md", ".txt",
    ".yml", ".yaml", ".env", ".sql"
}

# --- Unlimited content ---
KEEP_RATIO = 1.0                 # keep 100%
MIN_LINES_REQUIRED = 5           # irrelevant but kept for safety
MAX_LINES_PER_FILE = None        # None = NO LIMIT


# =========================
# HELPERS
# =========================

def should_exclude(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)

    if any(part in EXCLUDE_DIRS for part in rel.parts):
        return True

    if path.name in EXCLUDE_FILES:
        return True

    return False


def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS


def smart_truncate(lines: list[str]) -> list[str]:
    """
    With KEEP_RATIO = 1 and MAX_LINES_PER_FILE = None,
    this function returns the full file content.
    """
    total = len(lines)

    keep = max(
        math.ceil(total * KEEP_RATIO),
        MIN_LINES_REQUIRED
    )

    if MAX_LINES_PER_FILE is not None:
        keep = min(keep, MAX_LINES_PER_FILE)

    return lines[:keep]


def code_language(ext: str) -> str:
    return {
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
        ".php": "php",
        ".html": "html",
        ".css": "css",
        ".json": "json",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".sql": "sql",
        ".md": "markdown",
    }.get(ext.lower(), "")


# =========================
# MAIN
# =========================

def dump_markdown_for_llm(root: Path, output_path: Path):
    with output_path.open("w", encoding="utf-8") as out:

        # -------- PROJECT CONTEXT --------
        out.write("# Project Dump (Unlimited, Claude-Oriented)\n\n")
        out.write("## Context\n")
        out.write(f"- **Root path:** `{root.resolve()}`\n")
        out.write("- **Policy:** No truncation, full content preserved\n")
        out.write("- **Note:** Claude may still selectively load content due to context limits\n\n")

        # -------- DIRECTORY TREE --------
        out.write("## Directory Tree\n\n")
        out.write("```text\n")
        for path in sorted(root.rglob("*")):
            if should_exclude(path, root):
                continue
            out.write(f"{path.relative_to(root)}\n")
        out.write("```\n\n")

        # -------- FILE CONTENTS --------
        out.write("## Files\n\n")

        for path in sorted(root.rglob("*")):
            if should_exclude(path, root):
                continue

            if not path.is_file():
                continue

            if not is_text_file(path):
                continue

            rel = path.relative_to(root)
            lang = code_language(path.suffix)

            out.write(f"### `{rel}`\n\n")
            out.write(f"- **Size:** {path.stat().st_size} bytes\n")
            out.write(f"- **Extension:** `{path.suffix}`\n\n")

            try:
                lines = path.read_text(
                    encoding="utf-8",
                    errors="replace"
                ).splitlines()

                content = smart_truncate(lines)

                out.write("```" + lang + "\n")
                out.write("\n".join(content))
                out.write("\n```\n\n")

            except Exception as e:
                out.write(f"> ❌ Error reading file: `{e}`\n\n")

        out.write("---\n")
        out.write("_End of dump_\n")


# =========================
# ENTRY POINT
# =========================

if __name__ == "__main__":
    dump_markdown_for_llm(ROOT_DIR, Path(OUTPUT_FILE))
    print(f"Markdown export completed → {OUTPUT_FILE}")
```

---
_End of dump_
