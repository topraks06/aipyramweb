
# Admin Panel Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### Adım 1: Admin Kullanıcısını Oluştur

İlk kez admin paneline erişmek için önce admin kullanıcısını oluşturmanız gerekiyor:

1. Tarayıcınızda şu adresi açın: `http://localhost:3000/admin/setup`
2. "Admin Kullanıcısını Oluştur" butonuna tıklayın
3. Kurulum tamamlandığında otomatik olarak giriş sayfasına yönlendirileceksiniz

### Adım 2: Giriş Yap

Kurulum tamamlandıktan sonra:

1. `http://localhost:3000/admin/login` adresine gidin
2. Aşağıdaki bilgilerle giriş yapın:
   - **E-posta:** hakantoprak71@gmail.com
   - **Şifre:** oyaalya123

## 📋 Giriş Bilgileri

```
E-posta: hakantoprak71@gmail.com
Şifre: oyaalya123
```

## 🔧 Sorun Giderme

### "Kullanıcı zaten mevcut" hatası alıyorsanız:
- Bu normal! Direkt giriş sayfasına gidin ve giriş yapın.

### Giriş yapamıyorsanız:
1. `/admin/setup` sayfasına tekrar gidin
2. Kurulum butonuna tekrar tıklayın
3. Ardından giriş yapmayı deneyin

### Supabase bağlantı hatası alıyorsanız:
- `.env.local` dosyasında Supabase bilgilerinin doğru olduğundan emin olun
- Sunucuyu yeniden başlatın: `pnpm dev`

## 🎯 Admin Panel Özellikleri

Admin paneline giriş yaptıktan sonra şunlara erişebilirsiniz:

- **Dashboard:** 270 domain ve ajan istatistikleri
- **Domain Yönetimi:** Tüm domainleri görüntüle ve yönet
- **Ajan Yönetimi:** AI ajanlarını kontrol et
- **Sektör Yönetimi:** 12 sektör kategorisini düzenle
- **Görev Yönetimi:** Otomasyon görevlerini izle
- **Aloha Kontrol:** Dijital ikiz komutları
- **Otomasyon Kuralları:** Otomatik görev kuralları oluştur

## 🔐 Güvenlik Notları

- İlk kurulumdan sonra `/admin/setup` sayfasını devre dışı bırakabilirsiniz
- Şifrenizi düzenli olarak değiştirin
- Admin paneline sadece güvenli ağlardan erişin

## 📞 Destek

Herhangi bir sorun yaşarsanız, lütfen sistem yöneticisiyle iletişime geçin.
