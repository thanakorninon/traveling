# 🤝 การมีส่วนร่วมในโปรเจค

ขอบคุณที่สนใจมีส่วนร่วมในโปรเจค Travel Planner! นี่คือแนวทางสำหรับการมีส่วนร่วม

## 📋 ก่อนเริ่มต้น

1. **Fork โปรเจค** ไปยัง GitHub account ของคุณ
2. **Clone** โปรเจคที่ fork มาแล้ว
3. **สร้าง Branch** ใหม่สำหรับ feature ที่จะพัฒนา

```bash
git clone https://github.com/YOUR_USERNAME/travel-planner.git
cd travel-planner
git checkout -b feature/your-feature-name
```

## 🛠️ การพัฒนา

### การตั้งค่า Environment

1. **ติดตั้ง Dependencies**
```bash
npm install
```

2. **ตั้งค่า Google Maps API Key**
   - สร้างไฟล์ `.env` จาก `.env.example`
   - เพิ่ม Google Maps API Key ของคุณ

3. **รันโปรเจค**
```bash
npm run dev
```

### การเขียนโค้ด

#### JavaScript
- ใช้ ES6+ syntax
- เขียน JSDoc comments สำหรับ functions
- ใช้ meaningful variable names
- หลีกเลี่ยง global variables

#### CSS
- ใช้ CSS Custom Properties สำหรับ colors และ spacing
- ใช้ BEM methodology สำหรับ class names
- รองรับ Dark Mode
- เขียน responsive design

#### HTML
- ใช้ semantic HTML elements
- เพิ่ม ARIA attributes สำหรับ accessibility
- ใช้ proper heading hierarchy

### การทดสอบ

1. **ตรวจสอบการทำงาน**
   - ทดสอบในเบราว์เซอร์ต่างๆ
   - ทดสอบ responsive design
   - ทดสอบ Dark/Light mode

2. **ตรวจสอบโค้ด**
```bash
npm run lint
npm run format
```

## 📝 การ Commit

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: ฟีเจอร์ใหม่
- `fix`: แก้ไขบั๊ก
- `docs`: เอกสาร
- `style`: การจัดรูปแบบโค้ด
- `refactor`: ปรับปรุงโค้ด
- `test`: เพิ่มหรือแก้ไข tests
- `chore`: งานบำรุงรักษา

### ตัวอย่าง
```
feat(planner): เพิ่มฟีเจอร์ drag and drop สำหรับจัดลำดับสถานที่

- เพิ่ม drag and drop functionality
- เพิ่ม visual feedback เมื่อลาก
- ปรับปรุง UX สำหรับการจัดลำดับ

Closes #123
```

## 🔄 การสร้าง Pull Request

1. **Push** โค้ดไปยัง branch ของคุณ
```bash
git push origin feature/your-feature-name
```

2. **สร้าง Pull Request** บน GitHub
3. **กรอกข้อมูล** ตาม template
4. **รอการ review** จาก maintainers

### Pull Request Template

```markdown
## 📝 คำอธิบาย
อธิบายการเปลี่ยนแปลงที่ทำ

## 🔧 การเปลี่ยนแปลง
- [ ] เพิ่มฟีเจอร์ใหม่
- [ ] แก้ไขบั๊ก
- [ ] ปรับปรุง UI/UX
- [ ] เพิ่มเอกสาร

## 🧪 การทดสอบ
- [ ] ทดสอบในเบราว์เซอร์ต่างๆ
- [ ] ทดสอบ responsive design
- [ ] ทดสอบ Dark/Light mode

## 📸 Screenshots (ถ้ามี)
เพิ่ม screenshots ของการเปลี่ยนแปลง

## ✅ Checklist
- [ ] โค้ดผ่าน linting
- [ ] โค้ดผ่าน formatting
- [ ] เพิ่ม JSDoc comments
- [ ] ทดสอบการทำงาน
```

## 🐛 การรายงานบั๊ก

### ข้อมูลที่ต้องมี
1. **คำอธิบายบั๊ก** ที่ชัดเจน
2. **ขั้นตอนการทำซ้ำ**
3. **ผลลัพธ์ที่คาดหวัง**
4. **ผลลัพธ์ที่เกิดขึ้นจริง**
5. **ข้อมูลระบบ** (เบราว์เซอร์, OS)
6. **Screenshots** (ถ้ามี)

### ตัวอย่าง
```markdown
## 🐛 บั๊ก: ไม่สามารถเพิ่มสถานที่ได้

### คำอธิบาย
เมื่อคลิกปุ่ม "เพิ่มในแผน" ในหน้า Search ไม่มีอะไรเกิดขึ้น

### ขั้นตอนการทำซ้ำ
1. ไปที่แท็บ "ค้นหาสถานที่"
2. ค้นหา "วัดพระแก้ว"
3. คลิก "เพิ่มในแผน"

### ผลลัพธ์ที่คาดหวัง
สถานที่ควรถูกเพิ่มลงในแผนการเดินทาง

### ผลลัพธ์ที่เกิดขึ้นจริง
ไม่มีอะไรเกิดขึ้น

### ข้อมูลระบบ
- เบราว์เซอร์: Chrome 120.0.6099.109
- OS: Windows 11
- หน้าจอ: 1920x1080
```

## 💡 การเสนอฟีเจอร์

### ข้อมูลที่ต้องมี
1. **คำอธิบายฟีเจอร์** ที่ชัดเจน
2. **เหตุผล** ที่ต้องการฟีเจอร์นี้
3. **ตัวอย่างการใช้งาน**
4. **Mockups/Screenshots** (ถ้ามี)

## 📚 แหล่งข้อมูล

- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [CSS Guidelines](https://cssguidelin.es/)
- [Git Commit Guidelines](https://www.conventionalcommits.org/)

## 🎉 ขอบคุณ

ขอบคุณที่ใช้เวลามีส่วนร่วมในโปรเจคนี้! ทุกการมีส่วนร่วมจะช่วยให้ Travel Planner ดีขึ้น

---

**หากมีคำถามเพิ่มเติม กรุณาสร้าง Issue หรือติดต่อ maintainers** 