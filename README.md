# Theme Switcher
A Gnome extension to toggle between Light and Dark themes.

Light: 

![alt text](media/theme-switcher-light.png)

Dark:

![alt text](media/theme-switcher-dark.png)

## Requirements
This extensions has three requirements:
- `gsettings` : for changing GTK theme.
- [User Themes Gnome Extension](https://extensions.gnome.org/extension/19/user-themes/) (Shell Theme)
- `dconf` : for changing shell theme.
- `hdate` : for Day/Night detection on login.

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

Usually hdate isn't installed by default. So you should install it on your system. If you have a Ubuntu Linux system you can execute
```bash
$ sudo apt install hdate
```
If not, you have to install from [source](https://sourceforge.net/projects/libhdate/).

### Instructions for `hdate` installation
1. Download the source code in `tar.bz2` format and extract it.
2. `cd` to the directory containing the package's source code and type
`./configure` to configure the package for your system. Running `configure` might take a while. While running, it prints
some messages telling which features it is checking for.

2. Type `make` to compile the package.

3. Optionally, type `make check` to run any self-tests that come with
the package, generally using the just-built uninstalled binaries.

4. Type `make install` to install the programs and any data files and
documentation.  When installing into a prefix owned by root, it is
recommended that the package be configured and built as a regular
user, and only the `make install` phase executed with root
privileges.

5. Optionally, type `make installcheck` to repeat any self-tests, but
this time using the binaries in their final installed location.
This target does not install anything. Running this target as a
regular user, particularly if the prior `make install` required
root privileges, verifies that the installation completed
correctly.

1. You can remove the program binaries and object files from the
source code directory by typing `make clean`. To also remove the
files that `configure` created (so you can compile the package for
a different kind of computer), type `make distclean`. There is
also a `make maintainer-clean` target, but that is intended mainly
for the package's developers. If you use it, you may have to get
all sorts of other programs in order to regenerate files that came
with the distribution.

6. Often, you can also type `make uninstall` to remove the installed files again. In practice, not all packages have tested that uninstallation works correctly, even though it is required by the GNU Coding Standards.

7. Some packages, particularly those that use Automake, provide `make distcheck`, which can by used by developers to test that all other targets like `make install` and `make uninstall` work correctly. This target is generally not run by end users.

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
Currently this version only switches between two static variants (light and dark) of one theme: `Yaru` the standard Ubuntu (20.04) theme.
In future versions, I will be adding the option to choose the base theme.

