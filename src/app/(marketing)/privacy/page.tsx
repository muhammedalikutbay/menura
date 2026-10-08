import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "KVKK aydınlatma metni",
  description: "Menura kullanıcılarının kişisel verilerinin 6698 sayılı KVKK kapsamında nasıl işlendiğine dair aydınlatma metni.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Veri sorumlusu",
    body: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla [Şirket unvanı / işletme adı] (“Menura”) tarafından aşağıda açıklanan kapsamda işlenmektedir.",
      "Adres: [Açık adres] · E-posta: [İletişim e-posta adresi]",
    ],
  },
  {
    title: "İşlenen kişisel veriler",
    body: ["Hizmeti kullanırken aşağıdaki veri kategorileri işlenebilir:"],
    items: [
      "Kimlik ve iletişim bilgileri: ad soyad, e-posta adresi.",
      "Hesap güvenliği bilgileri: şifre (yalnızca geri döndürülemez biçimde özetlenmiş olarak), oturum bilgileri.",
      "İşletme bilgileri: restoran adı, menü adresi, açıklama, telefon, adres, sosyal medya ve internet sitesi bilgileri, yüklediğiniz logo ve görseller, menü içerikleri.",
      "İşlem ve teknik güvenlik kayıtları: IP adresi, tarayıcı ve cihaz bilgisi, oturum ve hız sınırlama kayıtları.",
      "Menü görüntülenme sayaçları: yayındaki menünüzün günlük toplam açılış sayısı. Bu sayaçlar menüyü açan ziyaretçileri tanımlayan bilgi içermez.",
    ],
  },
  {
    title: "Kişisel verilerin işlenme amaçları",
    body: ["Kişisel verileriniz yalnızca aşağıdaki amaçlarla işlenir:"],
    items: [
      "Hesabınızı oluşturmak, kimliğinizi doğrulamak ve hizmeti sunmak,",
      "Menünüzü yayınlamak, QR kodunuzu üretmek ve istatistikleri göstermek,",
      "Hesap ve işlem güvenliğini sağlamak, kötüye kullanımı önlemek,",
      "Destek taleplerinizi yanıtlamak ve hizmetle ilgili bildirimler göndermek,",
      "Yasal yükümlülüklerin yerine getirilmesi.",
    ],
  },
  {
    title: "Hukuki sebepler",
    body: [
      "Verileriniz KVKK madde 5/2 kapsamında; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (c), veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (ç) ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için zorunlu olması (f) hukuki sebeplerine dayanılarak işlenir.",
    ],
  },
  {
    title: "Verilerin aktarılması",
    body: [
      "Kişisel verileriniz, hizmetin sunulması için gerekli olduğu ölçüde barındırma, veri tabanı ve e-posta gönderim hizmeti sağlayıcılarına ve yetkili kamu kurum ve kuruluşlarına aktarılabilir. Hizmet sağlayıcıların sunucuları yurt dışında bulunuyorsa aktarım KVKK madde 9 hükümlerine uygun olarak gerçekleştirilir.",
      "Kişisel verileriniz pazarlama amacıyla üçüncü kişilere satılmaz.",
    ],
  },
  {
    title: "Saklama süresi",
    body: [
      "Verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama süreleri kadar muhafaza edilir. Hesabınız kapatıldığında menü içerikleriniz ve görselleriniz silinir; yasal saklama yükümlülüğü bulunan kayıtlar yükümlülük süresince saklanır.",
    ],
  },
  {
    title: "Çerezler ve benzeri teknolojiler",
    body: [
      "Panele giriş yaptığınızda oturumunuzu sürdürmek için zorunlu bir oturum çerezi kullanılır. Bu çerez olmadan hizmet sunulamaz. Menü ziyaretçileri için reklam veya takip amaçlı çerez kullanılmaz.",
    ],
  },
  {
    title: "KVKK madde 11 kapsamındaki haklarınız",
    body: ["Veri sahibi olarak aşağıdaki haklara sahipsiniz:"],
    items: [
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,",
      "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
      "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
      "Eksik veya yanlış işlenmişse düzeltilmesini isteme,",
      "KVKK madde 7 çerçevesinde silinmesini veya yok edilmesini isteme ve bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
      "İşlenen verilerin otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme,",
      "Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
    ],
  },
  {
    title: "Başvuru yöntemi",
    body: [
      "Haklarınıza ilişkin taleplerinizi [İletişim e-posta adresi] adresine veya yukarıda belirtilen adrese yazılı olarak iletebilirsiniz. Başvurunuz, niteliğine göre en geç otuz gün içinde sonuçlandırılır.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="KVKK aydınlatma metni"
      intro="Menura’yı kullanırken kişisel verilerinizin hangi amaçlarla, nasıl işlendiğini ve haklarınızı bu metinde bulabilirsiniz."
      sections={SECTIONS}
    />
  );
}
