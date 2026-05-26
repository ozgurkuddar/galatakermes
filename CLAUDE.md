# Galata Kermes — CLAUDE.md

## Proje Amacı
Kermes etkinliklerinde ürün fiyatlarını anlık yönetmek, fiyat geçmişini takip etmek, kazanç ve maliyet kalemlerini kayıt altına almak için geliştirilmiş bir **Telegram Mini App**.

---

## Platform & Tech Stack

| Katman | Teknoloji |
|---|---|
| Frontend | React + Vite |
| Telegram entegrasyonu | Telegram Web App SDK (`@twa-dev/sdk`) |
| Backend / Veritabanı | Supabase (Auth + Realtime DB) |
| Deployment | Vercel (veya benzeri statik hosting) |
| Bot | Yeni Telegram botu oluşturulacak (BotFather ile) |

---

## Kullanıcı Rolleri

### Admin (1 kişi)
- Editör kullanıcıları yetkilendirir / yetkisini kaldırır.
- Editörlerle aynı yetkiye sahiptir.

### Editör (varsayılan 2 kişi, admin artırabilir)
- Fiyat güncelleyebilir.
- Yeni kategori ve ürün ekleyebilir.
- Maliyet kalemi ekleyebilir / güncelleyebilir.
- Kazanç girişi yapabilir.

### Görüntüleyici (viewer)
- Tek paylaşımlı kullanıcı adı + şifre ile giriş yapar.
- Aynı anda birden fazla kişi aynı hesapla giriş yapabilir.
- Yalnızca fiyatları ve geçmişi görebilir.
- Kazanç / maliyet ekranlarına erişimi yoktur.

---

## Kimlik Doğrulama
- Giriş ekranı (login page) — kullanıcı adı + şifre.
- Roller Supabase üzerinde yönetilir: `admin`, `editor`, `viewer`.
- Viewer hesabı çoklu oturum açmaya izin verir.

---

## Fiyat Yönetimi

### Kategori & Ürün Yapısı
- Hiyerarşi: **Kategori > Ürün**
- Kategori adı aynı zamanda bir ürünü de temsil edebilir (ürün listesi olmadan da kullanılabilir).
- Yeni kategori ve ürün kermes günü hızlıca eklenebilir.
- Kategori veya ürün adı girildiğinde sistem otomatik olarak uygun bir **emoji** atar. Emoji bulunamazsa ad yeterlidir.

### Fiyat Güncelleme
- Editörler istediği zaman fiyat güncelleyebilir.
- Her güncelleme fiyat geçmişine eklenir.
- Ekranda **tüm geçmiş fiyat zinciri** gösterilir: eski fiyatlar üzeri çizili (~~120 TL~~), en güncel fiyat belirgin şekilde öne çıkar.

### Refresh Mekanizması
- Otomatik güncelleme yoktur.
- Ekranda bir **"Yenile" butonu** bulunur.
- Butona basıldığında en güncel fiyatlar Supabase'den çekilir.
- Cache sorunu yaşanmaması için Telegram Mini App webview tercih nedenidir.

---

## Finansal Takip

### Kazanç
- Editörler tarafından manuel olarak girilir.
- Para birimi seçeneği: **TL / USD / EUR** (ayrı ayrı girilebilir).
- Kazanç girişi kermes bazında (etkinlik bazında) tutulur.

### Maliyet
- Yalnızca **TL** cinsinden girilir.
- Editörler yeni maliyet kalemi oluşturabilir: **kalem adı + tutar**.
- Maliyet kalemleri güncellenebilir.

---

## Kermes Arşivi
- Her kermes ayrı bir **etkinlik (event)** olarak kaydedilir (örn. "Kermes 2026").
- Geçmiş etkinlikler arşivlenir ve görüntülenebilir.
- Yeni kermeste yeni etkinlik açılır; önceki veriler korunur.

---

## Mobil Öncelik
- Uygulama yalnızca **telefon** üzerinden kullanılacak şekilde tasarlanmalıdır.
- Masaüstü uyumu zorunlu değildir.
- Tüm UI bileşenleri mobil dokunmatik kullanıma uygun olmalıdır.

---

## Geliştirme Notları
- Bu dosya geliştirme sürecinde yeni kararlar netleştikçe güncellenmelidir.
- Özellikle şu konular netleşince buraya eklenecektir:
  - Telegram bot adı ve webhook yapısı
  - Supabase tablo şemaları (netleşince buraya ekle)
  - Deployment URL ve ortam değişkenleri
