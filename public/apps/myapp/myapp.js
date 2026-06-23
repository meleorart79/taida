/* MyApp
 * Description of what this app does.
 */

// ── Entry point called by taida_startmenu_add or taida_upon_file_open ────────

function myapp_open(filename) {
    // filename is undefined when launched from start menu
    // filename is a path string when opened via file handler

    var content =
        '<div class="myapp">' +
        '</div>';

    var app_window = $(content).taida_window({
        header: 'My App',
        icon: '/apps/myapp/icon.png',
        width: 800,
        height: 500,
        resize: function () { myapp_resize(app_window); },
        close: function () { return myapp_close(app_window); }
    });

    app_window.open();

    if (filename != undefined) {
        myapp_load(app_window, filename);
    }
}

// ── Internal functions ────────────────────────────────────────────────────────

function myapp_load(app_window, filename) {
    taida_file_open(filename, function (content) {
        app_window.find('div.myapp').text(content);
        app_window.set_header(filename);
    }, function (status) {
        taida_alert('Failed to open file: ' + status, 'Error');
    });
}

function myapp_resize(app_window) {
    // Called on window resize — recalculate layout here if needed
}

function myapp_close(app_window) {
    // Return false to cancel close (e.g. unsaved changes prompt)
    return true;
}

// ── Registration ──────────────────────────────────────────────────────────────

$(document).ready(function () {
    // Add to start menu
    taida_startmenu_add('My App', '/apps/myapp/icon.png', myapp_open);

    // Handle .xyz files (optional — omit if app doesn't open files)
    taida_upon_file_open('xyz', myapp_open, '/apps/myapp/icon.png');
});