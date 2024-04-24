# FreeIPA extensions : Picture widget & user's jpegPhoto plugins

**Note:** the plugins are developed, tested and used with FreeIPA version `4.8` and `4.10`.


## Introduction

On a FreeIPA directory, you can have some attributes to store images.
Typically the `jpegphoto` attribute can be used for the user avatars.

But the webUI doesn't have a widget designed for this type of binary element...
By default you can only use a `textarea` widget to edit the base64 encoded data.

The FreeIPA web interface is written with a Javascript framework
that can be extended by plugins to provide some additional elements.


## How it works

The file `widget_picture.js` define a new type of widget for the FreeIPA webUI.

It is designed to work with attributes containing binary data of a picture (Jpeg, PNG...).

If offers a suitable interface to edit image with:

-	An image HTML tag to display the current data (read-only mode or preview for edit)
-	An file input HTML tag to select a local image file to upload into the attribute


## Installation

To install, clone this repository or download and extract an archive on the IPA server.
You can use the shell script `./ipa-plugins-installer.sh` to install the plugins:
```
Usage: ./ipa-plugins-installer.sh <plugin...|--all> [--reload|--no-reload]
  -a, --all         :  Install all available plugins
  -r, --reload      :  Force the FreeIPA services reload
  -R, --no-reload   :  Disable the FreeIPA services reload
  -h, --help        :  Display this help message

Available plugins: user_jpegphoto widget_picture
```
So you can just run this command:
```
./ipa-plugins-installer.sh --all
```

If you only want to install the Javascript widget to manage picture fields in the UI,
without the extension to use the `jpegphoto` attribute (CLI & webUI) on users objects:
```
./ipa-plugins-installer.sh widget_picture --reload
```

**Note:** By default (without `--reload|--no-reload`) the "reload" actions are automatic:
running `apachectl graceful` if the Python script was installed/updated.


## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (AGPL).

