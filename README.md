# Xbet Fast Cash - Official Sri Lanka Web App
An elegant, mobile-first web landing page designed for an official **1xBet** agent operating in Sri Lanka. The web application provides users with an intuitive interface to copy promo codes, fetch bank transaction details, request deposits/withdrawals, and easily contact agents via WhatsApp.

## 🚀 Features
 * **Mobile-First Design:** Fully optimized for mobile screens (max-width: 520px) giving an app-like look and feel.
 * **Dynamic Modals:** Interactive popup screens for **Bank Details**, **Deposit Requests**, **Withdrawals**, and **Contact Information** without reloading the page.
 * **Instant Clipboard Copy:** Single-click copy buttons for account numbers, names, and promo codes.
 * **Live Transactions Simulation:** A built-in JavaScript ticker simulating real-time deposit/withdrawal logs to enhance credibility and user engagement.
 * **WhatsApp Automation:** Direct integration (wa.me) to automatically redirect clients to specific WhatsApp helpline numbers.
 * **Localized Content:** Includes clear instructions written in Sinhala (si) for better user accessibility in Sri Lanka.

## 🛠️ Technology Stack
 * **HTML5:** Structure and Semantic Markup.
 * **CSS3:** Custom animations (pulse, spin, ticker), radial-gradient background styling, and interactive UI component designing.
 * **Vanilla JavaScript:** Lightweight functionality handling modal states, asynchronous clipboard API management, and fake live data updating mechanisms.
 * **Web Fonts:** Google Fonts integrated ('Rajdhani', 'Teko', and 'Noto Sans Sinhala').

## 📂 Project Structure
```bash
├── index.html       # The main entry point containing HTML structure, styles, and logic.
└── README.md        # Project documentation (This file)

```
## 💻 How to Run Locally

Since this project relies on **pure Vanilla JS and CSS**, it does not require any build tools or local servers to run.
 
 1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lakmal2078/1xbetfastsrilanka
   
   ```
 2. **Navigate to the project folder:**
   ```bash
   cd 1xbetfastsrilanka
   
   ```
 3. **Open the file:**
   Simply double-click index.html to open it directly in any modern web browser.

## ⚙️ Configuration Notes
If you want to customize this template for a different agent:
 * **WhatsApp Numbers:** Change the phone numbers inside the openWA('94740000000') functions located inside the <script> tag at the bottom of the page.
 * **Bank Details:** Locate the `` comment in the HTML and replace the mock text/numbers with actual payment details.

## 📄 License
This project is open-source and available under the MIT License.
> **Disclaimer:** This project is a front-end UI template designed for educational and informational purposes. Ensure compliance with local laws and platform regulations before deploying gambling or betting-related helper tools.
> 
