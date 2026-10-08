# Menura — Akıllı QR Menü

Menura, restoran ve kafelerin dakikalar içinde dijital menü oluşturup QR kodla misafirleriyle
paylaşmasını sağlayan çok kiracılı (multi-tenant) bir web uygulamasıdır. İşletme sahibi panelden
menüsünü yönetir; misafir masadaki QR kodu okuttuğunda menüyü `/m/<restoran>` adresinde anında görür.

**Demo menü:** `/m/demo` · **Mimari:** [docs/architecture.md](docs/architecture.md) · **Yayınlama:** [docs/deployment.md](docs/deployment.md)

## Özellikler

**İşletme paneli**
- E-posta/şifre ile hesap, şifre sıfırlama (e-posta servisi tanımlıysa), hesap silme
- Restoran profili: logo, kapak görseli, iletişim, Instagram, Wi-Fi bilgisi, tema rengi, para birimi
- Kategoriler: ekleme/düzenleme/silme, sürükle-bırak sıralama, aktif/pasif
- Ürünler: fiyat ve indirimli fiyat, görsel, 14 yasal alerjen, diyet etiketleri (vegan, glutensiz…),
  kalori, hazırlanma süresi, öne çıkarma, tükendi durumu, toplu işlemler, kopyalama, sıralama
- QR kod tasarımı (renk, desen, logo), PNG/SVG indirme, A4 masa kartı baskısı
- Gerçek menü görüntülenme istatistikleri, kurulum kontrol listesi
- Yayın durumu: hazır olana kadar menü taslakta kalır

**Misafir menüsü**
- Mobil öncelikli, hızlı, sunucuda üretilen sayfa; açık/koyu tema
- Yapışkan kategori gezinmesi, Türkçe karakter duyarlı arama, ürün detay penceresi
- Alerjen bilgisi, "Fiyatlarımıza KDV dahildir" notu, SEO ve paylaşım görselleri

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

Kayıt olup restoranınızı oluşturun; panel `/dashboard` adresindedir. Geliştirme ortamında
e-postalar gönderilmez, konsola yazılır.

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
