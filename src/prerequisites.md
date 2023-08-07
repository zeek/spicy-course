# Prerequisites

To follow this course, installing recent versions of Zeek and Spicy  is required
(at least zeek-6.0 and spicy-1.8). The [Zeek
documentation](https://docs.zeek.org/en/master/install.html) shows the different
ways Zeek can be installed.

In addition we require:

- a text editor to write Spicy code
- a C++ compiler to compile Spicy code and Zeek plugins
- CMake for developing Zeek plugins with Spicy
- development headers for `libpcap` to compile Zeek plugins

## Docker images

The Zeek project [provides Docker
images](https://docs.zeek.org/en/master/install.html#docker-images).

## Zeek playground

A simplified approach for experimentation is to use the [Zeek playground
repository](https://github.com/bbannier/zeek-playground) which offers an
environment integrated with [Visual Studio
Code](https://code.visualstudio.com). Either clone the project and open it
locally in Visual Studio Code and install the recommended plugins, or open it
directly in a Github Codespace from the Github repository view.
