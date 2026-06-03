const EUR_TO_TRY = 38.5;
const VITO_CONSUMPTION = 8.0;

const COUNTRY_DATA = {
    TR: { name: 'Türkiye', flag: '🇹🇷', diesel: 1.25, foodPP: 5, hotelFamily: 50 },
    BG: { name: 'Bulgaristan', flag: '🇧🇬', diesel: 1.71, foodPP: 7, hotelFamily: 45 },
    RS: { name: 'Sırbistan', flag: '🇷🇸', diesel: 1.90, foodPP: 7, hotelFamily: 55 },
    HU: { name: 'Macaristan', flag: '🇭🇺', diesel: 1.73, foodPP: 9, hotelFamily: 70 },
    SK: { name: 'Slovakya', flag: '🇸🇰', diesel: 1.65, foodPP: 10, hotelFamily: 65 },
    CZ: { name: 'Çekya', flag: '🇨🇿', diesel: 1.55, foodPP: 10, hotelFamily: 70 },
    AT: { name: 'Avusturya', flag: '🇦🇹', diesel: 1.88, foodPP: 15, hotelFamily: 120 },
    DE: { name: 'Almanya', flag: '🇩🇪', diesel: 1.93, foodPP: 14, hotelFamily: 110 },
    NL: { name: 'Hollanda', flag: '🇳🇱', diesel: 2.30, foodPP: 16, hotelFamily: 130 },
    IT: { name: 'İtalya', flag: '🇮🇹', diesel: 1.75, foodPP: 13, hotelFamily: 100 },
    GR: { name: 'Yunanistan', flag: '🇬🇷', diesel: 1.70, foodPP: 10, hotelFamily: 70 },
    SEA: { name: 'Denizde', flag: '⛴️', diesel: 0, foodPP: 0, hotelFamily: 0 }
};

const TOLL_COSTS = [
    { country: 'TR', name: 'Türkiye HGS (Niğde-Ankara-KMO-Kapıkule)', cost: 32, note: 'Gidiş-dönüş otoyol + köprü geçişleri' },
    { country: 'BG', name: 'Bulgaristan e-Vinyeti', cost: 16, note: '2x haftalık vinyetler (gidiş+dönüş)' },
    { country: 'RS', name: 'Sırbistan Otoyol Gişe', cost: 15, note: 'Sadece gidiş (dönüşte Sırbistan yok)' },
    { country: 'HU', name: 'Macaristan e-Matrica', cost: 18, note: '10 günlük (gidişte)' },
    { country: 'SK', name: 'Slovakya e-Známka', cost: 16, note: '10 günlük (Budapeşte→Prag arası)' },
    { country: 'CZ', name: 'Çekya e-Známka', cost: 16, note: '10 günlük' },
    { country: 'DE', name: 'Almanya Otoyol', cost: 0, note: 'Binek araç ücretsiz ✓' },
    { country: 'NL', name: 'Hollanda', cost: 0, note: 'Ücretsiz ✓' },
    { country: 'AT', name: 'Avusturya Vinyeti + Brenner', cost: 24, note: '10 günlük vinyetler + Brenner geçişi' },
    { country: 'IT', name: 'İtalya Autostrada', cost: 50, note: 'Brenner→Verona→Venedik→Ancona gişeleri' },
    { country: 'GR', name: 'Yunanistan Egnatia Odos', cost: 15, note: 'İgoumenitsa→İpsala arası' }
];

const DAYS_OF_WEEK = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function getDateStr(dayOffset) {
    const start = new Date(2026, 5, 15);
    start.setDate(start.getDate() + dayOffset);
    return `${start.getDate()} ${MONTHS[start.getMonth()]} ${DAYS_OF_WEEK[start.getDay()]}`;
}

let routeStops = [
    {
        id: 1, city: 'Konya', country: 'TR', lat: 37.87, lng: 32.49,
        type: 'start', dayIndex: 0, stayNights: 0, distToNext: 840,
        driveTime: '~9 saat',
        notes: '06:00 hareket. Ankara-Niğde Otoyolu → Ankara Çevre Yolu → Bolu-Düzce → Kuzey Marmara Otoyolu → Edirne → Kapıkule. İstanbul trafiğine GİRMEYİN, KMO ile bypass edin.',
        tips: [
            { text: 'HGS bakiyesini kontrol edin', type: 'warn' },
            { text: 'Bolu\'da mola + kahvaltı', type: 'good' },
            { text: 'Türkiye\'de full depo yapın (en ucuz yakıt)', type: 'good' },
            { text: 'KMO çıkışı Kınalı-Edirne istikameti', type: '' }
        ],
        direction: 'outbound'
    },
    {
        id: 2, city: 'Kapıkule Sınır', country: 'TR', lat: 41.68, lng: 26.56,
        type: 'border', dayIndex: 0, stayNights: 0, distToNext: 230,
        driveTime: '~2.5 saat',
        notes: 'Kapıkule\'ye ~15:00 varış tahmini. Pazartesi günü hafta sonuna göre daha az yoğun. Pasaport, ehliyet, ruhsat, green card, vize, çocuk nüfus cüzdanlarını hazır tutun.',
        tips: [
            { text: '⚠️ Yaz aylarında 1-3 saat bekleme', type: 'warn' },
            { text: 'AB EES biyometrik kontrol olabilir', type: 'warn' },
            { text: 'Bulgaristan vinyetini sınırda veya bgtoll.bg\'den alın', type: '' }
        ],
        direction: 'outbound'
    },
    {
        id: 3, city: 'Plovdiv', country: 'BG', lat: 42.15, lng: 24.75,
        type: 'overnight', dayIndex: 0, stayNights: 1, distToNext: 390,
        driveTime: '~4 saat',
        notes: '🛏️ İLK GECE. Sınırı geçtikten sonra ~2.5 saatte Plovdiv\'e ulaşırsınız (~19:00-20:00). Avrupa Kültür Başkenti. Eski şehir, Antik Roma tiyatrosu, Kapana bölgesi çok güzel. Çocuklar için Plovdiv Zoo yakında.',
        tips: [
            { text: 'Booking.com\'dan aile odası önceden ayırtın', type: '' },
            { text: 'Şehir merkezi yürüme mesafesinde otel seçin', type: 'good' },
            { text: 'Akşam yemeği çok uygun (~€30 aile)', type: 'good' }
        ],
        direction: 'outbound'
    },
    {
        id: 4, city: 'Belgrad', country: 'RS', lat: 44.79, lng: 20.45,
        type: 'overnight', dayIndex: 1, stayNights: 1, distToNext: 375,
        driveTime: '~4 saat',
        notes: '🛏️ 2. GECE. Sofya üzerinden Niş → Belgrad. Sırbistan gişelerinde EUR nakit kabul edilir. Kalemegdan Kalesi, Knez Mihailova caddesi, Ada Ciganlija gölü (çocuklar için mükemmel plaj). Ćevapčići mutlaka deneyin!',
        tips: [
            { text: 'Sırbistan Schengen DEĞİL, vize gerekmez', type: '' },
            { text: 'RSD veya EUR nakit bulundurun', type: 'warn' },
            { text: 'Ada Ciganlija çocuklar için süper', type: 'good' },
            { text: 'Yemek çok uygun (~€35 aile)', type: 'good' }
        ],
        direction: 'outbound'
    },
    {
        id: 5, city: 'Budapeşte', country: 'HU', lat: 47.50, lng: 19.04,
        type: 'sightseeing', dayIndex: 2, stayNights: 2, distToNext: 330,
        driveTime: '~3.5 saat',
        notes: '🛏️ 3-4. GECE (2 gece). Macaristan sınırında e-Matrica kontrolü var! Tuna kenarı akşam yürüyüşü, Zincir Köprü, Parlamento (gece ışıklandırması muhteşem), Széchenyi Termal Hamamı (çocuklar da girebilir), Buda Kalesi. Büyük Market Hali\'nde alışveriş.',
        tips: [
            { text: 'e-Matrica\'yı ematrica.nemzetiutdij.hu\'dan ÖNCEDEN alın', type: 'warn' },
            { text: 'Széchenyi termal çocuklarla harika', type: 'good' },
            { text: 'Tram 2 hattı Tuna kıyısı muhteşem tur', type: 'good' },
            { text: 'Langos deneyin (çocuklar bayılır)', type: 'good' }
        ],
        direction: 'outbound'
    },
    {
        id: 6, city: 'Prag', country: 'CZ', lat: 50.08, lng: 14.44,
        type: 'sightseeing', dayIndex: 4, stayNights: 2, distToNext: 500,
        driveTime: '~5 saat',
        notes: '🛏️ 5-6. GECE (2 gece). ⭐ PRAG DURAĞI! Bratislava üzerinden geçiş (Slovakya vinyeti gerekli). Karlov Köprüsü, Prag Kalesi, Eski Şehir Meydanı (Astronomik Saat), Petřín Tepesi (teleferik - çocuklar sever). Trdelník (baca böreği) deneyin!',
        tips: [
            { text: 'Slovakya e-Známka zorunlu (Budapeşte→Bratislava)', type: 'warn' },
            { text: 'Çekya e-Známka zorunlu', type: 'warn' },
            { text: 'Petřín teleferik + ayna labirenti çocuklara', type: 'good' },
            { text: 'Prag çok uygun fiyatlı (Batı Avrupa\'nın yarısı)', type: 'good' }
        ],
        direction: 'outbound'
    },
    {
        id: 7, city: 'Frankfurt', country: 'DE', lat: 50.11, lng: 8.68,
        type: 'overnight', dayIndex: 6, stayNights: 1, distToNext: 440,
        driveTime: '~4.5 saat',
        notes: '🛏️ 7. GECE. Prag → Nürnberg (A6) → Frankfurt. Almanya\'da otoyol ücretsiz! Römerberg meydanı, Main nehri kıyısı yürüyüşü. Sachsenhausen bölgesinde Apfelwein (elma şarabı). Nürnberg\'de mola verip kaleyi görebilirsiniz.',
        tips: [
            { text: 'Almanya otoyol ücretsiz ✓', type: 'good' },
            { text: 'Autobahn\'da hız sınırsız bölümler var, dikkat!', type: 'warn' },
            { text: 'Almanya\'da yakıt pahalı, Çekya\'da doldurun', type: 'good' }
        ],
        direction: 'outbound'
    },
    {
        id: 8, city: 'Rotterdam', country: 'NL', lat: 51.92, lng: 4.48,
        type: 'destination', dayIndex: 7, stayNights: 10, distToNext: 0,
        driveTime: '~4.5 saat',
        notes: '🎯 VARIŞ! 🛏️ 8-17. GECE (10 gece). Frankfurt → Köln (Dom Katedrali mola) → Rotterdam. Erasmus Köprüsü, Markthal, Küp Evler, Kinderdijk yel değirmenleri (UNESCO), Europoort. Amsterdam\'a tren 1.5 saat, Den Haag 30 dk. Airbnb ile konaklama otel\'den çok daha uygun!',
        tips: [
            { text: 'Airbnb/apart otel çok daha uygun (6 kişi)', type: 'good' },
            { text: 'Hollanda\'da yakıt en pahalı, Almanya\'da doldurun', type: 'warn' },
            { text: 'OV-chipkaart alın (toplu taşıma)', type: '' },
            { text: 'Kinderdijk çocuklarla günübirlik süper', type: 'good' },
            { text: 'Albert Heijn market ucuz alışveriş', type: 'good' }
        ],
        direction: 'outbound'
    },
    // === ROTTERDAM STAY ===
    {
        id: 9, city: 'Rotterdam Günleri', country: 'NL', lat: 51.92, lng: 4.48,
        type: 'destination', dayIndex: 8, stayNights: 0, distToNext: 0,
        driveTime: '',
        notes: '📅 ROTTERDAM\'DA 10 GÜN. Önerilen günübirlik geziler: 🚂 Amsterdam (tren 1.5 saat) — Anne Frank Evi, kanal turu, Rijksmuseum. 🚂 Den Haag (30 dk) — Madurodam minyatür parkı (çocuklar!), Scheveningen plajı. 🚗 Kinderdijk yel değirmenleri. 🚗 Delft — porselen fabrikası. 🚗 Gouda — peynir pazarı (Perşembe).',
        tips: [
            { text: 'Amsterdam NS treni ile gidin (park çok zor)', type: 'good' },
            { text: 'Madurodam çocuklar için 1 numara', type: 'good' },
            { text: 'Gouda peynir pazarı sadece Perşembe', type: '' },
            { text: 'Scheveningen plajı sıcak günler için', type: 'good' }
        ],
        direction: 'rotterdam'
    },
    // === DÖNÜŞ: İtalya üzerinden ===
    {
        id: 10, city: 'Rotterdam', country: 'NL', lat: 51.92, lng: 4.48,
        type: 'start', dayIndex: 18, stayNights: 0, distToNext: 600,
        driveTime: '~6 saat',
        notes: 'DÖNÜŞ BAŞLIYOR. Rotterdam → Köln → Frankfurt → Stuttgart. Almanya\'da son yakıt ikmali (Hollanda\'dan ucuz). Otobanda mola noktaları çocuklar için oyun alanı olan Raststätte\'ler.',
        tips: [
            { text: 'Almanya\'da yakıt ikmali yapın', type: 'good' },
            { text: 'Raststätte molalarında çocuk parkı var', type: 'good' }
        ],
        direction: 'return'
    },
    {
        id: 11, city: 'Münih', country: 'DE', lat: 48.14, lng: 11.58,
        type: 'overnight', dayIndex: 18, stayNights: 1, distToNext: 380,
        driveTime: '',
        notes: '🛏️ 18. GECE. Stuttgart → Münih (~220 km). Marienplatz, Englischer Garten (çocuklar için büyük park + sörf dalgası), BMW Welt (ücretsiz müze). Weisswurst + Breze (Bavyera kahvaltısı) deneyin.',
        tips: [
            { text: 'Englischer Garten çocuklarla muhteşem', type: 'good' },
            { text: 'BMW Welt ücretsiz giriş', type: 'good' },
            { text: 'Avusturya vinyetini Münih\'te online alın', type: 'warn' }
        ],
        direction: 'return'
    },
    {
        id: 12, city: 'Verona', country: 'IT', lat: 45.44, lng: 10.99,
        type: 'overnight', dayIndex: 19, stayNights: 1, distToNext: 120,
        driveTime: '~4 saat',
        notes: '🛏️ 19. GECE. Münih → Innsbruck → Brenner Geçidi (Alpler muhteşem manzara!) → Verona. İtalya\'ya hoş geldiniz! Romeo & Juliet balkonu, Arena di Verona (antik amfi tiyatro), Piazza delle Erbe. İtalyan gelato başlıyor!',
        tips: [
            { text: 'Brenner geçidi manzarası için mola verin', type: 'good' },
            { text: 'Avusturya vinyeti + Brenner özel ücreti', type: 'warn' },
            { text: 'İtalya otoyol gişelerde nakit veya kart', type: '' },
            { text: 'Gelato + pizza çocukların favorisi', type: 'good' }
        ],
        direction: 'return'
    },
    {
        id: 13, city: 'Venedik', country: 'IT', lat: 45.44, lng: 12.34,
        type: 'sightseeing', dayIndex: 20, stayNights: 1, distToNext: 300,
        driveTime: '~1.5 saat',
        notes: '🛏️ 20. GECE. Verona → Venedik (~1.5 saat). ⭐ VENEDİK! Aracı Mestre veya Tronchetto\'ya park edin, vaporetto ile adaya geçin. San Marco Meydanı, Rialto Köprüsü, gondol turu (pahalı ama bir kerelik), Murano cam adası. Çocuklar vaporetto (su otobüsü) ile çılgına döner!',
        tips: [
            { text: 'Arabayı Mestre\'de park edin (ada yasak)', type: 'warn' },
            { text: 'Vaporetto 24 saatlik aile bileti alın', type: 'good' },
            { text: 'Murano cam yapımı çocukları büyüler', type: 'good' },
            { text: 'Gondol ~€80-100/tekne (30 dk)', type: '' }
        ],
        direction: 'return'
    },
    {
        id: 14, city: 'Ancona (Feribot)', country: 'IT', lat: 43.62, lng: 13.52,
        type: 'border', dayIndex: 21, stayNights: 0, distToNext: 0,
        driveTime: '~3.5 saat',
        notes: '⛴️ FERİBOT! Venedik/Mestre → Ancona (~3.5 saat). Akşam feribotuna binin. Ancona → İgoumenitsa (Yunanistan). Sefer: ~16-20 saat gece feribotu. Operatörler: Minoan Lines, Anek Lines, Superfast. KABİN ALIN (6 kişi 2 kabin). Araç güvertede kalır.',
        tips: [
            { text: 'Feribot biletini ÖNCEDEN directferries.com\'dan alın', type: 'warn' },
            { text: '2 kabin alın (4+2 kişilik)', type: '' },
            { text: 'Feribotta restoran + güverte + çocuk alanı var', type: 'good' },
            { text: 'Araç yüksekliği Vito için sorun değil', type: 'good' }
        ],
        direction: 'return'
    },
    {
        id: 15, city: 'Denizde (Feribot)', country: 'SEA', lat: 40.50, lng: 18.00,
        type: 'border', dayIndex: 22, stayNights: 0, distToNext: 580,
        driveTime: 'Feribot ~16-20 saat',
        notes: '⛴️ DENİZDE. Adriyatik Denizi geçişi. Kabinde uyku, güvertede güneşlenme, çocuklar için oyun alanı. Sabah/öğlen İgoumenitsa\'ya varış. Yunanistan Schengen bölgesi.',
        tips: [
            { text: 'Kabinde priz var, cihazları şarj edin', type: '' },
            { text: 'Güvertede yunus görebilirsiniz!', type: 'good' },
            { text: 'Feribotta duty-free alışveriş', type: '' }
        ],
        direction: 'return'
    },
    {
        id: 16, city: 'Selanik', country: 'GR', lat: 40.63, lng: 22.94,
        type: 'overnight', dayIndex: 23, stayNights: 1, distToNext: 280,
        driveTime: '~4 saat',
        notes: '🛏️ 21. GECE. İgoumenitsa → Egnatia Odos otoyolu → Selanik (~4 saat). Beyaz Kule, sahil yürüyüşü, Ladadika bölgesi akşam yemeği. Çocuklar için Selanik Bilim Merkezi. Yunan mutfağı: Gyros, Souvlaki, Moussaka. Ucuz ve lezzetli!',
        tips: [
            { text: 'Egnatia Odos gişeli otoyol', type: '' },
            { text: 'Yunan yemekleri çok lezzetli ve uygun', type: 'good' },
            { text: 'Sahilde akşam yürüyüşü çocuklarla güzel', type: 'good' }
        ],
        direction: 'return'
    },
    {
        id: 17, city: 'İpsala Sınır', country: 'GR', lat: 40.92, lng: 26.38,
        type: 'border', dayIndex: 24, stayNights: 0, distToNext: 900,
        driveTime: '~3 saat',
        notes: 'Selanik → Kavala → Kipi/İpsala sınır kapısı (~3 saat). Schengen\'den çıkış. Türkiye\'ye giriş! Kapıkule\'den daha az yoğun. Edirne\'de Selimiye Camii + tava ciğer molası.',
        tips: [
            { text: 'İpsala Kapıkule\'den daha az beklemeli', type: 'good' },
            { text: 'Edirne\'de tava ciğer yemeyi unutmayın!', type: 'good' },
            { text: 'Türkiye\'ye girişte gümrük kontrolü', type: '' }
        ],
        direction: 'return'
    },
    {
        id: 18, city: 'Konya', country: 'TR', lat: 37.87, lng: 32.49,
        type: 'destination', dayIndex: 25, stayNights: 0, distToNext: 0,
        driveTime: '~9 saat',
        notes: '🏠 EVE DÖNÜŞ! İpsala → Keşan → Kuzey Marmara Otoyolu → Bolu → Ankara → Konya. Uzun son gün (~900 km). Sabah erken çıkın. Bolu\'da öğle molası. Toplam tur: ~7,800 km, 27 gün, 7 ülke!',
        tips: [
            { text: 'Son gün çok uzun, sabah erken hareket', type: 'warn' },
            { text: 'Bolu Dağı Tüneli\'nden geçin', type: '' },
            { text: '🎉 Toplam ~7,800 km tamamlandı!', type: 'good' }
        ],
        direction: 'return'
    }
];

const TIPS = [
    {
        icon: 'fas fa-child', color: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        title: 'Çocuklu Seyahat',
        text: 'Her 2-3 saatte mola verin. Tablet + kulaklık, boyama kitabı, atıştırmalık hazır olsun. Vito\'nun arkasına yastık/battaniye koyun, uzun yollarda uyurlar. Benzinliklerde çocuk WC\'si olan yerleri tercih edin.'
    },
    {
        icon: 'fas fa-gas-pump', color: 'var(--gradient-warm)',
        title: 'Yakıt Stratejisi',
        text: 'En ucuz: Türkiye (€1.25) ve Çekya (€1.55). En pahalı: Hollanda (€2.30). Sınır geçmeden MUTLAKA doldurun. Vito deposu ~75L, full depoyla ~900 km. Macaristan ve Sırbistan da nispeten uygun.'
    },
    {
        icon: 'fas fa-passport', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        title: 'Vize & Belgeler (6 kişi)',
        text: '4 yetişkin × €90 + 2 çocuk × €45 = €450 vize. Yanınızda: pasaportlar, vize, ehliyet, uluslararası ehliyet, ruhsat, green card, otel rezervasyonları, seyahat sigortası poliçesi, çocuk nüfus cüzdanları.'
    },
    {
        icon: 'fas fa-road', color: 'var(--gradient-accent)',
        title: 'Vinyetler & Geçişler',
        text: 'TÜM vinyetleri ÖNCEDEN online alın: Bulgaristan (bgtoll.bg), Macaristan (ematrica.nemzetiutdij.hu), Slovakya (eznamka.sk), Çekya (edalnice.cz), Avusturya (asfinag.at). Avusturya dijital vinyette 18 gün bekleme süresi var!'
    },
    {
        icon: 'fas fa-ship', color: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        title: 'İtalya-Yunanistan Feribotu',
        text: 'Ancona → İgoumenitsa: ~16-20 saat gece feribotu. directferries.com veya anek.gr\'den bilet alın. Araç + 6 kişi + 2 kabin: ~€500-700. Yaz sezonu ÖNCEden ayırtın! Minoan Lines, Anek Lines veya Superfast tercih edin.'
    },
    {
        icon: 'fas fa-bed', color: 'var(--gradient-primary)',
        title: 'Konaklama (6 kişi)',
        text: 'Booking.com\'dan "aile odası" veya Airbnb\'den "tüm ev" arayın. Balkanlar\'da (BG/RS) €40-55/gece, Orta Avrupa (HU/CZ) €60-80, Batı Avrupa (DE/NL) €100-130. Rotterdam\'da Airbnb otel\'den %40 ucuz!'
    },
    {
        icon: 'fas fa-car', color: 'linear-gradient(135deg, #64748b, #94a3b8)',
        title: 'Araç Hazırlığı (Vito)',
        text: 'Kontrol: motor yağı, antifriz, lastik basıncı, fren, farlar. Yanınızda: stepne, kriko, reflektör yelek (AB\'de HERKESe zorunlu), yangın söndürücü, ilk yardım çantası, çekme halatı, yedek ampul seti.'
    },
    {
        icon: 'fas fa-utensils', color: 'linear-gradient(135deg, #10b981, #f59e0b)',
        title: 'Yemek Bütçesi (6 kişi)',
        text: 'Market alışverişi her yerde en ucuz. Vito\'ya soğutucu çanta koyun (su, meyve, sandviç). Balkanlar\'da dışarıda yemek ~€30-40/aile. Batı Avrupa\'da market + ara sıra dışarı ~€60-80/gün. Lidl/Aldi/Biedronka ucuz marketler.'
    }
];

let map = null;
let markers = [];
let routeLines = [];
let currentView = 'outbound';
let editingStopId = null;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderTimeline();
    renderCosts();
    renderStopsList();
    renderTips();
    updateHeaderStats();
    bindEvents();
});

function initMap() {
    map = L.map('map', { center: [46.0, 16.0], zoom: 5, zoomControl: true, scrollWheelZoom: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    drawRoute();
}

function createCustomIcon(type) {
    const iconMap = { start: 'fa-flag-checkered', transit: 'fa-arrows-left-right', border: 'fa-passport', overnight: 'fa-moon', destination: 'fa-location-dot', sightseeing: 'fa-camera', ferry: 'fa-ship' };
    return L.divIcon({ className: 'custom-marker', html: `<div class="marker-pin ${type}"><i class="fas ${iconMap[type] || 'fa-circle'}"></i></div>`, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
}

function drawRoute() {
    markers.forEach(m => map.removeLayer(m));
    routeLines.forEach(l => map.removeLayer(l));
    markers = [];
    routeLines = [];

    const outbound = routeStops.filter(s => s.direction === 'outbound');
    const ret = routeStops.filter(s => s.direction === 'return');

    if (outbound.length > 1) {
        const line = L.polyline(outbound.map(s => [s.lat, s.lng]), { color: '#3b82f6', weight: 3, opacity: 0.8, smoothFactor: 1 }).addTo(map);
        routeLines.push(line);
    }
    if (ret.length > 1) {
        const line = L.polyline(ret.map(s => [s.lat, s.lng]), { color: '#f59e0b', weight: 3, opacity: 0.6, dashArray: '8, 8', smoothFactor: 1 }).addTo(map);
        routeLines.push(line);
    }

    const allStops = routeStops.filter(s => s.direction !== 'rotterdam');
    allStops.forEach(stop => {
        const marker = L.marker([stop.lat, stop.lng], { icon: createCustomIcon(stop.type) }).addTo(map);
        const country = COUNTRY_DATA[stop.country];
        marker.bindPopup(`<div style="font-family:'Inter',sans-serif;min-width:200px;padding:4px;"><h4 style="margin:0 0 6px;font-size:14px;">${country.flag} ${stop.city}</h4><p style="margin:0 0 4px;font-size:12px;color:#666;"><strong>${getDateStr(stop.dayIndex)}</strong> · ${country.name}</p>${stop.driveTime ? `<p style="margin:0;font-size:11px;color:#888;">🚗 ${stop.driveTime}</p>` : ''}</div>`, { maxWidth: 280 });
        markers.push(marker);
    });

    const allCoords = allStops.map(s => [s.lat, s.lng]);
    if (allCoords.length > 0) map.fitBounds(allCoords, { padding: [30, 30] });
}

function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    let stops;
    if (currentView === 'rotterdam') {
        stops = routeStops.filter(s => s.direction === 'rotterdam');
    } else {
        stops = routeStops.filter(s => s.direction === currentView);
    }
    container.innerHTML = '';

    stops.forEach((stop) => {
        const country = COUNTRY_DATA[stop.country];
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.dataset.id = stop.id;

        const tipsHtml = (stop.tips && stop.tips.length > 0) ? `<div class="timeline-tips">${stop.tips.map(t => `<span class="timeline-tip-tag ${t.type}">${t.text}</span>`).join('')}</div>` : '';

        item.innerHTML = `
            <div class="timeline-dot ${stop.type}"></div>
            <div class="timeline-card" onclick="focusOnStop(${stop.id})">
                <div class="timeline-card-header">
                    <span class="timeline-day">Gün ${stop.dayIndex + 1}</span>
                    <span class="timeline-date">${getDateStr(stop.dayIndex)}</span>
                </div>
                <div class="timeline-city"><span class="flag">${country.flag}</span> ${stop.city}
                    ${stop.stayNights > 0 ? `<span style="font-size:0.7rem;color:var(--accent-purple);margin-left:auto;">🛏️ ${stop.stayNights} gece</span>` : ''}
                </div>
                <div class="timeline-info">
                    ${stop.distToNext > 0 ? `<div class="timeline-info-item"><i class="fas fa-road"></i> ${stop.distToNext} km</div>` : ''}
                    ${stop.driveTime ? `<div class="timeline-info-item"><i class="fas fa-clock"></i> ${stop.driveTime}</div>` : ''}
                    ${stop.stayNights > 0 ? `<div class="timeline-info-item"><i class="fas fa-bed"></i> ~€${country.hotelFamily}/gece</div>` : ''}
                </div>
                ${stop.notes ? `<div class="timeline-notes">${stop.notes}</div>` : ''}
                ${tipsHtml}
            </div>
        `;
        container.appendChild(item);
    });
}

function focusOnStop(stopId) {
    const stop = routeStops.find(s => s.id === stopId);
    if (stop && map) {
        map.flyTo([stop.lat, stop.lng], 10, { duration: 1.5 });
        const allDisplayed = routeStops.filter(s => s.direction !== 'rotterdam');
        const idx = allDisplayed.findIndex(s => s.id === stopId);
        if (idx >= 0 && markers[idx]) markers[idx].openPopup();
    }
}

function calculateCosts() {
    const costs = { fuel: { items: [], total: 0 }, tolls: { items: [], total: 0 }, accommodation: { items: [], total: 0 }, food: { items: [], total: 0 }, visa: { items: [], total: 0 }, extras: { items: [], total: 0 } };

    // FUEL
    const countryDist = {};
    routeStops.forEach(s => { if (s.distToNext > 0) { countryDist[s.country] = (countryDist[s.country] || 0) + s.distToNext; } });
    Object.entries(countryDist).forEach(([code, dist]) => {
        const c = COUNTRY_DATA[code];
        if (!c || c.diesel === 0) return;
        const liters = (dist / 100) * VITO_CONSUMPTION;
        const cost = liters * c.diesel;
        costs.fuel.items.push({ label: `${c.flag} ${c.name} (${dist} km)`, value: cost });
        costs.fuel.total += cost;
    });

    // TOLLS
    TOLL_COSTS.forEach(t => {
        costs.tolls.items.push({ label: `${COUNTRY_DATA[t.country]?.flag || '🏁'} ${t.name}`, value: t.cost });
        costs.tolls.total += t.cost;
    });

    // ACCOMMODATION
    routeStops.filter(s => s.stayNights > 0).forEach(s => {
        const c = COUNTRY_DATA[s.country];
        const cost = s.stayNights * c.hotelFamily;
        costs.accommodation.items.push({ label: `${c.flag} ${s.city} (${s.stayNights} gece)`, value: cost });
        costs.accommodation.total += cost;
    });

    // FOOD (6 people)
    const daysByCountry = {};
    routeStops.forEach(s => {
        const days = Math.max(1, s.stayNights);
        daysByCountry[s.country] = (daysByCountry[s.country] || 0) + days;
    });
    Object.entries(daysByCountry).forEach(([code, days]) => {
        const c = COUNTRY_DATA[code];
        if (!c || c.foodPP === 0) return;
        const cost = days * c.foodPP * 6;
        costs.food.items.push({ label: `${c.flag} ${c.name} (${days} gün × 6 kişi)`, value: cost });
        costs.food.total += cost;
    });

    // VISA & INSURANCE & FERRY
    costs.visa.items.push({ label: '🛂 Schengen Vizesi (4 yetişkin)', value: 360 });
    costs.visa.items.push({ label: '🛂 Schengen Vizesi (2 çocuk)', value: 90 });
    costs.visa.items.push({ label: '📋 VFS Hizmet Bedeli (6 kişi)', value: 240 });
    costs.visa.items.push({ label: '🚗 Green Card Sigorta (1 ay)', value: 59 });
    costs.visa.items.push({ label: '🏥 Seyahat Sigortası (6 kişi)', value: 180 });
    costs.visa.items.push({ label: '⛴️ Feribot: Ancona→İgoumenitsa', value: 600 });
    costs.visa.total = costs.visa.items.reduce((s, i) => s + i.value, 0);

    // EXTRAS
    costs.extras.items.push({ label: '🅿️ Park ücretleri (Venedik vb.)', value: 80 });
    costs.extras.items.push({ label: '📱 İletişim (Sırbistan SIM)', value: 10 });
    costs.extras.items.push({ label: '🎫 Müze/gezi/gondol/termal', value: 150 });
    costs.extras.items.push({ label: '🚂 Amsterdam/Den Haag tren', value: 60 });
    costs.extras.items.push({ label: '⛽ Acil durum yedek bütçe', value: 200 });
    costs.extras.total = costs.extras.items.reduce((s, i) => s + i.value, 0);

    return costs;
}

function renderCosts() {
    const costs = calculateCosts();
    renderCostCard('fuelCostBody', 'fuelCostTotal', costs.fuel);
    renderCostCard('tollCostBody', 'tollCostTotal', costs.tolls);
    renderCostCard('accCostBody', 'accCostTotal', costs.accommodation);
    renderCostCard('foodCostBody', 'foodCostTotal', costs.food);
    renderCostCard('visaCostBody', 'visaCostTotal', costs.visa);
    renderCostCard('extraCostBody', 'extraCostTotal', costs.extras);

    const gt = costs.fuel.total + costs.tolls.total + costs.accommodation.total + costs.food.total + costs.visa.total + costs.extras.total;
    document.getElementById('grandTotalEur').textContent = `€ ${Math.round(gt).toLocaleString('tr-TR')}`;
    document.getElementById('grandTotalTry').textContent = `≈ ₺ ${Math.round(gt * EUR_TO_TRY).toLocaleString('tr-TR')}`;
    document.getElementById('totalCostStat').querySelector('span').textContent = `€${Math.round(gt).toLocaleString('tr-TR')}`;

    const bd = document.getElementById('grandTotalBreakdown');
    const segs = [
        { class: 'fuel', value: costs.fuel.total, label: 'Yakıt' },
        { class: 'toll', value: costs.tolls.total, label: 'Geçiş' },
        { class: 'acc', value: costs.accommodation.total, label: 'Konaklama' },
        { class: 'food', value: costs.food.total, label: 'Yemek' },
        { class: 'visa', value: costs.visa.total, label: 'Vize/Sigorta/Feribot' },
        { class: 'extra', value: costs.extras.total, label: 'Diğer' }
    ];
    bd.innerHTML = segs.map(s => `<div class="breakdown-segment ${s.class}" style="width:${(s.value/gt*100)}%" title="${s.label}: €${Math.round(s.value)}"></div>`).join('');

    // remove old legend if exists
    const oldLegend = bd.nextElementSibling;
    if (oldLegend && oldLegend.classList && !oldLegend.classList.contains('grand-total-content')) {
        if (oldLegend.style) oldLegend.remove();
    }
    bd.insertAdjacentHTML('afterend', `<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:0.75rem;color:var(--text-muted);">${segs.map(s => `<div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;border-radius:2px;" class="breakdown-segment ${s.class}"></div><span>${s.label}: €${Math.round(s.value)}</span></div>`).join('')}</div>`);
}

function renderCostCard(bodyId, totalId, data) {
    document.getElementById(bodyId).innerHTML = data.items.map(i => `<div class="cost-row"><span class="cost-row-label">${i.label}</span><span class="cost-row-value">€${Math.round(i.value)}</span></div>`).join('');
    document.getElementById(totalId).querySelector('strong').textContent = `€${Math.round(data.total)}`;
}

function renderStopsList() {
    const list = document.getElementById('stopsList');
    list.innerHTML = '';
    const typeLabels = { start: '🟢 Başlangıç', transit: '🔵 Transit', border: '🟠 Sınır/Feribot', overnight: '🟣 Konaklama', destination: '🔴 Varış', sightseeing: '🟡 Gezi', ferry: '⛴️ Feribot' };
    routeStops.forEach((stop, index) => {
        const c = COUNTRY_DATA[stop.country];
        const dir = stop.direction === 'outbound' ? '→ Gidiş' : stop.direction === 'return' ? '← Dönüş' : '📍 Rotterdam';
        const item = document.createElement('div');
        item.className = 'stop-item';
        item.innerHTML = `
            <div class="stop-number">${index + 1}</div>
            <div class="stop-info">
                <div class="stop-city">${c.flag} ${stop.city}</div>
                <div class="stop-meta">
                    <span>${dir}</span><span>${typeLabels[stop.type] || stop.type}</span><span>${getDateStr(stop.dayIndex)}</span>
                    ${stop.stayNights > 0 ? `<span>🛏️ ${stop.stayNights} gece</span>` : ''}
                    ${stop.distToNext > 0 ? `<span>→ ${stop.distToNext} km</span>` : ''}
                </div>
            </div>
            <div class="stop-actions">
                <button class="btn btn-glass" onclick="editStop(${stop.id})" title="Düzenle"><i class="fas fa-pen"></i></button>
                <button class="btn btn-danger" onclick="deleteStop(${stop.id})" title="Sil"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderTips() {
    document.getElementById('tipsGrid').innerHTML = TIPS.map(t => `<div class="tip-card"><div class="tip-card-icon" style="background:${t.color};"><i class="${t.icon}"></i></div><h4>${t.title}</h4><p>${t.text}</p></div>`).join('');
}

function updateHeaderStats() {
    const totalDist = routeStops.reduce((s, r) => s + (r.distToNext || 0), 0);
    document.getElementById('totalDistanceStat').querySelector('span').textContent = `~${totalDist.toLocaleString('tr-TR')} km`;
}

function editStop(id) {
    editingStopId = id;
    const stop = routeStops.find(s => s.id === id);
    if (!stop) return;
    document.getElementById('modalTitle').textContent = `${stop.city} Düzenle`;
    document.getElementById('inputCity').value = stop.city;
    document.getElementById('inputCountry').value = stop.country;
    document.getElementById('inputDays').value = stop.stayNights;
    document.getElementById('inputType').value = stop.type;
    document.getElementById('inputNotes').value = stop.notes || '';
    document.getElementById('editModal').classList.add('active');
}

function saveStop() {
    const stop = routeStops.find(s => s.id === editingStopId);
    if (!stop) return;
    stop.city = document.getElementById('inputCity').value;
    stop.country = document.getElementById('inputCountry').value;
    stop.stayNights = parseInt(document.getElementById('inputDays').value);
    stop.type = document.getElementById('inputType').value;
    stop.notes = document.getElementById('inputNotes').value;
    closeModal();
    refreshAll();
}

function deleteStop(id) {
    if (!confirm('Bu durağı silmek istediğinize emin misiniz?')) return;
    routeStops = routeStops.filter(s => s.id !== id);
    refreshAll();
}

function addNewStop() {
    const maxId = Math.max(...routeStops.map(s => s.id), 0);
    const newStop = {
        id: maxId + 1, city: 'Yeni Durak', country: 'DE', lat: 50.0, lng: 10.0,
        type: 'transit', dayIndex: 10, stayNights: 0, distToNext: 100,
        driveTime: '~2 saat', notes: '', tips: [], direction: currentView === 'rotterdam' ? 'outbound' : currentView
    };
    const viewStops = routeStops.filter(s => s.direction === newStop.direction);
    const lastStop = viewStops[viewStops.length - 1];
    const insertIndex = lastStop ? routeStops.indexOf(lastStop) : routeStops.length;
    routeStops.splice(insertIndex, 0, newStop);
    refreshAll();
    editStop(newStop.id);
}

function closeModal() { document.getElementById('editModal').classList.remove('active'); editingStopId = null; }

function refreshAll() {
    drawRoute();
    renderTimeline();
    const oldLegend = document.getElementById('grandTotalBreakdown')?.nextElementSibling;
    if (oldLegend && oldLegend.tagName === 'DIV' && !oldLegend.id) oldLegend.remove();
    renderCosts();
    renderStopsList();
    updateHeaderStats();
}

function bindEvents() {
    document.getElementById('btnFitBounds').addEventListener('click', () => {
        const allCoords = routeStops.filter(s => s.direction !== 'rotterdam').map(s => [s.lat, s.lng]);
        map.fitBounds(allCoords, { padding: [30, 30] });
    });

    document.getElementById('btnOutbound').addEventListener('click', function() {
        currentView = 'outbound';
        this.classList.add('active');
        document.getElementById('btnReturn').classList.remove('active');
        document.getElementById('btnRotterdam').classList.remove('active');
        renderTimeline();
    });
    document.getElementById('btnRotterdam').addEventListener('click', function() {
        currentView = 'rotterdam';
        this.classList.add('active');
        document.getElementById('btnOutbound').classList.remove('active');
        document.getElementById('btnReturn').classList.remove('active');
        renderTimeline();
    });
    document.getElementById('btnReturn').addEventListener('click', function() {
        currentView = 'return';
        this.classList.add('active');
        document.getElementById('btnOutbound').classList.remove('active');
        document.getElementById('btnRotterdam').classList.remove('active');
        renderTimeline();
    });

    document.getElementById('btnAddStop').addEventListener('click', addNewStop);
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);
    document.getElementById('btnModalSave').addEventListener('click', saveStop);
    document.getElementById('editModal').addEventListener('click', (e) => { if (e.target.id === 'editModal') closeModal(); });

    let stopsVisible = true;
    document.getElementById('btnToggleStops').addEventListener('click', () => {
        stopsVisible = !stopsVisible;
        markers.forEach(m => stopsVisible ? m.addTo(map) : map.removeLayer(m));
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    window.addEventListener('scroll', () => {
        document.getElementById('header').style.boxShadow = window.scrollY > 100 ? 'var(--shadow-md)' : 'none';
    });
}

window.focusOnStop = focusOnStop;
window.editStop = editStop;
window.deleteStop = deleteStop;
