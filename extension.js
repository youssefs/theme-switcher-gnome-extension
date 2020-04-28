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
    "'Adwaita-maia'",
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
    class ThemeSwitcher extends PanelMenu.Button {
        constructor() {
            super._init(0.0, "Theme Switcher");

            let box = new St.BoxLayout();
            let icon = new St.Icon({ style_class: "system-status-icon" });
            box.add(icon);
            this.actor.add_child(box);

            if (this.isDay()) {
                // this.icon = new St.Icon({ style_class: "system-status-icon" });
                // this.icon.gicon = Gio.icon_new_for_string(
                //     Me.path + "/" + LightIcon
                // );
                this.setIcon(LightIcon);
                this.setLight();
                this.state = false;
            } else {
                // this.icon = new St.Icon({ style_class: "system-status-icon" });
                // this.icon.gicon = Gio.icon_new_for_string(
                //     Me.path + "/" + DarkIcon
                // );
                this.setIcon(DarkIcon);
                this.setDark();
                this.state = true;
            }
            container.add_actor(this.icon);

            this.connect("button-press-event", function () {
                if (this.toggleTheme()) {
                    // this.icon = new St.Icon({
                    //     style_class: "system-status-icon",
                    // });
                    // this.icon.gicon = Gio.icon_new_for_string(
                    //     Me.path + "/" + DarkIcon
                    // );
                    this.setIcon(DarkIcon);
                } else {
                    // this.icon = new St.Icon({
                    //     style_class: "system-status-icon",
                    // });
                    // this.icon.gicon = Gio.icon_new_for_string(
                    //     Me.path + "/" + LightIcon
                    // );
                    this.setIcon(LightIcon);
                }
                this.set_child(this.icon);
            });
        }

        cmd(cmd) {
            let stdout = GLib.spawn_sync(
                null,
                cmd,
                null,
                GLib.SpawnFlags.SEARCH_PATH,
                null
            )[1].toString();
            return stdout;
        }

        setIcon(icon_file) {
            // this.icon = new St.Icon({ style_class: "system-status-icon" });
            icon.gicon = Gio.icon_new_for_string(Me.path + "/" + icon_file);
        }

        setDark() {
            this.cmd(dark_theme);
            this.cmd(dark_shell_theme);
            this.state = true;
        }

        setLight() {
            this.cmd(light_theme);
            this.cmd(light_shell_theme);
            this.state = false;
        }

        toggleTheme() {
            let variant = this.cmd(current_theme);
            if (variant.includes("dark")) {
                this.setLight();
                return false;
            } else {
                this.setDark();
                return true;
            }
        }

        isDay() {
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes();
            var splits = this.cmd(["hdate", "-s"]).split(":");
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

function init() {
    // button = new St.Bin({
    //     style_class: "panel-button",
    //     reactive: true,
    //     can_focus: true,
    //     x_fill: true,
    //     y_fill: false,
    //     track_hover: true,
    // });
    // if (is_day()) {
    //     icon = new St.Icon({ style_class: "system-status-icon" });
    //     icon.gicon = Gio.icon_new_for_string(Me.path + "/" + LightIcon);
    //     set_light();
    //     state = false;
    // } else {
    //     icon = new St.Icon({ style_class: "system-status-icon" });
    //     icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
    //     set_dark();
    //     state = true;
    // }
    // button.set_child(icon);
    // button.connect("button-press-event", function () {
    //     if (toggle_theme()) {
    //         icon = new St.Icon({ style_class: "system-status-icon" });
    //         icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
    //     } else {
    //         icon = new St.Icon({ style_class: "system-status-icon" });
    //         icon.gicon = Gio.icon_new_for_string(Me.path + "/" + LightIcon);
    //     }
    //     button.set_child(icon);
    // });
}

function enable() {
    button = new ThemeSwitcher();
    Main.panel.addToStatusArea("theme-switcher", button, 0, "right");
    // Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    // Main.panel._rightBox.remove_child(button);
    button.destroy();
}
