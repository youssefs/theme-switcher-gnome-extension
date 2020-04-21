# Theme Switcher
A Gnome extension to toggle between Light and Dark themes

![alt text](media/theme-switcher.png)

## Requirements
This extensions has two requirements:
- `gsettings`
- `dconf`

`gsettings` comes with the gnome-shell installation. If you don't have the `dconf` insalled on your system you can install it using your default package manage:
- Ubuntu/Debian
    ```bash
    $ sudo apt install dconf
    ```
- Arch/Manjaro
    ```bash
    $ sudo pacman -S dconf
    ```
- Fedora
    ```bash
    $ sudo yum install dconf
    ```

## Installation
In a terminal:
1. Clone the git directory:

    ```bash
    $ git clone https://github.com/youssefs/theme-switcher
    ```

2. Go to the cloned directory:

    ```bash
    $ cd theme-switcher
    ```

3. Run the `install.sh` file:

    ```bash
    $ ./install.sh
    ```

4. Clean up:

    ```bash
    $ cd ..
    $ rm -r theme-switcher
    ```

## Limitations
Currently this version only switches between two static variatns (normal and dark) of one theme: `Adwaita-maia`.
In future versions, I will be adding the option to choose the base theme.

