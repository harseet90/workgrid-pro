# WorkGrid Pro Portal

Modern workforce portal with 3D glassmorphism and real-time earnings tracking.

## 🚀 Getting Started

If you have downloaded this project as a ZIP, follow these steps to run it locally and deploy to GitHub.

### 1. Installation

Exract the ZIP folder and open it in your terminal (or VS Code). Then run:

```bash
npm install
```

### 2. Local Development

To start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:3000`.

### 3. Deploying to GitHub Pages

Since the `gh-pages` and deployment scripts are already configured in `package.json`:

1.  **Create a New Repo** on GitHub at `https://github.com/new`.
2.  **Push your code** to GitHub:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
3.  **Run Deploy**:
    ```bash
    npm run deploy
    ```
4.  **Finalize**: Go to your GitHub Repo -> Settings -> Pages and ensure the source is set to the `gh-pages` branch.

## 🔑 Configuration (EmailJS)

The form is configured with the following credentials (pre-set in `App.tsx`):
- **Service ID**: `service_2k0sytn`
- **Template ID**: `template_629k0gp`
- **Public Key**: `DAX4-xm08TcLFTT_K`

## 🛠 Tech Stack
- React 19
- Tailwind CSS 4
- Lucide React (Icons)
- Motion (Animations)
- EmailJS (@emailjs/browser)
