# DoveNet 🕊️

This project is the **frontend** for a pigeon management system — a web application designed to manage pigeon data such as ring numbers, names, parents, pedigrees, and user settings. It connects to a backend API (built separately - https://github.com/kkotorov/dovenet) to provide full CRUD operations, authentication, and PDF pedigree generation.

---

- **Live Demo:** [DoveNet UI](https://youtu.be/ezMFsSjKeSA)  

## 🧩 Overview

This React frontend provides a clean, modern interface using **Material UI (MUI)** and **React Router** for navigation. It includes all essential user workflows:

- 🔐 **Authentication** — Register, Login, Password Reset  
- 🕊️ **Pigeon Management** — Create, edit, delete, and view pigeons  
- 🧬 **Pedigree Download** — Download pedigree PDFs  
- 👨‍👩‍👧 **Parent Highlighting** — Quickly visualize parent pigeons  
- ⚙️ **User Settings** — Change email, password, and language preferences  
- 🌐 **Multilingual Support** — English and Bulgarian via `i18next`

---

## 🏗️ Tech Stack

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)  
[![Material UI](https://img.shields.io/badge/Material_UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)  
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)  
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)  
[![i18next](https://img.shields.io/badge/i18next-FFDE00?style=for-the-badge&logo=i18next&logoColor=black)](https://www.i18next.com/)  
[![React Hooks](https://img.shields.io/badge/React_Hooks-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/docs/hooks-intro.html)  
[![MUI Icons](https://img.shields.io/badge/MUI_Icons-0081CB?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/components/icons/)  
[![MUI Dialogs](https://img.shields.io/badge/MUI_Dialogs-0081CB?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/components/dialogs/)


---

## 🚀 Features

### 👤 Authentication
- Login with username and password  
- Register with email verification  
- Password reset via email token  

### 🕊️ Pigeon Management
- Add, edit, delete, and list pigeons  
- Sort by any field (ID, name, gender, etc.)  
- Highlight pigeon parents for easy tracing  
- Download pedigree as a PDF  

### ⚙️ User Settings
- View and update user details  
- Change password and email with verification  
- Trigger email verification  
- Switch app language (English / Български)

---

## 🧭 Pages Overview

| Page | Description |
|------|-------------|
| `/login` | User login |
| `/register` | New user registration |
| `/forgot-password` | Send password reset link |
| `/reset-password` | Reset password via email token |
| `/dashboard` | Main pigeon overview and management |
| `/settings` | User settings (email, password, language) |
| `/verify-email` | Email verification callback page |

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:kkotorov/dovenet-ui.git
   cd dovenet-ui
2. **Install dependencies**
   ```bash
   npm install
3. **Start the development server**
   ```bash
   npm run dev
4. **The app will be available at**
   ```bash
   http://localhost:5173

---

## 🔌 Backend Connection
  This frontend communicates with a backend API at:
  ```bash
  http://localhost:8080/api/
   ```
You can adjust this URL in your API calls or environment variables if your backend runs elsewhere.
Example:
  ```bash
    axios.get('http://localhost:8080/api/pigeons', {
      headers: { Authorization: `Bearer ${token}` },
    });
```

##🌍 Internationalization

All UI text is managed via i18next.
Language can be switched in the user settings (English / Български).

💬 Notes

This is only the frontend — it requires the backend project dovenet - https://github.com/kkotorov/dovenet to be running for full functionality.
If you develop your backend on your own, make sure your backend provides JWT-based authentication and all the API endpoints used in this app.

Author: Krasen Kotorov

📄 License

This project is licensed under the MIT License.
See the LICENSE file for details.
