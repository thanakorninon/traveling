# 🗺️ Travel Planner - วางแผนการเที่ยว

แอปพลิเคชันวางแผนการเดินทางที่ใช้งานง่าย มาพร้อมกับฟีเจอร์ครบครันสำหรับการจัดทริปเที่ยว

## ✨ ฟีเจอร์หลัก

### 🗓️ วางแผนการเที่ยว
- เพิ่มสถานที่ท่องเที่ยวลงในแผน
- จัดลำดับการเดินทางแบบ Drag & Drop
- กำหนดเวลาและวันที่
- แสดงข้อมูลรายละเอียดสถานที่

### 🔍 ค้นหาสถานที่
- ค้นหาสถานที่ผ่าน Google Places API
- แสดงภาพและข้อมูลสถานที่
- เพิ่มสถานที่ลงในแผนได้ทันที
- รองรับการค้นหาในกรุงเทพฯ

### 💰 คำนวณงบประมาณ
- ตั้งค่างบประมาณรายวัน
- คำนวณค่าใช้จ่ายอัตโนมัติ
- แสดงกราฟสรุปงบประมาณ
- แบ่งประเภทค่าใช้จ่าย

### 🧳 จัดกระเป๋า
- สร้างรายการของที่ต้องนำ
- จัดหมวดหมู่ของใช้
- เช็คลิสต์การจัดกระเป๋า
- แสดงความคืบหน้า

### 🌙 ธีม
- รองรับ Dark Mode และ Light Mode
- บันทึกการตั้งค่าอัตโนมัติ
- เปลี่ยนธีมได้ทันที

### 📤 แชร์และส่งออก
- สร้าง QR Code สำหรับแชร์แผน
- ส่งออกเป็นไฟล์ PDF
- แชร์ผ่าน Social Media (Line, Facebook)
- คัดลอกลิงก์แชร์
- ส่งออกข้อมูลเป็น JSON

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Icons**: Font Awesome 6
- **Fonts**: Kanit (Google Fonts)
- **Charts**: Chart.js
- **Maps**: Google Maps Places API
- **Build Tool**: Vite

## 📦 การติดตั้ง

### ข้อกำหนดเบื้องต้น
- Node.js (เวอร์ชัน 14 หรือใหม่กว่า)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจค**
```bash
git clone <repository-url>
cd travel-planner
```

2. **ติดตั้ง Dependencies**
```bash
npm install
```

3. **ตั้งค่า Google Maps API Key**
   - ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
   - สร้างโปรเจคใหม่
   - เปิดใช้งาน Places API
   - สร้าง API Key
   - แก้ไขไฟล์ `index.html` บรรทัดที่ 181:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initSearchManager" async defer></script>
   ```

4. **รันโปรเจค**
```bash
npm run dev
```

5. **เปิดเบราว์เซอร์**
   - ไปที่ `http://localhost:5173`

## 🚀 การใช้งาน

### การวางแผนการเที่ยว
1. ไปที่แท็บ "วางแผนการเที่ยว"
2. กรอกชื่อทริปและเวลาเริ่มต้น
3. เพิ่มสถานที่จากรายการแนะนำ หรือค้นหาจากแท็บ "ค้นหาสถานที่"
4. ลากและวางเพื่อจัดลำดับการเดินทาง
5. แก้ไขหรือลบรายการตามต้องการ

### การค้นหาสถานที่
1. ไปที่แท็บ "ค้นหาสถานที่"
2. พิมพ์คำค้นหา (เช่น "วัดพระแก้ว", "สวนลุมพินี")
3. กดปุ่มค้นหาหรือ Enter
4. คลิก "เพิ่มในแผน" เพื่อเพิ่มสถานที่

### การคำนวณงบประมาณ
1. ไปที่แท็บ "คำนวณงบประมาณ"
2. ตั้งค่างบประมาณในแต่ละหมวดหมู่
3. ระบบจะคำนวณงบประมาณรวมอัตโนมัติ
4. ดูกราฟสรุปงบประมาณรายวัน

### การจัดกระเป๋า
1. ไปที่แท็บ "จัดกระเป๋า"
2. เพิ่มหมวดหมู่ใหม่ (ถ้าต้องการ)
3. เพิ่มรายการของที่ต้องนำ
4. เช็คลิสต์เมื่อจัดกระเป๋าเสร็จ

### การแชร์แผน
1. ไปที่แท็บ "วางแผนการเที่ยว"
2. สร้างแผนที่มีสถานที่อย่างน้อย 1 แห่ง
3. คลิกปุ่ม "แชร์แผน" ด้านขวา
4. เลือกวิธีการแชร์ (QR Code, PDF, Social Media)
5. แชร์กับเพื่อนหรือครอบครัว

## 📁 โครงสร้างไฟล์

```
travel-planner/
├── index.html          # ไฟล์หลัก
├── styles/
│   └── main.css        # สไตล์ทั้งหมด
├── js/
│   ├── app.js          # ไฟล์หลักของแอป
│   ├── search.js       # ระบบค้นหาสถานที่
│   ├── theme.js        # ระบบธีม
│   └── export.js       # ระบบแชร์และส่งออก
├── package.json        # การตั้งค่าโปรเจค
└── README.md          # ไฟล์นี้
```

## 🎨 การปรับแต่ง

### การเปลี่ยนสีธีม
แก้ไขไฟล์ `styles/main.css` ในส่วน CSS Variables:

```css
:root {
  --accent-color: #667eea;        /* สีหลัก */
  --bg-gradient-start: #667eea;   /* สีเริ่มต้นพื้นหลัง */
  --bg-gradient-end: #764ba2;     /* สีสิ้นสุดพื้นหลัง */
}
```

### การเพิ่มฟีเจอร์ใหม่
1. เพิ่ม HTML ใน `index.html`
2. เพิ่ม CSS ใน `styles/main.css`
3. เพิ่ม JavaScript ใน `js/app.js` หรือสร้างไฟล์ใหม่

## 🔧 การพัฒนา

### รันในโหมด Development
```bash
npm run dev
```

### Build สำหรับ Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 การรองรับ

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iPhone, Android)
- ✅ Responsive Design

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 📞 ติดต่อ

หากมีคำถามหรือข้อเสนอแนะ กรุณาสร้าง Issue ใน GitHub repository

---

**สร้างด้วย ❤️ สำหรับนักเดินทางชาวไทย** 