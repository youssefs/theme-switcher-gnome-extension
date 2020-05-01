const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Params = imports.misc.params;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PrefKeys = Me.imports.pref_keys;
const Convenience = Me.imports.convenience;

let PagePrefsGrid = GObject.registerClass(
    class PagePrefsGrid extends Gtk.Grid {
        _init(params) {
            // this.parent(params);
            super._init(params);

            this._settings = Convenience.getSettings();
            this.margin = this.row_spacing = this.column_spacing = 10;
        }

        add_entry(text, key) {
            let item = new Gtk.Entry({
                hexpand: false,
            });
            item.text = this._settings.get_string(key);
            this._settings.bind(
                key,
                item,
                "text",
                Gio.SettingsBindFlags.DEFAULT
            );

            return this.add_row(text, item);
        }

        add_shortcut(text, settings_key) {
            let item = new Gtk.Entry({
                hexpand: false,
            });
            item.set_text(this._settings.get_strv(settings_key)[0]);
            item.connect(
                "changed",
                Lang.bind(this, function (entry) {
                    let [key, mods] = Gtk.accelerator_parse(entry.get_text());

                    if (Gtk.accelerator_valid(key, mods)) {
                        let shortcut = Gtk.accelerator_name(key, mods);
                        this._settings.set_strv(settings_key, [shortcut]);
                    }
                })
            );

            return this.add_row(text, item);
        }

        add_boolean(text, key, callback) {
            let item = new Gtk.Switch({
                active: this._settings.get_boolean(key),
            });

            if (callback) {
                callback(item, this._settings.get_boolean(key));
            }

            this._settings.bind(
                key,
                item,
                "active",
                Gio.SettingsBindFlags.DEFAULT
            );
            return this.add_row(text, item);
        }

        add_combo(text, key, list, type) {
            let item = new Gtk.ComboBoxText();

            for (let i = 0; i < list.length; i++) {
                let title = list[i].title.trim();
                let id = list[i].value.toString();
                item.insert(-1, id, title);
            }

            if (type === "string") {
                item.set_active_id(this._settings.get_string(key));
            } else {
                item.set_active_id(this._settings.get_int(key).toString());
            }

            item.connect(
                "changed",
                Lang.bind(this, function (combo) {
                    let value = combo.get_active_id();

                    if (type === "string") {
                        if (this._settings.get_string(key) !== value) {
                            this._settings.set_string(key, value);
                        }
                    } else {
                        value = parseInt(value, 10);

                        if (this._settings.get_int(key) !== value) {
                            this._settings.set_int(key, value);
                        }
                    }
                })
            );

            return this.add_row(text, item);
        }

        add_spin(label, key, adjustment_properties, spin_properties) {
            adjustment_properties = Params.parse(adjustment_properties, {
                lower: 0,
                upper: 100,
                step_increment: 100,
            });
            let adjustment = new Gtk.Adjustment(adjustment_properties);

            spin_properties = Params.parse(
                spin_properties,
                {
                    adjustment: adjustment,
                    numeric: true,
                    digits: 4,
                    snap_to_ticks: true,
                },
                true
            );
            let spin_button = new Gtk.SpinButton(spin_properties);

            spin_button.set_value(this._settings.get_double(key));
            spin_button.connect(
                "value-changed",
                Lang.bind(this, function (spin) {
                    let value = spin.get_value();

                    if (this._settings.get_double(key) !== value) {
                        this._settings.set_double(key, value);
                    }
                })
            );

            this._settings.connect(
                "change-event",
                Lang.bind(this, function (settings, key_set) {
                    spin_button.set_value(this._settings.get_double(key));
                })
            );

            return this.add_row(label, spin_button, true);
        }

        add_row(text, widget, wrap) {
            let label = new Gtk.Label({
                label: text,
                hexpand: true,
                halign: Gtk.Align.START,
            });
            label.set_line_wrap(wrap || false);

            this.attach(label, 0, this._rownum, 1, 1); // col, row, colspan, rowspan
            this.attach(widget, 1, this._rownum, 1, 1);
            this._rownum++;

            return widget;
        }

        add_item(widget, col, colspan, rowspan) {
            this.attach(
                widget,
                col || 0,
                this._rownum,
                colspan || 2,
                rowspan || 1
            );
            this._rownum++;

            return widget;
        }

        add_range(label, key, range_properties) {
            range_properties = Params.parse(range_properties, {
                min: 0,
                max: 100,
                step: 10,
                mark_position: 0,
                add_mark: false,
                size: 200,
                draw_value: true,
            });

            let range = Gtk.Scale.new_with_range(
                Gtk.Orientation.HORIZONTAL,
                range_properties.min,
                range_properties.max,
                range_properties.step
            );
            range.set_value(this._settings.get_int(key));
            range.set_draw_value(range_properties.draw_value);

            if (range_properties.add_mark) {
                range.add_mark(
                    range_properties.mark_position,
                    Gtk.PositionType.BOTTOM,
                    null
                );
            }

            range.set_size_request(range_properties.size, -1);

            range.connect(
                "value-changed",
                Lang.bind(this, function (slider) {
                    this._settings.set_int(key, slider.get_value());
                })
            );

            return this.add_row(label, range, true);
        }
    }
);

let ThemeSwitcherPrefsWidget = GObject.registerClass(
    class ThemeSwitcherPrefsWidget extends Gtk.Box {
        _init(params) {
            // this.parent(params);
            super._init(params);
            this.set_orientation(Gtk.Orientation.VERTICAL);

            this._settings = Convenience.getSettings();
            let stack = new Gtk.Stack({
                transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
                transition_duration: 200,
            });

            let stack_switcher = new Gtk.StackSwitcher({
                margin_left: 5,
                margin_top: 5,
                margin_bottom: 5,
                margin_right: 5,
                stack: stack,
            });

            this._init_stack(stack);
            this.add(stack_switcher);
            this.add(stack);
        }

        _getTabConfig() {
            let nightlight_page = new PagePrefsGrid();
            nightlight_page.add_boolean(
                "Auto Detect Night Light",
                PrefKeys.AUTO_NIGHTLIGHT
            );

            let themepicker_page = new PagePrefsGrid();
            themepicker_page.add_combo(
                "Base Theme",
                PrefKeys.BASE_THEME,
                [
                    { title: "Yaru", value: "Yaru" },
                    { title: "Adwaita-maia", value: "Adwaita-maia" },
                ],
                "string"
            );

            let pages = [
                {
                    name: "Night Light",
                    page: nightlight_page,
                },
                {
                    name: "Theme Picker",
                    page: themepicker_page,
                },
            ];

            return pages;
        }

        _init_stack(stack) {
            let config = this._getTabConfig();
            for (let index in config) {
                stack.add_titled(
                    config[index].page,
                    config[index].name,
                    config[index].name
                );
            }
        }
    }
);

function init() {}

function buildPrefsWidget() {
    let widget = new ThemeSwitcherPrefsWidget();
    widget.show_all();

    return widget;
}
