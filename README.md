<img src="src/renderer/assets/MinimalADB_White_Small.png" style="height: 50px"/>

---

**MinimalADB** is a modern, user-friendly GUI for interacting with Android devices via **ADB (Android Debug Bridge)**. Designed with Microsoft's [Fluent UI](https://developer.microsoft.com/en-us/fluentui#/) principles, it provides an intuitive interface for **device detection, rebooting into recovery, flashing ROMs, and executing custom ADB commands**.

This project is a **modernised version of [yadev64/GMADB](https://github.com/yadev64/GMADB)**, bringing an updated UI and improved usability for flashing and managing Android devices.

## Features

✅ **Device Management** – Easily check connected ADB devices.  
✅ **Recovery Mode** – Reboot into recovery mode with one click.  
✅ **ROM Flashing** – Select and sideload a ROM zip file effortlessly.  
✅ **Custom Commands** – Execute any ADB command directly from the GUI.  
✅ **Fluent UI Design** – A sleek and dark-themed interface built for modern Windows environments.  

<br />
<br />

![Windows Dark](docs/windows-dark.png)

<br />

---

<br />

## 📅 Roadmap
### 🔜 Short-Term Goals
* Improved Logging & Output – Enhance command execution logs for better debugging.
* Device Info Panel – Display detailed information about connected devices.
* Improved Theming - Add support for Windows 10 devices unable to use the `mica` material.
* APK File Managment - Add support for APK installation, deletion and extraction.

### 🚀 Mid-Term Goals
* File Explorer Integration – Browse device storage directly from the UI.
* Persistent Settings – Remember last-used configurations and settings.
* Multi-Device Support – Handle multiple devices connected simultaneously.
* Fastboot Mode Integration – Extend support for fastboot commands.
* Theme Customisation – Light mode and custom themes.

### 🌟 Long-Term Goals
* Wireless ADB Support – Enable easy setup and management of wireless ADB connections.
* Cross-Platform Support – Explore Linux/macOS support.
* Scrpy Integration - Capture Videos and Screenshots from device(s).

<br />

---

<br />

## 🛠️ Development

-   Install dependencies

    ```
    yarn install
    ```

-   Run app in dev mode

    ```
    yarn run dev
    ```

-   Lint files

    ```
    yarn run lint
    ```

-   Perform typecheck

    ```
    yarn run typecheck
    ```

-   Run Prettier
  
    ```
    yarn run prettier
    ```

-   Run tests

    ```
    yarn run test
    ```

-   Build and package app

    ```
    yarn run build && yarn run package
    ```

<br />

---

<br />

## 🏗 Contributions & Suggestions
Have a feature request or want to contribute? Open an [issue](https://github.com/beecho01/MinimalADB/issues) or submit a pull request!
