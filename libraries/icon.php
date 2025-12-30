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
