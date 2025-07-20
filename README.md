# Smart Irrigation System 🌱

A sustainable, ML-powered web app that intelligently determines whether your garden needs watering—based on soil moisture and ambient temperature.

**Live Demo:** [smart-irrigation-system.onrender.com](https://smart-irrigation-system.onrender.com/)

---

## 🧰 Built With

- **Python** & **Flask** (backend web framework)  
- **scikit-learn** – Random Forest model  
- **HTML/CSS/Jinja2** – Frontend templating  
- **pandas / numpy** – Data preprocessing  
- **Render** – Live hosting

---

## ⚙️ Features

- Predicts watering needs using a pre-trained Random Forest model  
- Interactive web form for soil moisture & temperature input  
- Instant “Water” / “No Water” output  
- 100% accuracy on existing dataset (based on evaluation metrics)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+ on your system  
- Git command-line interface

### Installation

```bash
git clone https://github.com/sunjoe508/Smart-Irrigation-System.git
cd Smart-Irrigation-System
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# .\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Running Locally

```bash
flask run              # for development
# or using Gunicorn
gunicorn app:app
```

Visit `http://127.0.0.1:5000/` in your browser.

---

## 🧠 Model Details

- **Algorithm:** Random Forest classifier  
- **Dataset:** `data.csv` – moisture & temperature readings  
- **Model file:** `smartirrigation.pkl`  
- **Notebook:** `smart_irrigation.ipynb` (training & evaluation)  
- **Performance:** 100% accuracy based on the dataset

---

## 📦 Deployment

- Hosted on **Render**—configured via `requirements.txt` and `Procfile`
- Fully deployed and live at: https://smart-irrigation-system.onrender.com/

---

## 💾 Usage

1. Open the web interface  
2. Enter current soil moisture and temperature  
3. Click **Submit**  
4. View predicted result (“Water” or “No Water”)

---

## ✅ Contributing

Contributions are welcome! Please:

1. Fork the repo  
2. Create a feature branch (`git checkout -b feat/YourFeature`)  
3. Commit your changes (`git commit -m "Add feature: xyz"`)  
4. Push (`git push origin feat/YourFeature`)  
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Joe Mungai** – Passionate about sustainable tech & automated gardening  
- GitHub: [@sunjoe508](https://github.com/sunjoe508)  
- Email: [joemunga329@gmail.com](mailto:joemunga329@gmail.com)

Feel free to reach out!

---

## 🔮 Next Steps

- Integrate real-time sensor data via IoT (ESP32, sensor API)  
- Improve model using live data feedback  
- Add dashboard charts & history
