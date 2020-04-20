import { execSync } from "child_process";

const St = imports.gi.St;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;

// const IndicatorName = "ThemeSwitcher";
const DarkIcon = "dark-icon";
const LightIcon = "light-icon";
// const DarkIcon = "dark-black";
// const LightIcon = "light-black";

let button, icon;

function set_dark() {
    execSync(
        "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-maia-dark'"
    );
    execSync(
        "dconf write /org/gnome/shell/extensions/user-theme/name \"'Adwaita-maia-dark'\""
    );
    Main.notify(_("Switched to Dark Theme"));
}

function set_light() {
    execSync(
        "gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-maia'"
    );
    execSync(
        "dconf write /org/gnome/shell/extensions/user-theme/name \"'Adwaita-maia'\""
    );
    Main.notify(_("Switched to Light Theme"));
}

function toggle_theme() {
    let variant = execSync(
        "gsettings get org.gnome.desktop.interface gtk-theme"
    )
        .toString("UTF-8")
        .split("'")[1];
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
    time = today.getHours() + ":" + today.getMinutes();
    var sunrise = execSync("hdate -s | grep rise | cut -f 2 -d ' '")
        .toString("UTF-8")
        .slice(0, 5);
    var sunset = execSync("hdate -s | grep set | cut -f 2 -d ' '")
        .toString("UTF-8")
        .slice(0, 5);
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
        icon = new St.Icon({ style_class: "light-icon" });
    } else {
        icon = new St.Icon({ style_class: "dark-icon" });
    }
    button.set_child(icon);

    button.connect("button-press-event", function () {
        if (toggle_theme()) {
            icon = new St.Icon({ style_class: "dark-icon" });
        } else {
            icon = new St.Icon({ style_class: "light-icon" });
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
