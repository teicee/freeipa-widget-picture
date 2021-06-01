# FreeIPA extensions : Widget Picture with User JpegPhoto plugins


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

*	An image HTML tag to display the current data (read-only mode or preview for edit)
*	An file input HTML tag to select a local image file to upload into the attribute


## Installation

You can use the shell script `./ipa-plugins-installer.sh` to install the FreeIPA plugins.

If you only want to install the Javascript widget to manage picture fields in the UI:
```
./ipa-plugins-installer.sh widget_picture --reload
```

Or if you want to install all plugins provided, including the use of the `jpegphoto` attribute on users:
```
./ipa-plugins-installer.sh --all --reload
```

Note: the plugins are developed, tested and used with FreeIPA version 4.8.


## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (AGPL).

