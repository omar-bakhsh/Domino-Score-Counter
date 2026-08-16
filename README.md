# 🀄 Domino Score Counter & Vision App
### عداد نقاط الضومنو الذكي بالرؤية الحاسوبية وقوانين بطولات الفرق (70 نقطة)

<div align="center">

![Expo SDK](https://img.shields.io/badge/Expo_SDK-54.0.0-000000?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.76.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![WebGL](https://img.shields.io/badge/WebGL-Hardware_Accelerated-990000?style=for-the-badge&logo=webgl&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-00ffcc?style=for-the-badge)

**A professional, offline AI-powered Domino scoring and tournament management mobile application built with React Native, Expo SDK 54, and native WebGL pixel processing.**

[المميزات](#-features--المميزات) • [طريقة التثبيت والتشغيل](#-getting-started--التثبيت-والتشغيل) • [قواعد اللعبة](#-game-rules--قواعد-اللعبة) • [الهيكلية البرمجية](#-project-structure--هيكلية-المشروع)

</div>

---

## 🌟 Features / المميزات

### 👁️ Offline AI Computer Vision (الرؤية الحاسوبية بدون إنترنت)
- **Local On-Device Processing**: 100% offline computer vision running locally via WebGL shaders and integral image adaptive thresholding.
- **Auto-Contrast Stretching**: Enhances low-contrast photos (e.g. cream dominoes on white tables or digital screens).
- **Geometric Pip Filtering**: Distinguishes true circular black pips from packaging letters, logos, shadows, or dividing lines using fill-ratio and aspect ratio validation.
- **Focus Frame Box Filtering**: Restricts detections strictly to the central target frame, ignoring background clutter and screen bezels.

### 🟢 Direct Interactive Pip Tap Editor (محرر النقاط التفاعلي المباشر)
- **Pixel-Accurate 3:4 Overlay**: Perfectly aligns neon-green markers over the real photo pixels, eliminating aspect-ratio stretch and drift.
- **Frictionless Tap-to-Edit**: Tap anywhere on the image to add a missing pip, or tap an existing neon marker to delete it.
- **Real-Time Dynamic Sensitivity**: Switch sensitivity (`Low (Strict)` / `Balanced` / `High (Sensitive)`) and re-analyze the current photo instantly.
- **Quick Nudge Buttons (`+1` / `-1`)**: Instantly adjust points without needing to touch the photo.

### 🏆 70-Point Team Tournament Engine (نظام بطولات الفرق)
- **2 Teams (4 Players)**: Full support for 2-team gameplay with customizable team and player names.
- **20-Point Opening Rule (شرط النزول)**: Requires a team to score at least 20 raw pips in their first scoring round to open their score.
- **Floor Rounding (تقريب العشرات الأدنى)**: Automatically calculates `Math.floor(pips / 10) * 10` (e.g., 45 pips $\rightarrow$ 40 points, 19 pips $\rightarrow$ 10 points).
- **Live SVG Progression Chart**: Real-time vector line chart showing score progression round-by-round for Team 1 (Cyan) vs Team 2 (Gold) towards the 70-point target line.
- **One-Tap Points Grid**: Quickly log round scores using preset chips (`10`, `15`, `20`, `30`, `40`, `50`, `60`).

---

## 📱 Screenshots / لقطات من التطبيق

| لوحة الصدارة والرسم البياني | محرر النقاط التفاعلي | واجهة الكاميرا الاحترافية |
| :---: | :---: | :---: |
| 📊 **Tournament Dashboard** | 🟢 **Direct Pip Editor** | 📷 **Focus Camera View** |
| لوحة نتائج ثنائية حتى 70 ن مع رسم بياني حي | دوائر خضراء فوق النقاط مع تعديل باللمس | إطار توجيهي وتوافق كامل لـ SDK 54 |

---

## 📜 Game Rules / قواعد اللعبة المعتمدة

1. **الهدف (Target Score)**: تنتهي المباراة بوصول أحد الفريقين إلى **70 نقطة** (7 بنوط).
2. **احتساب النقاط (Score Calculation)**:
   $$\text{النقاط المضافة} = \lfloor \frac{\text{مجموع نقاط يد الخصم}}{10} \rfloor \times 10$$
   * مثال: 45 نقطة خصم $\rightarrow$ **40 نقطة**.
   * مثال: 15 نقطة خصم $\rightarrow$ **10 نقاط**.
3. **شرط النزول (Opening Threshold)**:
   * لا تسجل أي نقاط للفريق في بداية المباراة إلا إذا حقق جولة بقيمة **20 نقطة أو أكثر** من يد الخصم.
   * الجولات الأقل من 20 في البداية تظل معلقة حتى يتم تحقيق النزول.

---

## 🛠️ Tech Stack / التقنيات المستخدمة

- **Framework**: [Expo SDK 54](https://expo.dev) / [React Native 0.76](https://reactnative.dev)
- **Computer Vision**: Hardware-Accelerated `expo-gl` (WebGL) + Local Connected Component Labeling (CCL)
- **Image Processing**: `expo-image-manipulator`
- **Camera**: `expo-camera` (CameraView API)
- **Vector Graphics**: `react-native-svg`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Storage**: `@react-native-async-storage/async-storage`

---

## 🚀 Getting Started / التثبيت والتشغيل

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- [Expo Go App](https://expo.dev/client) installed on your iOS or Android device

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/omar-bakhsh/Domino-Score-Counter.git
cd Domino-Score-Counter

# 2. Install dependencies
npm install

# 3. Start the development server
npm run start
```

### Running on Device
Scan the generated QR code in your terminal using:
- **Android**: Expo Go App
- **iOS**: Camera App

---

## 📁 Project Structure / هيكلية المشروع

```text
domino_scoring_vision_app/
├── components/
│   ├── CustomCamera.js      # واجهة الكاميرا مع إطار التركيز
│   ├── DominoOverlay.js     # محرر النقاط التفاعلي المباشر باللمس
│   ├── GameHistory.js       # سجل أرشيف المباريات السابقة
│   ├── Scoreboard.js        # لوحة الصدارة والرسم البياني وقواعد الـ 70
│   └── Settings.js          # شاشة الإعدادات ودليل القواعد
├── utils/
│   └── dominoVision.js      # خوارزمية الرؤية الحاسوبية والتطبيع اللوني
├── App.js                   # المنسق العام وشريط التنقل
├── app.json                 # إعدادات مشروع Expo
└── package.json             # الحزم والتبعيات
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>صنع بإتقان وشغف لعشاق لعبة الضومنو 🀄</sub>
</div>
