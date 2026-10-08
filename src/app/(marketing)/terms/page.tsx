import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Kullanım koşulları",
  description: "Menura hizmetinin kullanım koşulları.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: LegalSection[] = [
  {
    title: "Taraflar ve kapsam",
    body: [
      "Bu koşullar, [Şirket unvanı / işletme adı] (“Menura”) ile Menura hizmetini kullanan işletme veya kişi (“Kullanıcı”) arasındaki ilişkiyi düzenler. Hesap oluşturarak veya hizmeti kullanarak bu koşulları kabul etmiş olursunuz.",
    ],
  },
  {
    title: "Hizmetin tanımı",
    body: [
      "Menura; restoran ve kafelerin dijital menü hazırlamasını, bu menüyü bir bağlantı ve QR kod ile paylaşmasını ve menü görüntülenme istatistiklerini izlemesini sağlayan çevrimiçi bir yazılım hizmetidir. Hizmetin kapsamı ve özellikleri zaman içinde değişebilir.",
    ],
  },
  {
    title: "Hesap ve güvenlik",
    body: [
      "Hesap oluştururken doğru ve güncel bilgi vermekle yükümlüsünüz. Şifrenizin gizliliğinden ve hesabınız üzerinden yapılan işlemlerden siz sorumlusunuz. Hesabınızın yetkisiz kullanıldığından şüphelenirseniz derhal bize bildirmelisiniz.",
    ],
  },
  {
    title: "Menü içeriği ve sorumluluk",
    body: [
      "Menünüzde yer alan ürün adları, açıklamalar, fiyatlar, alerjen ve diyet bilgileri, görseller ve diğer tüm içeriklerin doğruluğundan, güncelliğinden ve mevzuata uygunluğundan yalnızca Kullanıcı sorumludur. Alerjen ve içerik bilgilerinin eksik veya hatalı olmasından doğabilecek zararlardan Menura sorumlu tutulamaz.",
      "Üçüncü kişilerin haklarını ihlal eden, hukuka veya genel ahlaka aykırı içerik yüklemeyeceğinizi kabul edersiniz.",
    ],
  },
  {
    title: "Kabul edilemez kullanım",
    body: ["Aşağıdaki davranışlar yasaktır:"],
    items: [
      "Hizmeti hukuka aykırı amaçlarla kullanmak,",
      "Hizmetin güvenliğini veya performansını bozmaya yönelik girişimlerde bulunmak,",
      "Başka kullanıcıların hesaplarına veya verilerine yetkisiz erişmeye çalışmak,",
      "Otomatik araçlarla hizmete aşırı yük bindirmek veya menü görüntülenme sayaçlarını yapay biçimde artırmak.",
    ],
  },
  {
    title: "Hizmet sürekliliği",
    body: [
      "Hizmetin kesintisiz ve hatasız çalışması için makul özen gösterilir; ancak bakım, güncelleme veya üçüncü taraf hizmet sağlayıcılardan kaynaklanan kesintiler olabilir. Menura, hizmeti belirli bir süreyle veya kesintisiz sunmayı taahhüt etmez.",
    ],
  },
  {
    title: "Fikri mülkiyet",
    body: [
      "Menura yazılımı, arayüzü, adı ve logosu üzerindeki haklar Menura’ya aittir. Kullanıcı, yüklediği içeriklerin haklarını elinde tutar ve bu içeriklerin hizmet kapsamında barındırılması ve görüntülenmesi için Menura’ya sınırlı bir kullanım izni verir.",
    ],
  },
  {
    title: "Sorumluluğun sınırlandırılması",
    body: [
      "Yürürlükteki mevzuatın izin verdiği ölçüde Menura, hizmetin kullanımından veya kullanılamamasından doğan dolaylı zararlardan, kâr kaybından ve veri kaybından sorumlu değildir. Kullanıcı, menü içeriğinin yedeğini almaktan sorumludur.",
    ],
  },
  {
    title: "Fesih",
    body: [
      "Kullanıcı, hesabının kapatılmasını dilediği zaman talep edebilir. Menura, bu koşulların ihlali hâlinde hesabı askıya alma veya kapatma hakkını saklı tutar. Hesap kapatıldığında menünüz yayından kalkar ve QR kodunuz çalışmaz.",
    ],
  },
  {
    title: "Değişiklikler",
    body: [
      "Bu koşullar zaman zaman güncellenebilir. Önemli değişiklikler hizmet içinden veya e-posta ile duyurulur. Değişiklikten sonra hizmeti kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.",
    ],
  },
  {
    title: "Uygulanacak hukuk ve yetkili mahkeme",
    body: [
      "Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda [Şehir] mahkemeleri ve icra daireleri yetkilidir.",
      "İletişim: [İletişim e-posta adresi]",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Kullanım koşulları"
      intro="Menura’yı kullanmadan önce lütfen bu koşulları okuyun."
      sections={SECTIONS}
    />
  );
}
