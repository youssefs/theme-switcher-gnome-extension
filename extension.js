const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Convenience = Me.imports.convenience;
const PrefKeys = Me.imports.pref_keys;
const config = Me.imports.config;
const Timers = Me.imports.timers;

const DarkIcon = "icons/dark-gray.svg";
const LightIcon = "icons/light-gray.svg";

let button;

const light_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    "''", // Default
];

const dark_shell_theme = [
    "dconf",
    "write",
    "/org/gnome/shell/extensions/user-theme/name",
    "'Yaru-dark'",
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
            this._themeSettings = new Gio.Settings({
                schema: config.THEME_GSETTINGS_SCHEMA,
            });

            this._bindSettings();
            this._loadSettings();

            if (this._auto_nightlight == true) {
                this._toggleOnNightLight();
                this._asyncNightlightDetecter();
            }
            this._setIcon();
            this.connect("button-press-event", this._toggleTheme.bind(this));
        }

        get currentTheme() {
            return this._themeSettings.get_string(
                config.THEME_GSETTINGS_PROPERTY
            );
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

        _setIcon() {
            this.icon = new St.Icon({ style_class: "system-status-icon" });
            if (this._state == "dark") {
                this.icon.gicon = Gio.icon_new_for_string(
                    Me.path + "/" + DarkIcon
                );
            } else {
                this.icon.gicon = Gio.icon_new_for_string(
                    Me.path + "/" + LightIcon
                );
            }
            this.set_child(this.icon);
        }

        _setDark() {
            if (this._state == "light") {
                this._state = "dark";
                this._settings.set_string(PrefKeys.STATE, this._state);
                this._setIcon();
                this.currentTheme = this._base_theme + "-dark";
                this._cmd(dark_shell_theme);
            }
        }

        _setLight() {
            if (this._state == "dark") {
                this._state = "light";
                this._settings.set_string(PrefKeys.STATE, this._state);
                this._setIcon();
                this.currentTheme = this._base_theme;
                this._cmd(light_shell_theme);
            }
        }

        _toggleTheme() {
            Timers.clearInterval(this._timerID);
            this._auto_nightlight = false;
            this._settings.set_boolean(
                config.AUTO_NIGHTLIGHT,
                this._auto_nightlight
            );
            Main.notify("ALERT!", "Auto Night Light Detection Turned Off!");
            if (this._state == "dark") {
                this._setLight();
                // return false;
            } else {
                this._setDark();
                // return true;
            }
        }

        _addZerosToTime(hours, minutes) {
            if (hours.length != 2) {
                hours = "0" + hours;
            }
            if (minutes.length != 2) {
                minutes = "0" + minutes;
            }
            return hours + ":" + minutes;
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
            return this._addZerosToTime(
                t.get_hour().toString(),
                t.get_minute().toString()
            );
        }

        _isDay() {
            var dt = new GLib.DateTime();
            var time = this._addZerosToTime(
                dt.get_hour().toString(),
                dt.get_minute().toString()
            );
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

        _setNightlightTimer() {
            return new Promise((resolve) => {
                this._timerID = Timers.setInterval(() => {
                    this._toggleOnNightLight();
                }, 30000);
            });
        }

        async _asyncNightlightDetecter() {
            const result = await this._setNightlightTimer();
        }

        _toggleOnNightLight() {
            if (this._isDay()) {
                if (this._state == "dark") {
                    this._setLight();
                    return;
                }
            } else {
                if (this._state == "light") {
                    this._setDark();
                    return;
                }
            }
        }

        _loadSettings() {
            this._state = this._settings.get_string(PrefKeys.STATE);
            this._base_theme = this._settings.get_string(PrefKeys.BASE_THEME);
            this._auto_nightlight = this._settings.get_boolean(
                PrefKeys.AUTO_NIGHTLIGHT
            );
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
                this._state = this._settings.get_string(PrefKeys.STATE);
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
    button.destroy();
}
