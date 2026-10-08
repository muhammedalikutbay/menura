# Menura — Akıllı QR Menü

Menura, restoran ve kafelerin dakikalar içinde dijital menü oluşturup QR kodla misafirleriyle
paylaşmasını sağlayan çok kiracılı (multi-tenant) bir web uygulamasıdır. İşletme sahibi panelden
menüsünü yönetir; misafir masadaki QR kodu okuttuğunda menüyü `/m/<restoran>` adresinde anında görür.

**Demo menü:** `/m/demo` · **Mimari:** [docs/architecture.md](docs/architecture.md) · **Yayınlama:** [docs/deployment.md](docs/deployment.md)

## Özellikler

**İşletme paneli** (üstte yüzen gezinme çubuğu; açık tema)
- **Genel bakış** (`/dashboard`): menü görüntülenme istatistikleri, kurulum kontrol listesi, yayın durumu
- **Menü** (`/dashboard/menu`): kategoriler ve ürünler tek sayfada; sürükle-bırak ile sıralama ve
  ürünleri kategoriler arasında taşıma; ürün düzenleyici yan panelde açılır (fiyat ve indirimli fiyat,
  görsel, 14 yasal alerjen, diyet etiketleri, kalori, hazırlanma süresi, öne çıkarma, tükendi durumu)
- **Restoran** (`/dashboard/restaurant`): profil, logo, kapak görseli, iletişim, Instagram, web sitesi, Wi-Fi bilgisi
- **Görünüm** (`/dashboard/appearance`): menüyü yayınlama, menü adresi, tema rengi, para birimi,
  "Fiyatlara KDV dahildir" notu, tükenen ürünleri gizleme; canlı telefon önizlemesi
- **QR kod** (`/dashboard/qr`): renk, desen ve logo ile QR tasarımı, PNG/SVG indirme, A4 masa kartı baskısı (`/print`)
- **Hesap** (`/dashboard/account`, avatar menüsünden): e-posta/şifre hesabı, şifre sıfırlama ve e-posta
  doğrulama (e-posta servisi tanımlıysa), hesap silme
- Yayın durumu: menü hazır olana kadar taslakta kalır

**Misafir menüsü** (`/m/<restoran>`)
- Mobil öncelikli, hızlı, sunucuda üretilen sayfa; açık tema, restoranın tema rengiyle
- Yapışkan kategori gezinmesi, Türkçe karakter duyarlı arama, ürün detay penceresi
- Alerjen bilgisi, "Fiyatlarımıza KDV dahildir" notu, SEO ve paylaşım görselleri

**Tanıtım sayfası** (`/`)
- Menü bileşenlerinin gerçek misafir görünümüyle çalışan 3D telefon önizlemesi (örnek veriyle)

## Teknoloji

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Radix UI ·
PostgreSQL + Drizzle ORM · Better Auth · sharp · Zod · Vitest · Playwright

## Yerelde çalıştırma

Gereksinim: Node.js 22+. Veritabanı kurmanız gerekmez: `npm run dev`, gömülü PGlite'ı
(`.data/pglite`) yerel bir Postgres sunucusu olarak (port 5433) başlatır ve Next.js'i ona bağlar.
Kendi Postgres'inizi kullanmak için `.env.local` içine `DATABASE_URL` yazıp `npm run dev:next` çalıştırın.

```bash
npm install
npm run db:seed     # migration'ları uygular ve /m/demo restoranını oluşturur
npm run dev         # http://localhost:3000
```

Kayıt olup restoranınızı oluşturun; panel `/dashboard` adresindedir. E-posta doğrulama ve şifre
sıfırlamayı yerelde denemek için `.env.local` içine `EMAIL_TRANSPORT=console` yazın; e-postalar
gönderilmez, bağlantılar sunucu konsoluna yazılır.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Yerel veritabanı + geliştirme sunucusu |
| `npm run dev:next` | Yalnız Next.js (kendi `DATABASE_URL`'iniz ile) |
| `npm run check` | Lint + typecheck + birim/entegrasyon testleri + üretim derlemesi |
| `npm test` | Vitest (bellek içi Postgres ile entegrasyon testleri dahil) |
| `npm run test:e2e` | Playwright uçtan uca testleri (masaüstü + mobil) |
| `npm run db:generate` | Şema değişikliğinden migration üretir |
| `npm run db:migrate` | Migration'ları uygular |
| `npm run db:seed` | Demo restoranı oluşturur (`-- --reset` ile yeniden) |

## Proje yapısı

```
src/app/          sayfalar ve route'lar (ince katman)
src/features/     alan modülleri: schema (zod), queries, actions, components
src/components/   tasarım sistemi (ui/) ve uygulama kabuğu
src/db/           Drizzle şeması ve istemci
src/server/       kimlik doğrulama, oturum, ortam değişkenleri, e-posta
src/lib/          para, metin, alerjen gibi saf yardımcılar
drizzle/          SQL migration'ları
e2e/              Playwright testleri
```

Geliştirme kuralları ve yapay zekâ ajanları için talimatlar: [AGENTS.md](AGENTS.md).

---

İlk sürüm Software Persona 11. Dönem staj eğitimi kapsamında geliştirildi; v2 ile üretim
kullanımına uygun, çok kiracılı bir mimariye taşındı.
