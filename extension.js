"use strict";

const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Atk = imports.gi.Atk;
// const Mainloop = imports.mainloop;
// const Shell = imports.gi.Shell;
// const MessageTray = imports.ui.messageTray;
// const Config = imports.misc.config;

const SHOW_INDICATOR_KEY = "show-indicator";
const TO_DARK = "dark-gray";
const TO_LIGHT = "light-gray";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const execSync = require("child_process").execSync;
// import { execSync } from "child_process";

// const dark_mode = execSync(
//     "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark'"
// );
// const light_mode = execSync(
//     "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita'"
// );

const IndicatorName = "SwitchTheme";
const DarkIcon = "dark-gray";
const LightIcon = "light-gray";
// const DarkIcon = "dark-black";
// const LightIcon = "light-black";

const SwitchTheme = new Lang.Class({
    Name: IndicatorName,
    Extends: PanelMenu.Button,

    _init: function (metadata, params) {
        this.parent(null, IndicatorName);
        this.actor.accessible_role = Atk.Role.TOGGLE_BUTTON;

        this._settings = Convenience.getSettings();
        this._settings.connect(
            "changed::" + SHOW_INDICATOR_KEY,
            Lang.bind(this, function () {
                if (this._settings.get_boolean(SHOW_INDICATOR_KEY))
                    this.actor.show();
                else this.actor.hide();
            })
        );
        if (!this._settings.get_boolean(SHOW_INDICATOR_KEY)) {
            this.actor.hide();
        }
        // this._sessionManager = new DBusSessionManagerProxy(
        //     Gio.DBus.session,
        //     "org.gnome.SessionManager",
        //     "/org/gnome/SessionManager"
        // );

        // this._windowCreatedId = this._display.connect_after(
        //     "window-created",
        //     Lang.bind(this, this._mayInhibit)
        // );
        // let shellwm = global.window_manager;
        // this._windowDestroyedId = shellwm.connect(
        //     "destroy",
        //     Lang.bind(this, this._mayUninhibit)
        // );

        this._icon = new St.Icon({
            style_class: "system-status-icon",
        });
        this._icon.gicon = Gio.icon_new_for_string(
            Me.path + "/icons/" + LightIcon + ".png"
        );

        this._state = false; // light theme

        this.actor.add_actor(this._icon);
        this.actor.add_style_class_name("panel_status_button");
        this.actor.connect(
            "button-press-event",
            Lang.bind(this, this.toggleState)
        );
    },

    toggleState: function () {
        if (this._state) {
            // set light theme
            this._state = false;
            execSync(
                "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita'"
            );
            this._icon.gicon = Gio.icon_new_for_string(
                Me.path + "/icons/" + LightIcon + ".png"
            );
            Main.notify(_("Switched to Light Theme"));
        } else {
            // set dark theme
            this._state = true;
            execSync(
                "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark'"
            );
            this._icon.gicon = Gio.icon_new_for_string(
                Me.path + "/icons/" + DarkIcon + ".png"
            );
            Main.notify(_("Switched to Dark Theme"));
        }
    },

    destroy: function () {
        this.parent();
    },
});

function enable() {
    SwitchTheme = new SwitchTheme();
    Main.panel.addToStatusArea(IndicatorName, SwitchTheme);
}

function disable() {
    SwitchTheme.destroy();
    SwitchTheme = null;
}
