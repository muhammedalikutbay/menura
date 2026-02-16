import { Category } from "@/types/category";
import { Product } from "@/types/product";

const now = Date.now();

export const INITIAL_CATEGORIES: Category[] = [
    {
        id: "cat-1",
        name: "Başlangıçlar",
        description: "İştahınızı açacak özenle seçilmiş lezzetler.",
        image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-2",
        name: "Ana Yemekler",
        description: "Usta ellerden çıkan geleneksel ve modern ana yemekler.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-3",
        name: "Burgerler",
        description: "Sulu köfteler ve taze malzemelerle hazırlanan gurme burgerler.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
        order: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-4",
        name: "Pizzalar",
        description: "İnce hamurlu, bol malzemeli taş fırın pizzaları.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
        order: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-5",
        name: "Tatlılar",
        description: "Gününüzü tatlandıracak ev yapımı tatlı seçenekleri.",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800",
        order: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-6",
        name: "Soğuk İçecekler",
        description: "Ferahlatıcı meşrubatlar ve taze sıkılmış meyve suları.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
        order: 6,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-7",
        name: "Kahve & Çay",
        description: "Özel harman kahveler ve demlleme çay çeşitleri.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
        order: 7,
        isActive: true,
        createdAt: now,
        updatedAt: now
    },
    {
        id: "cat-8",
        name: "Çocuk Menüsü",
        description: "Minik misafirlerimiz için hem eğlenceli hem besleyici tabaklar.",
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800",
        order: 8,
        isActive: true,
        createdAt: now,
        updatedAt: now
    }
];

export const INITIAL_PRODUCTS: Product[] = [
    // Başlangıçlar (cat-1)
    {
        id: "p1-1", categoryId: "cat-1", name: "Bruschetta", price: 110, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Domates, sarımsak ve taze fesleğenli kızarmış ekmek dilimleri.",
        image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-2", categoryId: "cat-1", name: "Kalamar Tava", price: 290, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Tarator sos eşliğinde çıtır kalamar halkaları.",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-3", categoryId: "cat-1", name: "Mantar Dolması", price: 155, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Üç çeşit peynirle doldurulmuş fırın mantar.",
        image: "https://images.unsplash.com/photo-1549462980-6a03f72c3f05?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-4", categoryId: "cat-1", name: "Paçanga Böreği", price: 145, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Pastırmalı ve kaşar peynirli fırınlanmış çıtır börek.",
        image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-5", categoryId: "cat-1", name: "Humus", price: 95, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Pastırma ve sıcak tereyağı ile servis edilen klasik humus.",
        image: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-6", categoryId: "cat-1", name: "Izgara Kuşkonmaz", price: 180, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Parmesan ve balzamik sirke ile lezzetlendirilmiş.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-7", categoryId: "cat-1", name: "Çıtır Karides", price: 320, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Acı tatlı sos eşliğinde panko kaplı karidesler.",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p1-8", categoryId: "cat-1", name: "Peynir Tabağı", price: 350, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Yerli ve yabancı peynir çeşitleri, meyvelerle birlikte.",
        image: "https://images.unsplash.com/photo-1521664121980-080c90472f8a?auto=format&fit=crop&q=80&w=800"
    },

    // Ana Yemekler (cat-2)
    {
        id: "p2-1", categoryId: "cat-2", name: "Antrikot Izgara", price: 580, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Patates püresi ve ızgara sebzeler eşliğinde.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-2", categoryId: "cat-2", name: "Somon Izgara", price: 460, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Kuşkonmaz ve limonlu tereyağı sosu ile.",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-3", categoryId: "cat-2", name: "Kuzu İncik", price: 520, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Ağır ateşte pişmiş, patlıcan beğendi üzerinde.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-4", categoryId: "cat-2", name: "Tavuk Schnitzel", price: 320, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Alman usulü patates salatası ve roka ile.",
        image: "https://images.unsplash.com/photo-1594903328217-547c1ac511ad?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-5", categoryId: "cat-2", name: "Lazanya", price: 310, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Bolonez soslu, beşamel ve bol peynirli katlar.",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-6", categoryId: "cat-2", name: "Mantar Risotto", price: 340, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Trüf yağı ve taze yabani mantarlar ile.",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-7", categoryId: "cat-2", name: "Fırın Ördek", price: 650, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Portakal sosu ve karamelize soğanlı patates ile.",
        image: "https://images.unsplash.com/photo-1518492101163-c6ec088f1728?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p2-8", categoryId: "cat-2", name: "Deniz Mahsüllü Makarna", price: 420, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Karides, kalamar ve midye ile linguine makarna.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800"
    },

    // Burgerler (cat-3)
    {
        id: "p3-1", categoryId: "cat-3", name: "Classic Burger", price: 280, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "180gr köfte, marul, domates, turşu ve özel sos.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-2", categoryId: "cat-3", name: "Cheeseburger", price: 310, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Ekstra cheddar peyniri ve karamelize soğan ile.",
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-3", categoryId: "cat-3", name: "Mushroom Swiss", price: 330, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Izgara mantar ve emmental peyniri birlikteliği.",
        image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-4", categoryId: "cat-3", name: "BBQ Bacon Burger", price: 350, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Dana füme et, BBQ sos ve çıtır soğan halkası.",
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-5", categoryId: "cat-3", name: "Crispy Chicken", price: 260, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Panelenmiş çıtır tavuk göğsü ve coleslaw salata.",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-6", categoryId: "cat-3", name: "Veggie Burger", price: 270, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Falafel ve sebze karışımı köfte, humus ile.",
        image: "https://images.unsplash.com/photo-1585238341267-4c7b271d5c2e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-7", categoryId: "cat-3", name: "Mexico Spicy", price: 320, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Jalapeno biberi ve acı sriracha sos ile.",
        image: "https://images.unsplash.com/photo-1582196016295-f8c1adbf400d?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p3-8", categoryId: "cat-3", name: "Double Smash", price: 420, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "2 adet 100gr ince köfte, bol cheddar ve soğan.",
        image: "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&q=80&w=800"
    },

    // Pizzalar (cat-4)
    {
        id: "p4-1", categoryId: "cat-4", name: "Margherita", price: 240, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Mozzarella peyniri, domates sos ve taze fesleğen.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-2", categoryId: "cat-4", name: "Pepperoni", price: 320, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Dana pepperoni dilimleri ve bol mozzarella.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-3", categoryId: "cat-4", name: "Quattro Formaggi", price: 340, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Dört çeşit peynir: Mozzarella, Parmesan, Rokfor, Gravyer.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-4", categoryId: "cat-4", name: "Dört Mevsim", price: 310, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Mantar, enginar, zeytin ve dana jambon.",
        image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-5", categoryId: "cat-4", name: "Sebzeli Pizza", price: 290, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Kabak, patlıcan, biber, mısır ve taze kekik.",
        image: "https://images.unsplash.com/photo-1571066811444-1b2170d90d8a?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-6", categoryId: "cat-4", name: "Barbekü Tavuk", price: 330, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Izgara tavuk parçaları, BBQ sos ve kırmızı soğan.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-7", categoryId: "cat-4", name: "Deniz Mahsüllü", price: 390, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Karides, midye, tuna ve taze kişniş.",
        image: "https://images.unsplash.com/photo-1555072956-7758afb20e8f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p4-8", categoryId: "cat-4", name: "Anadolu Pizza", price: 360, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Sucuk, pastırma, sivri biber ve beyaz peynir.",
        image: "https://images.unsplash.com/photo-1593504049359-7b7d92c71856?auto=format&fit=crop&q=80&w=800"
    },

    // Tatlılar (cat-5)
    {
        id: "p5-1", categoryId: "cat-5", name: "San Sebastian Cheesecake", price: 185, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Akışkan kıvamlı, yanında sütlü çikolata sos ile.",
        image: "https://images.unsplash.com/photo-1505253504418-4f9746938a95?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-2", categoryId: "cat-5", name: "Tiramisu", price: 160, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Mascarpone peynirli ve espresso ıslatmalı klasik İtalyan tatlısı.",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-3", categoryId: "cat-5", name: "Çikolatalı Sufle", price: 175, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Sıcak servis edilen, akışkan çikolatalı kek.",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-4", categoryId: "cat-5", name: "Magnolia", price: 140, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Muzlu, bisküvili ve ipeksi kremalı hafif sütlü tatlı.",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-5", categoryId: "cat-5", name: "Profiterol", price: 155, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Taze hamur topları, krema dolgusu ve yoğun çikolata sos.",
        image: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-6", categoryId: "cat-5", name: "Fırın Sütlaç", price: 110, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Kızarmış üst yüzey, fındık parçaları eşliğinde.",
        image: "https://images.unsplash.com/photo-1590473031965-05e81084b6bc?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-7", categoryId: "cat-5", name: "Baklava Tabağı", price: 220, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Gaziantep fıstıklı baklava, Maraş dondurması ile.",
        image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p5-8", categoryId: "cat-5", name: "Meyve Tabağı", price: 190, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Mevsim meyvelerinden oluşan taze seçenekler.",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
    },

    // Soğuk İçecekler (cat-6)
    {
        id: "p6-1", categoryId: "cat-6", name: "Ev Yapımı Limonata", price: 85, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Taze nane ve çilek seçenekleriyle.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-2", categoryId: "cat-6", name: "Taze Portakal Suyu", price: 95, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Günlük taze sıkılmış.",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-3", categoryId: "cat-6", name: "Cola / Fanta / Sprite", price: 65, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "330ml kutu seçenekleri.",
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-4", categoryId: "cat-6", name: "Ayran", price: 45, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Naneli veya sade koyu kıvamlı yayık ayran.",
        image: "https://images.unsplash.com/photo-1524316069903-49033282172f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-5", categoryId: "cat-6", name: "Churchill", price: 75, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Limon suyu, soda ve tuz karışımı ferahlık.",
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-6", categoryId: "cat-6", name: "Iced Latte", price: 110, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Soğuk sütlü ve buzlu espresso.",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-7", categoryId: "cat-6", name: "Detoks Suyu", price: 120, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Yeşil elma, salatalık, ıspanak ve zencefil.",
        image: "https://images.unsplash.com/photo-1610970882799-a476906bbbb0?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p6-8", categoryId: "cat-6", name: "Berry Smoothie", price: 135, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Yaban mersini, çilek ve yoğurt bazlı.",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=800"
    },

    // Kahve & Çay (cat-7)
    {
        id: "p7-1", categoryId: "cat-7", name: "Türk Kahvesi", price: 75, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Yanında lokum ve su ile geleneksel servis.",
        image: "https://images.unsplash.com/photo-1544787210-2213d44ad53e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-2", categoryId: "cat-7", name: "Espresso", price: 70, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Yoğun ve güçlü aromalı tek shot.",
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-3", categoryId: "cat-7", name: "Americano", price: 85, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "Espresso üzerine sıcak su ilaveli.",
        image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-4", categoryId: "cat-7", name: "Cappuccino", price: 105, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Espresso, sıcak süt ve bol süt köpüğü.",
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-5", categoryId: "cat-7", name: "Flat White", price: 115, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Double shot espresso ve pürüzsüz süt kreması.",
        image: "https://images.unsplash.com/photo-1574608443588-466034f7151f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-6", categoryId: "cat-7", name: "Bitki Çayları", price: 80, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Ihlamur, Adaçayı, Melisa veya Papatya seçenekleri.",
        image: "https://images.unsplash.com/photo-1544787210-2213d44ad53e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-7", categoryId: "cat-7", name: "Sıcak Çikolata", price: 130, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Eritilmiş Belçika çikolatası ve marshmallow ile.",
        image: "https://images.unsplash.com/photo-1444418185997-1145ea0247cc?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p7-8", categoryId: "cat-7", name: "Demleme Çay", price: 35, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Taze demlenmiş Rize siyah çayı.",
        image: "https://images.unsplash.com/photo-1544787210-2213d44ad53e?auto=format&fit=crop&q=80&w=800"
    },

    // Çocuk Menüsü (cat-8)
    {
        id: "p8-1", categoryId: "cat-8", name: "Mini Köfte Tabağı", price: 195, isAvailable: true, order: 1, createdAt: now, updatedAt: now,
        description: "Patates kızartması ve yoğurt ile.",
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-2", categoryId: "cat-8", name: "Spagetti Bolonez", price: 175, isAvailable: true, order: 2, createdAt: now, updatedAt: now,
        description: "Çocuklar için ölçeklendirilmiş kıymalı makarna.",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-3", categoryId: "cat-8", name: "Nugget & Chips", price: 165, isAvailable: true, order: 3, createdAt: now, updatedAt: now,
        description: "6 adet çıtır tavuk ve parmak patates.",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-4", categoryId: "cat-8", name: "Mini Pizza", price: 180, isAvailable: true, order: 4, createdAt: now, updatedAt: now,
        description: "Sadece peynir ve domates soslu çocuk pizzası.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-5", categoryId: "cat-8", name: "Sosisli Sandviç", price: 145, isAvailable: true, order: 5, createdAt: now, updatedAt: now,
        description: "Haşlanmış sosis ve yanında patates tava.",
        image: "https://images.unsplash.com/photo-1541214159679-d45769ca8965?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-6", categoryId: "cat-8", name: "Izgara Tavuk Şiş", price: 185, isAvailable: true, order: 6, createdAt: now, updatedAt: now,
        description: "Pirinç pilavı ve sotelenmiş mevsim sebzeleri.",
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-7", categoryId: "cat-8", name: "Balık Kroket", price: 210, isAvailable: true, order: 7, createdAt: now, updatedAt: now,
        description: "Kılçıksız levrekten hazırlanmış çıtır toplar.",
        image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "p8-8", categoryId: "cat-8", name: "Gülümseyen Patatesler", price: 110, isAvailable: true, order: 8, createdAt: now, updatedAt: now,
        description: "Yanında ketçap ve mayonez ile eğlenceli patatesler.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800"
    }
];
