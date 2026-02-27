# Menura - Smart QR Menu System

Menura, modern restoranlar ve kafeler için tasarlanmış, Apple estetiğinden ilham alan premium bir Akıllı QR Menü yönetim sistemidir. Bu proje, **Software Persona 11. Dönem Staj** eğitimi çerçevesinde, modern web teknolojilerini ve CRUD operasyonlarını bütüncül bir şekilde uygulamak amacıyla geliştirilmiştir.

🚀 **Canlı Önizleme:** [menuratnc.netlify.app](https://menuratnc.netlify.app)

## 🎯 Proje Amacı ve Kapsamı

Bu uygulama, eğitim yönergesinde belirtilen tüm adımları kapsayacak şekilde inşa edilmiştir:
- **Teknoloji**: Next.js 16 ve React 19 kullanılarak modern bir çerçeve üzerine kuruldu.
- **CRUD Operasyonları**: Kategori ve Menü Ürünleri için Ekleme, Listeleme, Güncelleme ve Silme işlemleri eksiksiz uygulanmıştır.
- **Yayınlama**: Netlify platformu üzerinden sürekli dağıtım (CD) ile yayına alınmıştır.

## 🛠 Teknoloji Yığını

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & State**: React 19, LocalStorage Persistence
- **Styling**: Tailwind CSS 4 (Apple UI Design Guidelines)
- **Icons**: Lucide React
- **QR Generation**: qr-code-styling

## ✨ Gelişmiş Özellikler ve Edge Case Yönetimi

Uygulama geliştirilirken sadece temel özellikler değil, kullanıcı deneyimini etkileyen kritik uç durumlar (edge cases) de dikkate alınmıştır:

- **Veri Güvenliği ve Persistence**: `localStorage` bazlı veri mimarisi ile sayfa yenilense bile veriler korunur.
- **Otomatik Seeding**: Uygulama ilk açıldığında boş kalmaması için kategorilerden ve ürünlerden ıkuşan profesyonel veri seti otomatik olarak yüklenir.
- **İleri Seviye Navigasyon**: Kategori kartlarından doğrudan ilgili ürünlere filtrelenmiş yönlendirme.
- **Pagination (Sayfalama)**: Büyük veri setlerinde performansı korumak için Dashboard ve listelerde özelleştirilmiş 6'lı sayfalama sistemi.
- **Boş Durum (Empty States)**: Hiç veri olmadığında kullanıcıyı yönlendiren şık boş durum arayüzleri.
- **Görsel Fallback**: Ürün resmi eksik olduğunda otomatik devreye giren modern yer tutucu (placeholder) sistemi.
- **Responsive Tasarım**: Tüm ekran boyutlarında ve cihazlarda kusursuz görüntüleme.

## � Proje Yapısı

Eğitim yönergesine sadık kalınarak oluşturulan ağaç yapısı:
- `src/components`: Paylaşılan bileşenler.
- `src/app/pages`: Sayfa yönlendirmeleri ve ana modüller.
- `src/types`: `Interfaces` ve tip tanımlamaları.
- `src/lib`: Depolama ve yardımcı fonksiyonlar.

---

