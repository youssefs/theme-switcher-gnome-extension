const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const DarkIcon = "icons/dark-gray.svg";
const LightIcon = "icons/light-gray.svg";

// let button, icon, state;
let button;

const light_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    // "Adwaita-maia",
    "Yaru",
];
const light_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    // "'Adwaita-maia'",
    "'Default'",
];
const dark_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    // "Adwaita-maia-dark",
    "Yaru-dark",
];
const dark_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    // "'Adwaita-maia-dark'",
    "'Yaru-dark'",
];
const current_theme = [
    "gsettings",
    "get",
    "org.gnome.desktop.interface",
    "gtk-theme",
];

let ThemeSwitcher = GObject.registerClass(
    class ThemeSwitcher extends St.Bin {
        _init() {
            super._init({
                style_class: "panel-button",
                reactive: true,
                can_focus: true,
                x_fill: true,
                y_fill: false,
                track_hover: true,
            });

            if (this._isDay()) {
                // this._setIcon(LightIcon);
                this._setLight();
                this.state = false;
            } else {
                // this._setIcon(DarkIcon);
                this._setDark();
                this.state = true;
            }
            this.set_child(this.icon);

            this.connect("button-press-event", this._toggleTheme.bind(this));
        }

        _cmd(cmd) {
            let stdout = GLib.spawn_sync(
                null,
                cmd,
                null,
                GLib.SpawnFlags.SEARCH_PATH,
                null
            )[1].toString();
            return stdout;
        }

        _setIcon(icon_file) {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            this.icon.gicon = Gio.icon_new_for_string(
                Me.path + "/" + icon_file
            );
        }

        _setDark() {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            this.icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
            this.set_child(this.icon);
            this._cmd(dark_theme);
            this._cmd(dark_shell_theme);
            this.state = true;
        }

        _setLight() {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            this.icon.gicon = Gio.icon_new_for_string(
                Me.path + "/" + LightIcon
            );
            this.set_child(this.icon);
            this._cmd(light_theme);
            this._cmd(light_shell_theme);
            this.state = false;
        }

        _toggleTheme() {
            let variant = this._cmd(current_theme);
            if (variant.includes("dark")) {
                this._setLight();
                // this._setIcon(LightIcon);
                return false;
            } else {
                this._setDark();
                // this._setIcon(DarkIcon);
                return true;
            }
        }

        _isDay() {
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes();
            var splits = this._cmd(["hdate", "-s"]).split(":");
            // var sunrise = cmd(_cmd).slice(47, 53); // sunrise
            // var sunset = cmd(_cmd).slice(61, 67); // sunset
            var sunrise = (splits[1] + ":" + splits[2].split("\n")[0]).replace(
                /\s/g,
                ""
            );
            var sunset = (splits[3] + ":" + splits[4].split("\n")[0]).replace(
                /\s/g,
                ""
            );
            if (sunrise < time && time < sunset) {
                return true;
            } else {
                return false;
            }
        }
    }
);

function init() {}

function enable() {
    button = new ThemeSwitcher();
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
