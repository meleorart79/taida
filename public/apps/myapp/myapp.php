<?php
namespace Taida;

class myapp extends taida_backend {

    // Handle GET /myapp/<params>
    public function get() {
        // $this->parameters — array of URL path segments after /myapp/
        // $this->get_filename — resolved home directory path
        // $this->username — current user

        $this->view->add_tag('result', 'ok');
    }

    // Handle POST /myapp/<params>
    public function post() {
        if (is_true(READ_ONLY)) {
            $this->view->return_error(403);
            return;
        }

        $value = $_POST['value'] ?? null;
        if ($value === null) {
            $this->view->return_error(400);
            return;
        }

        $this->view->add_tag('result', $value);
    }
}
?>