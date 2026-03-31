# 🚀 Neu Framework (Vite + Capacitor + Vanilla JS)

**Neu** is an ultra-lightweight and modular framework specifically designed for building high-performance Android/iOS applications using **Vanilla JavaScript**. By leveraging the power of **Vite** for lightning-fast development and **Capacitor** for seamless native feature access, Neu provides a "zero-overhead" mobile development experience.

---

## 🛠️ Tech Stack & Version Reference (Pinned)

To ensure maximum stability for Android builds, Neu locks the following versions to prevent library conflicts:


| Component | Version | Note |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` (LTS) | Recommended: `nvm use 20` |
| **Java (JDK)** | `17` | Required for Gradle & Android Studio |
| **Vite** | `7.2.4` | Fast & Modern Bundler |
| **Capacitor** | `7.4.5` | Unified CLI, Core, & Android Platform |
| **Gradle** | `8.10.2` | Auto-locked via Gradle Wrapper |

---

## ⚡ Quick Start (Neu Installer)

Neu comes with a dedicated **Executable Installer** to automate your project's initial configuration and boilerplate setup.

### 1. Prerequisites
Ensure your system has the following installed:
*   [Node.js v20+](https://nodejs.org)
*   [Java JDK 17](https://oracle.com)
*   Android Studio (for APK building)

### 2. Run Neu Installer
1. Download the **Neu Installer (.exe)** from the [Releases](https://github.com) section.
2. Run the `.exe` file in your desired project directory.
3. Follow the prompts (Project Name, Package Name, etc.).
4. The installer will automatically:
    - Scaffold the modular folder structure.
    - Pin all library versions.
    - Configure **Path Aliases** (`@app`, `@pages`).
    - Sync the Android platform and lock the Gradle version.

---

## 📂 Project Structure

Neu uses a clean, modular structure to keep your codebase scalable and maintainable:

```text
src/
├── app/            # Core logic & global modules
│   ├── modules/    # Reusable business logic
│   └── style/      # Global CSS / Theming
├── pages/          # App views & page controllers
├── plugins/        # Capacitor Plugin integrations (Camera, Storage, etc.)
├── slots/          # Reusable UI Components
└── main.js         # Main application entry point
```

## 🚀 Development Workflow
Once your project is ready, use the following terminal commands:

*   **Web Dev Mode**: `npm run dev` (Open `localhost:5173`)
*   **Sync Android**: `npm run neu` (Update web code to Android folder)
*   **Build & Open IDE**: `npm run sdk` (Build web, sync, and launch Android Studio)
*   **Preview Build**: `npm run preview`

---

## ✨ Key Features
- **Zero Framework Overhead**: No React/Vue/Angular bloat, resulting in tiny APK sizes and instant app boot times.
- **Smart Pathing**: Cleaner imports using `@app` or `@pages` aliases.
- **Modular by Design**: A folder structure designed for long-term scalability.
- **Gradle Locked**: Guaranteed smooth compilation in Android Studio by eliminating version mismatches.

---

## 🤝 Contribution
Feedback and contributions are highly welcome! Feel free to open an **issue** or submit a **pull request** to help make Neu even better.

**Best Regard @neufa by Ulywae**
