const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Convenience = Me.imports.convenience;
const PrefKeys = Me.imports.pref_keys;
const config = Me.imports.config;

const DarkIcon = "icons/dark-gray.svg";
const LightIcon = "icons/light-gray.svg";

let button;

const light_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    "Yaru",
];
const light_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    "'Default'",
];
const dark_theme = [
    "gsettings",
    "set",
    "org.gnome.desktop.interface",
    "gtk-theme",
    "Yaru-dark",
];
const dark_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
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

            this._settings = Convenience.getSettings();
            this._themeSettings = Gio.Settings({
                schema: config.THEME_GSETTINGS_SCHEMA,
            });

            if (this._isDay()) {
                this._setLight();
            } else {
                this._setDark();
            }
            this.set_child(this.icon);

            this.connect("button-press-event", this._toggleTheme.bind(this));
        }

        get currentTheme() {
            return this._themeSettings
                .get_string(config.THEME_GSETTINGS_PROPERTY)
                .split("-")[0];
        }

        set currentTheme(themeVar) {
            if (themeVar != this.currentTheme) {
                this._themeSettings.set_string(
                    config.THEME_GSETTINGS_PROPERTY,
                    themeVar
                );
            }
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

        _setDark() {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            this.icon.gicon = Gio.icon_new_for_string(Me.path + "/" + DarkIcon);
            this.set_child(this.icon);
            this._themeSettings.set_string(
                config.THEME_GSETTINGS_PROPERTY,
                PrefKeys.BASE_THEME + "-dark"
            );
            this._cmd(dark_theme);
            this._cmd(dark_shell_theme);
            this._state = "dark";
        }

        _setLight() {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            this.icon.gicon = Gio.icon_new_for_string(
                Me.path + "/" + LightIcon
            );
            this.set_child(this.icon);
            this._themeSettings.set_string(
                config.THEME_GSETTINGS_PROPERTY,
                PrefKeys.BASE_THEME
            );
            this._cmd(light_theme);
            this._cmd(light_shell_theme);
            this._state = "light";
            this._settings.set_boolean(PrefKeys.STATE, this._state);
        }

        _toggleTheme() {
            Timers.clear_interval(this._timerID);
            let variant = this._cmd(current_theme);
            if (variant.includes("dark")) {
                this._setLight();
                return false;
            } else {
                this._setDark();
                return true;
            }
        }

        _addDST(time_str) {
            var t = GLib.DateTime.new(
                GLib.TimeZone.new_local(),
                1970,
                1,
                1,
                Number(time_str.split(":")[0]),
                Number(time_str.split(":")[1]),
                0
            );
            t = t.add_hours(1);
            var h = t.get_hour().toString();
            var m = t.get_minute().toString();
            if (h.length != 2) {
                h = "0" + h;
            }
            if (m.length != 2) {
                m = "0" + m;
            }
            return h + ":" + m;
        }

        _isDay() {
            var today = new Date();
            var dt = new GLib.DateTime();
            var time = today.getHours() + ":" + today.getMinutes();
            var splits = this._cmd(["hdate", "-s", "-T"]).split("\n");
            var sunrise = splits[2].split(",")[2];
            var sunset = splits[2].split(",")[3];
            if (dt.is_daylight_savings()) {
                sunrise = this._addDST(sunrise);
                sunset = this._addDST(sunset);
            }
            if (sunrise < time && time < sunset) {
                return true;
            } else {
                return false;
            }
        }

        _toggleOnNightLight() {
            if (!this._isDay()) {
                if (this._state == "light") {
                    this._setDark();
                    return;
                }
            } else {
                if (this._state == "dark") {
                    this._setLight();
                    return;
                }
            }
        }

        _setNightlightTimer() {
            return new Promise((resolve) => {
                this._timerID = Timers.setInterval(
                    _toggleOnNightLight(),
                    900000 // 15 minutes
                );
            });
        }

        async _asyncNightlightDetecter() {
            const result = await this._setNightlightTimer();
        }

        _loadSettings() {
            this._state = this._settings.get_string(PrefKeys.STATE);
            this._base_theme = this._settings.get_string(PrefKeys.BASE_THEME);
            this._auto_nightlight = this.get_boolean(PrefKeys.AUTO_NIGHTLIGHT);
        }

        _bindSettings() {
            this._settings.connect(
                "changed::" + PrefKeys.AUTO_NIGHTLIGHT,
                () => {
                    this._auto_nightlight = this._settings.get_boolean(
                        PrefKeys.AUTO_NIGHTLIGHT
                    );
                    if (this._auto_nightlight) {
                        this._toggleOnNightLight();
                        this._asyncNightlightDetecter();
                    }
                }
            );
            this._settings.connect("changed::" + PrefKeys.BASE_THEME, () => {
                this._base_theme = this._settings.get_string(
                    PrefKeys.BASE_THEME
                );
            });
            this._settings.connect("changed::" + PrefKeys.STATE, () => {
                this._state = this._settings.get_string(PrefKeys._state);
            });
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
