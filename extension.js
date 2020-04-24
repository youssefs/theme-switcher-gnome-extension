const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;

const DarkIcon = "icons/dark-gray.svg";
const LightIcon = "icons/light-gray.svg";

let button, icon, state;

const light_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    "Adwaita-maia",
];
const light_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    "'Adwaita-maia'",
];
const dark_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    "Adwaita-maia-dark",
];
const dark_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    "'Adwaita-maia-dark'",
];
const current_theme = [
    "gsettings",
    "get",
    "org.gnome.desktop.interface",
    "gtk-theme",
];

function cmd(cmd) {
    let stdout = GLib.spawn_sync(
        null,
        cmd,
        null,
        GLib.SpawnFlags.SEARCH_PATH,
        null
    )[1].toString();
    return stdout;
}

function set_dark() {
    cmd(dark_theme);
    cmd(dark_shell_theme);
    state = true;
}

function set_light() {
    cmd(light_theme);
    cmd(light_shell_theme);
    state = false;
}

function toggle_theme() {
    let variant = cmd(current_theme);
    if (variant.includes("dark")) {
        set_light();
        return false;
    } else {
        set_dark();
        return true;
    }
}

function is_day() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    var _cmd = ["hdate", "-s"];
    var sunrise = cmd(_cmd).slice(47, 53); // sunrise
    var sunset = cmd(_cmd).slice(61, 67); // sunset
    if (sunrise < time && time < sunset) {
        return true;
    } else {
        return false;
    }
}

function init() {
    button = new St.Bin({
        style_class: "panel-button",
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true,
    });

    if (is_day()) {
        icon = new St.Icon({ style_class: "system-status-icon" });
        icon.gicon = Gio.icon_new_for_string(Me.path + "/" + LightIcon);
        set_light();
        state = false;
    } else {
        icon = new St.Icon({ style_class: "system-status-icon" });
        icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
        set_dark();
        state = true;
    }
    button.set_child(icon);

    button.connect("button-press-event", function () {
        if (toggle_theme()) {
            icon = new St.Icon({ style_class: "system-status-icon" });
            icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
        } else {
            icon = new St.Icon({ style_class: "system-status-icon" });
            icon.gicon = Gio.icon_new_for_string(Me.path + "/" + LightIcon);
        }
        button.set_child(icon);
    });
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
