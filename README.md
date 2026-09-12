# ⚡ IIT Kharagpur ERP Feedback Automator

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension%20MV3-blue.svg?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![Made for IIT KGP](https://img.shields.io/badge/Made%20for-IIT%20Kharagpur-orange.svg)](https://erp.iitkgp.ac.in/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)]()

A fast, lightweight, and open-source Google Chrome extension designed specifically for the **IIT Kharagpur ERP Portal (`https://erp.iitkgp.ac.in/`)**. It automates the tedious process of clicking dozens of rating radio buttons and typing repetitive 10+ word feedback comments for every course and professor with **custom sentiment control (Good 😊, Neutral 😐, or Critical 🙁)**!

---

## 🎯 Why Use This?

Every mid-term and end-term semester at IIT Kharagpur, students are required to submit feedback for every registered course and professor before downloading their admit card:
* 🥱 **100+ manual clicks** across multiple subjects and instructors.
* ✍️ **Mandatory "Minimum : 10 words"** requirement on all descriptive comment fields.
* 🔄 **Fragile ERP pages** where accidental clicks can reset form progress.

This extension lets you give honest, customized feedback (**Good, Neutral, or Critical**) in **1 click per instructor**!

---

## ✨ Features

- 🎭 **Custom Sentiment Options**:
  - 🟢 **😊 Good / Excellent**: Top ratings (*Strongly Agree / Excellent / 5 / Optimum*) and 10+ word praising comments.
  - 🟡 **😐 Neutral / Average**: Balanced ratings (*Agree / Neutral / Satisfactory / 3 or 4*) and constructive suggestions.
  - 🔴 **🙁 Critical / Poor**: Low ratings (*Disagree / Strongly Disagree / Poor / 1 or 2*) and structured criticism for improvement.
- 📌 **Top Floating Toolbar**: Convenient draggable capsule at the top of the page with 1-click **[ 😊 Good ]**, **[ 😐 Neutral ]**, and **[ 🙁 Critical ]** buttons.
- ✍️ **10+ Word Compliant Comments**: Populates unique, structured responses to satisfy ERP's minimum word validation.
- 🛡️ **Flicker-Free Navigation Guard**: Specifically isolates question fields and ignores Subject and Faculty selector radios, preventing annoying ERP screen resets.
- 🎯 **Auto-Focus Captcha**: Automatically scrolls down and places your keyboard cursor right into the `Enter Captcha` box so all you have to do is type the captcha and press Submit.
- 🔒 **100% Private & Client-Side**: Zero telemetry, zero external network requests, zero data storage. Runs purely in your local browser.

---

## 🚀 30-Second Quick Installation Guide

No build tools or Node.js required! You can install it directly into Google Chrome in under 30 seconds:

### Step 1: Download the Repository
1. Click the green **Code** button at the top of this GitHub page.
2. Click **Download ZIP**.
3. Extract the downloaded `.zip` folder to a convenient location on your computer (e.g., `Documents` or `Desktop`).

> Alternatively, if you have Git installed:
> ```bash
> git clone https://github.com/change-kgp/erp-feedback-automator.git
> ```

### Step 2: Load into Google Chrome
1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
2. In the top-right corner, toggle **Developer mode** to **ON**.
3. In the top-left corner, click **Load unpacked**.
4. Select the extracted folder containing `manifest.json`.

*(Optional: Click the **Puzzle icon** in your Chrome top bar and pin 📌 **IITKGP ERP Feedback Automator** for quick access).*

---

## 📖 How to Use on ERP

1. Log into the **[IIT Kharagpur ERP Portal](https://erp.iitkgp.ac.in/)**.
2. Go to **Academic** &rarr; **Feedback** &rarr; **Feedback Form**.
3. Select your **Subject Code** (e.g., `CS10001`, `NA60003`).
4. Click on the **Faculty / Professor Name** to load their feedback table.
5. In the top floating toolbar (or Chrome extension popup), click your desired rating mood:
   - **😊 Good**
   - **😐 Neutral**
   - **🙁 Critical**
6. All question ratings and 10+ word feedback comments will be filled according to your chosen mood, and your cursor will be automatically focused in the **Enter Captcha** box.
7. Type the visual captcha and click **Submit**!
8. Repeat for each faculty and subject.

---

## 🛠️ Project Structure

```text
erp-feedback-automator/
├── manifest.json      # Chrome Manifest V3 configuration
├── content.js         # In-page multi-sentiment engine & top floating toolbar
├── popup.html         # Extension toolbar popup interface
├── popup.js           # Toolbar sentiment selector
├── icons/             # Extension icon assets (16x16, 48x48, 128x128)
├── .gitignore         # Git ignore rules
├── LICENSE            # MIT License
└── README.md          # Documentation & setup guide
```

---

## 🔒 Privacy & Permissions

This extension asks only for permissions required to autofill feedback fields on the ERP domain:
- `activeTab` & `scripting`: Required to safely interact with the feedback question elements on the active ERP tab.
- **Zero data collection**: No credentials, student IDs, or form answers are ever logged or sent anywhere.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ for the students of <strong>IIT Kharagpur</strong>.
</p>
