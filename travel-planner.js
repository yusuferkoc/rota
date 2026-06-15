/* ═══════════════════════════════════════════════════════════════
   Konya → Rotterdam · 3 Gidiş + 3 Dönüş Rotası
   Helal yemek, konaklama, maliyet, pratik ipuçları
   ═══════════════════════════════════════════════════════════════ */

const EUR_TRY = 38.5;
const VITO_LPK = 8.0; // L/100km

const C = {
  TR:{n:'Türkiye',f:'🇹🇷',d:1.25,fp:5,hp:50},
  BG:{n:'Bulgaristan',f:'🇧🇬',d:1.71,fp:7,hp:45},
  RS:{n:'Sırbistan',f:'🇷🇸',d:1.90,fp:7,hp:55},
  RO:{n:'Romanya',f:'🇷🇴',d:1.68,fp:7,hp:45},
  HU:{n:'Macaristan',f:'🇭🇺',d:1.73,fp:9,hp:70},
  HR:{n:'Hırvatistan',f:'🇭🇷',d:1.72,fp:10,hp:65},
  SI:{n:'Slovenya',f:'🇸🇮',d:1.70,fp:11,hp:70},
  SK:{n:'Slovakya',f:'🇸🇰',d:1.65,fp:10,hp:65},
  CZ:{n:'Çekya',f:'🇨🇿',d:1.55,fp:10,hp:70},
  AT:{n:'Avusturya',f:'🇦🇹',d:1.88,fp:15,hp:120},
  DE:{n:'Almanya',f:'🇩🇪',d:1.93,fp:14,hp:110},
  NL:{n:'Hollanda',f:'🇳🇱',d:2.30,fp:16,hp:130},
  IT:{n:'İtalya',f:'🇮🇹',d:1.75,fp:13,hp:100},
  GR:{n:'Yunanistan',f:'🇬🇷',d:1.70,fp:10,hp:70},
  LU:{n:'Lüksemburg',f:'🇱🇺',d:1.55,fp:14,hp:110},
  CH:{n:'İsviçre',f:'🇨🇭',d:2.10,fp:20,hp:150},
  BE:{n:'Belçika',f:'🇧🇪',d:1.75,fp:14,hp:100},
  FR:{n:'Fransa',f:'🇫🇷',d:1.82,fp:14,hp:100},
  SEA:{n:'Deniz',f:'⛴️',d:0,fp:0,hp:0}
};

const DW = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const MO = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

let baseStartDate = new Date(2026, 5, 16); // 16 Haz 2026 default
let baseStartTime = "00:00"; // 00:00 default

function dateStr(off){ 
  const d = new Date(baseStartDate); 
  d.setDate(d.getDate() + off); 
  return `${d.getDate()} ${MO[d.getMonth()]} ${DW[d.getDay()]}`; 
}

function parseDuration(dtStr) {
  if (!dtStr) return 0;
  let hours = 0;
  let minutes = 0;
  const hMatch = dtStr.match(/(\d+(?:\.\d+)?)\s*saat/);
  if (hMatch) hours = parseFloat(hMatch[1]);
  const mMatch = dtStr.match(/(\d+)\s*dk/);
  if (mMatch) minutes = parseInt(mMatch[1]);
  return hours * 60 + minutes;
}

function formatDateTime(date) {
  const day = date.getDate();
  const monthStr = MO[date.getMonth()];
  const weekdayStr = DW[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${monthStr} ${weekdayStr}, ${hours}:${minutes}`;
}

function calculateRouteTimes(stops) {
  if (!stops || stops.length === 0) return [];
  const processed = stops.map(s => ({ ...s }));
  const startParts = baseStartTime.split(':');
  const startHours = parseInt(startParts[0]) || 0;
  const startMins = parseInt(startParts[1]) || 0;
  
  let currentDateTime = new Date(baseStartDate.getFullYear(), baseStartDate.getMonth(), baseStartDate.getDate(), startHours, startMins);
  
  processed[0].arrivalStr = '';
  processed[0].departureStr = formatDateTime(currentDateTime);
  
  for (let i = 0; i < processed.length - 1; i++) {
    const current = processed[i];
    const next = processed[i + 1];
    const driveDurationMin = parseDuration(current.dt);
    
    let arrivalTime = new Date(currentDateTime.getTime() + driveDurationMin * 60000);
    next.arrivalStr = formatDateTime(arrivalTime);
    
    let nextDepartureTime;
    if (next.t === 'border') {
      nextDepartureTime = new Date(arrivalTime.getTime() + 120 * 60000);
      next.stayDesc = 'Sınır ve pasaport kontrolü: ~2 saat';
    } else if (next.t === 'transit') {
      nextDepartureTime = new Date(arrivalTime.getTime() + 60 * 60000);
      next.stayDesc = 'Mola ve dinlenme: ~1 saat';
    } else if (next.n > 0 || next.t === 'overnight' || next.t === 'destination') {
      const nights = next.n || 1;
      nextDepartureTime = new Date(arrivalTime.getFullYear(), arrivalTime.getMonth(), arrivalTime.getDate() + nights, 9, 0);
      next.stayDesc = `${nights} gece konaklama`;
    } else if (next.t === 'sightseeing') {
      nextDepartureTime = new Date(arrivalTime.getTime() + 180 * 60000);
      next.stayDesc = 'Şehir gezisi ve mola: ~3 saat';
    } else if (next.t === 'ferry') {
      nextDepartureTime = new Date(arrivalTime.getTime() + 180 * 60000);
      next.stayDesc = 'Feribot biniş hazırlıkları: ~3 saat';
    } else {
      nextDepartureTime = new Date(arrivalTime.getTime() + 60 * 60000);
      next.stayDesc = 'Mola: ~1 saat';
    }
    
    if (i + 1 === processed.length - 1) {
      next.departureStr = '';
    } else {
      next.departureStr = formatDateTime(nextDepartureTime);
    }
    currentDateTime = nextDepartureTime;
  }
  return processed;
}

/* ═══════ TAM ROTALAR ═══════ */
const COMPLETE = [
{
  id:'special_tour', name:'Avrupa Büyük Tur', icon:'🌟',
  tag:'Balkanlar · Orta Avrupa · Hollanda · İsviçre · İtalya',
  km:9500,
  tolls:[
    {n:'TR HGS',v:16},{n:'BG e-Vinyeti',v:8},{n:'RS Otoyol',v:15},
    {n:'HU e-Matrica',v:18},{n:'SK e-Známka',v:16},{n:'AT Vinyeti',v:11},
    {n:'CZ e-Známka',v:16},{n:'CH Vinyeti',v:43},{n:'FR Péage',v:50},
    {n:'IT Autostrada',v:80}
  ],
  stops:[
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'start',day:0,n:0,dk:970,dt:'~10 saat',
     desc:'00:00 hareket. Ankara-Niğde Otoyolu → Ankara Çevre → Bolu → Kuzey Marmara Otoyolu (KMO) → Edirne → Kapıkule Gümrük. Türkiye içinde başka bir şehirde durulmayacaktır.',
     tips:[{t:'HGS bakiyesini kontrol edin',c:'warn'},{t:'TR\'de full depo yapın — en ucuz yakıt',c:'good'},{t:'Kapıkule öncesi Edirne bypass edilir',c:'info'}]},
    {c:'Kapıkule Sınır',co:'TR',la:41.68,lo:26.56,t:'border',day:0,n:0,dk:150,dt:'~1.5 saat',
     desc:'Kapıkule Sınır Kapısı gümrük geçişi. Pasaport, ehliyet, ruhsat, green card, vize belgeleri hazır tutulmalıdır.',
     tips:[{t:'Yaz aylarında 1-3 saat bekleme',c:'warn'},{t:'AB EES biyometrik kontrol aktif',c:'warn'},{t:'BG vinyetini bgtoll.bg\'den alın',c:'info'}]},
    {c:'Plovdiv',co:'BG',la:42.15,lo:24.75,t:'transit',day:0,n:0,dk:150,dt:'~1.5 saat',
     desc:'Avrupa Kültür Başkenti Plovdiv (Filibe). Antik Roma Tiyatrosu, Eski Şehir\'in renkli Osmanlı evleri ve Kapana sanat bölgesi.',
     halal:'Eski şehir civarında Türk lokantaları mevcut. Kebap ve pide kolayca bulunur. Müslüman Türk nüfusu sayesinde helal et bulmak kolay. Marketlerde \'Халал\' etiketli ürünler var.',
     tips:[{t:'Roma Tiyatrosu ücretsiz manzara noktası',c:'good'},{t:'Kapana bölgesinde kahve molası',c:'good'},{t:'BGN para birimi, €1≈2 BGN',c:'info'}]},
    {c:'Sofya',co:'BG',la:42.70,lo:23.32,t:'overnight',day:0,n:1,dk:150,dt:'~1.5 saat',
     desc:'1. GECE. Bulgaristan başkenti. Aleksander Nevski Katedrali, Vitosha Bulvarı yürüyüşü, Banya Başı Camii ziyareti.',
     halal:'Banya Başı Camii civarında Türk restoranları yoğun. Zhenski Pazar çevresinde dönerci ve kebapçılar. Al Safa helal süpermarket mevcut.',
     accom:'Şehir merkezinde apart otel €40-55/gece. Vitosha Bulvarı yürüme mesafesinde tercih edin. Booking.com\'dan aile odası arayın.',
     tips:[{t:'Merkez Cami civarı helal restoran bölgesi',c:'good'},{t:'Vitosha Bulvarı akşam yürüyüşü harika',c:'good'},{t:'BGN para birimi, €1≈2 BGN',c:'info'}]},
    {c:'Niş',co:'RS',la:43.32,lo:21.89,t:'transit',day:1,n:0,dk:240,dt:'~2.5 saat',
     desc:'Sırbistan\'a giriş. Niş Kalesi (Osmanlı yapısı), Çele Kula (Kafatası Kulesi) tarih meraklıları için ilginç. Şehir merkezi kompakt ve yürünebilir.',
     halal:'Boşnak restoranlarında ızgara eti helal (sığır/kuzu). Ćevapi ve pljeskavica güvenli. \"Svinjsko\" domuz demek — kaçının!',
     tips:[{t:'RS Schengen DEĞİL, sınırda ayrı kontrol',c:'info'},{t:'RSD veya EUR nakit bulundurun',c:'warn'},{t:'Niş Kalesi çocuklarla gezmeye uygun',c:'good'}]},
    {c:'Belgrad',co:'RS',la:44.79,lo:20.45,t:'overnight',day:1,n:1,dk:90,dt:'~1.5 saat',
     desc:'2. GECE. Kalemegdan Kalesi (Tuna ve Sava buluşması muhteşem manzara), Knez Mihailova yürüyüş caddesi, Ada Ciganlija gölü (çocuklar için plaj ve bisiklet).',
     halal:'Boşnak restoranlarında ızgara et helal (sığır/kuzu). Ćevapi ve pljeskavica güvenli. Dorćol ve Stari Grad\'da Boşnak lokantaları. \"Svinjsko\" domuz — kaçının!',
     accom:'Stari Grad veya Vračar bölgesinde apart otel. €50-65/gece. Airbnb çok uygun fiyatlı.',
     tips:[{t:'Ada Ciganlija çocuklar için süper plaj',c:'good'},{t:'Kalemegdan gün batımı muhteşem',c:'good'},{t:'RSD veya EUR nakit kullanılır',c:'info'}]},
    {c:'Novi Sad',co:'RS',la:45.26,lo:19.83,t:'transit',day:2,n:0,dk:130,dt:'~1.5 saat',
     desc:'Sırbistan\'ın 2. büyük şehri. Petrovaradin Kalesi (\"Tuna üzerindeki Cebelitarık\") müthiş panorama. Tarihi şehir merkezi ve Dunavska caddesinde kahve molası.',
     halal:'Ćevapi ve pljeskavica helal. Liman (Liman) bölgesinde Boşnak restoranlar mevcut.',
     tips:[{t:'Petrovaradin Kalesi manzarası kaçırılmaz',c:'good'},{t:'Kısa ama etkili mola noktası',c:'info'}]},
    {c:'Segedin',co:'HU',la:46.25,lo:20.14,t:'transit',day:2,n:0,dk:90,dt:'~1 saat',
     desc:'Macaristan sınırı geçişi. Tisza nehri kıyısında güzel bir üniversite şehri. Dóm Meydanı ve Votive Kilisesi etkileyici.',
     tips:[{t:'Macaristan girişinde e-Matrica ZORUNLU',c:'warn'},{t:'HUF para birimi, €1≈400 HUF',c:'info'},{t:'Sınır geçişi genelde hızlı',c:'good'}]},
    {c:'Keçkemet',co:'HU',la:46.90,lo:19.69,t:'transit',day:2,n:0,dk:90,dt:'~1 saat',
     desc:'Büyük Macar Ovası (Puszta) ortasında tarihi şehir. Cifra Sarayı (Art Nouveau başyapıtı), Katona József Meydanı. Barackpálinka (kayısı likörü) meşhur.',
     tips:[{t:'Cifra Sarayı fotoğraf için harika',c:'good'},{t:'Otoyol molasında Macar langos deneyin',c:'good'}]},
    {c:'Budapeşte',co:'HU',la:47.50,lo:19.04,t:'overnight',day:2,n:1,dk:200,dt:'~2.5 saat',
     desc:'3. GECE. Tuna\'nın ikiye böldüğü muhteşem başkent. Parlamento binası (gece ışıklandırma), Széchenyi Termal (çocuklar girebilir), Buda Kalesi, Büyük Pazar Hali.',
     halal:'Kerepesi út civarında Türk restoranları ve dönerci. Istanbul Restaurant, Turkish Bistro. Langos helal. Büyük Pazar\'da taze meyve/sebze bol.',
     accom:'Pest tarafı daha uygun fiyatlı. Airbnb ile 2 odalı daire €65-80/gece. Termal yakınında otel çocuklara uygun.',
     tips:[{t:'e-Matrica\'yı ÖNCEDEN alın!',c:'warn'},{t:'Széchenyi termal çocuklarla harika',c:'good'},{t:'Tram 2 Tuna kıyısı manzara turu',c:'good'},{t:'Gece Parlamento ışıklandırması muhteşem',c:'good'},{t:'€1 ≈ 400 HUF',c:'info'}]},
    {c:'Bratislava',co:'SK',la:48.14,lo:17.10,t:'transit',day:3,n:0,dk:80,dt:'~1 saat',
     desc:'Slovakya başkenti. Budapeşte\'den sadece 2 saat! Eski Şehir çok kompakt — UFO Köprüsü gözlem terası (panoramik Tuna manzarası), Michael Kapısı, heykellerle dolu sokaklar.',
     halal:'Obchodná caddesinde birkaç döner/kebap dükkanı mevcut. Küçük şehir ama Türk fast food bulunur.',
     tips:[{t:'SK e-Známka zorunlu',c:'warn'},{t:'UFO Köprüsü terası muhteşem manzara',c:'good'},{t:'Eski şehir 1-2 saatte yürünür',c:'info'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Viyana',co:'AT',la:48.21,lo:16.37,t:'overnight',day:3,n:1,dk:330,dt:'~3.5 saat',
     desc:'4. GECE. İmparatorluk başkenti! Schönbrunn Sarayı (bahçe ücretsiz), Stephansdom Katedrali, Prater lunapark (çocuklara dev dönme dolap), Naschmarkt alışveriş.',
     halal:'Naschmarkt\'ta Türk ve Arap yemek tezgahları. Favoriten (10. Bölge) helal kasap ve lokanta yoğun. Etsan, Orient helal marketler. Döner/kebap her köşede.',
     accom:'Favoriten veya Ottakring bölgeleri uygun. €100-130/gece. Wien Hauptbahnhof civarı ulaşım açısından pratik.',
     tips:[{t:'AT vinyeti zorunlu (asfinag.at)',c:'warn'},{t:'Prater lunapark çocuklar için harika',c:'good'},{t:'Schönbrunn bahçesi ücretsiz',c:'good'},{t:'Naschmarkt\'ta helal street food',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Prag',co:'CZ',la:50.08,lo:14.44,t:'overnight',day:4,n:1,dk:150,dt:'~2 saat',
     desc:'5. GECE. ⭐ PRAG! Masaldan fırlamış şehir. Karlov Köprüsü (sabah erken gidin), Prag Kalesi, Astronomik Saat, Petřín teleferik + ayna labirenti (çocuklar bayılır).',
     halal:'Kebapçılar Wenceslas Meydanı ve Můstek civarında yaygın. Trdelník (baca böreği) helal. \"Vepřové\" domuz demek — dikkat! Balık ve sebze güvenli.',
     accom:'Staré Město veya Vinohrady bölgesi. Apart otel €65-80/gece. Batı Avrupa\'nın yarı fiyatına lüks kalabilirsiniz.',
     tips:[{t:'CZ e-Známka zorunlu',c:'warn'},{t:'Petřín teleferik + ayna labirenti çocuklara',c:'good'},{t:'Karlov Köprüsü sabah erken boş olur',c:'good'},{t:'Trdelník (baca böreği) deneyin',c:'good'},{t:'€1 ≈ 25 CZK',c:'info'}]},
    {c:'Dresden',co:'DE',la:51.05,lo:13.73,t:'transit',day:5,n:0,dk:190,dt:'~2 saat',
     desc:'\"Elbe Floransası\" lakaplı barok başyapıt. Zwinger Sarayı, Frauenkirche (II. Dünya Savaşı sonrası yeniden inşa), Semperoper opera binası. Terrassenufer\'den Elbe manzarası.',
     halal:'Hauptbahnhof civarında birkaç döner dükkanı. Prager Straße\'de kebapçılar mevcut. Almanya\'da helal bulmak kolay.',
     tips:[{t:'Almanya otoyol ücretsiz ✓',c:'good'},{t:'Zwinger avlusu ücretsiz gezilebilir',c:'good'},{t:'Frauenkirche kubbesi panoramik manzara',c:'good'}]},
    {c:'Berlin',co:'DE',la:52.52,lo:13.40,t:'overnight',day:5,n:1,dk:290,dt:'~3 saat',
     desc:'6. GECE. Almanya\'nın dinamik başkenti. Brandenburg Kapısı, Reichstag (cam kubbe ücretsiz, online rezervasyon), Berlin Duvarı kalıntıları (East Side Gallery), Checkpoint Charlie.',
     halal:'Kreuzberg \"Küçük İstanbul\" — Oranienstraße ve Kottbusser Damm helal cennet! Mustafa\'s Gemüse Kebap efsane (kuyruk uzun). Türk marketleri her yerde.',
     accom:'Kreuzberg veya Mitte bölgesi. €90-120/gece. U-Bahn ile her yere ulaşım kolay.',
     tips:[{t:'Reichstag cam kubbe ÖNCEDEN online rezervasyon',c:'warn'},{t:'Kreuzberg Türk bölgesi — evdeki gibi',c:'good'},{t:'East Side Gallery açık hava müzesi',c:'good'},{t:'BVG günlük bilet ile toplu taşıma',c:'info'}]},
    {c:'Hamburg',co:'DE',la:53.55,lo:9.99,t:'overnight',day:6,n:1,dk:120,dt:'~1.5 saat',
     desc:'7. GECE. Almanya\'nın deniz kapısı. Elbphilharmonie (plaza ücretsiz giriş, manzara muhteşem), Speicherstadt (UNESCO, Miniatur Wunderland çocuklar için ZORUNLU), liman turu.',
     halal:'Steindamm bölgesi Türk/Arap lokantalarıyla dolu. Helal döner, pide, lahmacun kolay bulunur. Schanzenviertel\'de de seçenekler var.',
     accom:'Hauptbahnhof veya St. Pauli civarı. €95-120/gece. Mercure, Motel One uygun fiyatlı zincirler.',
     tips:[{t:'Miniatur Wunderland çocuklar için MUTLAKA',c:'good'},{t:'Elbphilharmonie plaza ücretsiz panorama',c:'good'},{t:'Liman turu ~1 saat, €20/kişi',c:'info'},{t:'Speicherstadt gece ışıklandırması harika',c:'good'}]},
    {c:'Bremen',co:'DE',la:53.07,lo:8.80,t:'transit',day:7,n:0,dk:180,dt:'~2 saat',
     desc:'Bremen Mızıkacıları heykeli (çocuklar bayılır), Schnoor mahallesi (dar sokaklar, renkli evler), Marktplatz ve Roland heykeli (UNESCO).',
     halal:'Hauptbahnhof civarında döner dükkanları. Bahnhofsplatz\'da Türk fast food. Almanya\'da helal bulmak hiç sorun değil.',
     tips:[{t:'Schnoor mahallesi çocuklarla yürüyüşe uygun',c:'good'},{t:'Mızıkacılar heykelinde bacaklara dokunun — şans getirir!',c:'good'}]},
    {c:'Groningen',co:'NL',la:53.21,lo:6.56,t:'transit',day:7,n:0,dk:80,dt:'~1 saat',
     desc:'Hollanda\'nın kuzeyinde canlı üniversite şehri. Martini Kulesi\'ne çıkın (panoramik manzara), Grote Markt meydanı, bisikletli Hollanda hayatının en güzel örneği.',
     tips:[{t:'Martini Kulesi manzarası harika',c:'good'},{t:'NL\'de hız sınırı 100 km/h, DİKKAT!',c:'warn'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Heerenveen',co:'NL',la:52.96,lo:5.92,t:'transit',day:7,n:0,dk:40,dt:'~45 dk',
     desc:'Friesland bölgesi, Hollanda\'nın en otantik kırsal kesimi. Göller ve çayırlar arasında kısa mola. Buz pateni kültürünün merkezi.',
     tips:[{t:'Yakıt ikmali için uygun nokta',c:'info'}]},
    {c:'Giethoorn',co:'NL',la:52.73,lo:6.07,t:'transit',day:7,n:0,dk:30,dt:'~30 dk',
     desc:'\"Hollanda\'nın Venedik\'i\" — yolsuz köy, sadece kanallar ve ahşap köprüler! Masalsı sazdan çatılı evler, yemyeşil doğa. Çocuklar bot gezisine bayılır.',
     tips:[{t:'Whisper bot (elektrikli bot) kiralayın ~€15/saat',c:'good'},{t:'Fotoğraf için en güzel köy',c:'good'},{t:'Yaz aylarında kalabalık, sabah erken gidin',c:'warn'}]},
    {c:'Zwolle',co:'NL',la:52.51,lo:6.09,t:'transit',day:7,n:0,dk:40,dt:'~45 dk',
     desc:'Tarihi Hansa şehri. Sassenpoort kapısı (orta çağ), Grote Kerk, canlı şehir merkezi. Hollanda\'nın en iyi korunan orta çağ şehirlerinden.',
     tips:[{t:'Sassenpoort fotoğraf noktası',c:'good'},{t:'Şehir merkezi kompakt, kısa yürüyüş',c:'info'}]},
    {c:'Harderwijk',co:'NL',la:52.34,lo:5.62,t:'transit',day:7,n:0,dk:30,dt:'~30 dk',
     desc:'Eski balıkçı kasabası, Dolfinarium (Avrupa\'nın en büyük yunus parkı — çocuklar için harika). Veluwemeer gölü kıyısında huzurlu mola.',
     tips:[{t:'Dolfinarium çocuklara tam gün aktivite',c:'good'},{t:'Veluwemeer kıyısında piknik yapılabilir',c:'info'}]},
    {c:'Amersfoort',co:'NL',la:52.15,lo:5.38,t:'transit',day:7,n:0,dk:70,dt:'~1 saat',
     desc:'Orta çağdan kalma muhteşem Koppelpoort su kapısı (fotoğrafçıların favorisi). Eski şehir surları, Onze Lieve Vrouwetoren kulesi. Hollanda\'nın en iyi korunan orta çağ merkezlerinden.',
     tips:[{t:'Koppelpoort Hollanda\'nın en çok fotoğraflanan noktası',c:'good'},{t:'Eski şehir içinde kahve molası',c:'good'}]},
    {c:'Spijkenisse',co:'NL',la:51.84,lo:4.32,t:'transit',day:7,n:0,dk:150,dt:'~1.5 saat',
     desc:'Rotterdam yakınında ilginç bir nokta — Euro banknotlarındaki hayali köprülerin gerçek kopyaları burada! Çocuklar için eğlenceli fotoğraf fırsatı.',
     tips:[{t:'Euro köprüleri fotoğraf noktası',c:'good'},{t:'Rotterdam\'a 15 dk mesafe',c:'info'}]},
    {c:'Antwerp',co:'BE',la:51.21,lo:4.40,t:'transit',day:7,n:0,dk:45,dt:'~45 dk',
     desc:'Belçika\'nın elmas başkenti. Antwerp-Centraal tren istasyonu (dünyanın en güzel istasyonu!), Grote Markt, Rubens\'in şehri. Belçika çikolatası alışverişi.',
     halal:'Borgerhout ve Dam bölgesi helal restoran ve kasap dolu. Türk/Fas/Arap mutfağı zengin. Statiestraat civarı helal seçenekler.',
     tips:[{t:'Tren istasyonu içi ziyaret MUTLAKA (ücretsiz)',c:'good'},{t:'Belçika çikolatası hediye için ideal',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Brüksel',co:'BE',la:50.85,lo:4.35,t:'overnight',day:7,n:1,dk:320,dt:'~3.5 saat',
     desc:'8. GECE. AB başkenti. Grand-Place (dünyanın en güzel meydanı — UNESCO), Atomium (çocuklar bayılır), Mini-Europe minyatür parkı, Manneken Pis, Belçika waffle ve çikolata.',
     halal:'Rue du Midi ve Chaussée de Haecht helal restoran bölgesi. Schaerbeek ve Molenbeek semtlerinde Türk/Fas marketler ve lokantalar. Döner, kebap çok yaygın.',
     accom:'Grand-Place civarı veya Gare du Midi. €85-110/gece. Apart otel tercih edin, aile için geniş oda.',
     tips:[{t:'Grand-Place gece ışıklandırması muhteşem',c:'good'},{t:'Mini-Europe + Atomium kombo bilet alın',c:'good'},{t:'Belçika waffle\'ı Liège stili deneyin',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Paris',co:'FR',la:48.85,lo:2.35,t:'overnight',day:8,n:2,dk:45,dt:'~45 dk',
     desc:'9-10. GECE. ⭐ PARİS! Eyfel Kulesi (online bilet ŞART), Louvre (Pazartesi kapalı), Notre-Dame, Champs-Élysées, Seine nehir turu (çocuklar için Bateaux Mouches), Sacré-Cœur.',
     halal:'Belleville, Barbès, Goutte d\'Or helal cennet! Rue du Faubourg Saint-Denis dönerci ve kebapçılarla dolu. Quick fast food bazı şubeleri tamamen helal. O\'Tacos zinciride helal.',
     accom:'10. veya 11. bölge uygun fiyatlı. €90-120/gece. Metro ile her yere ulaşım. Airbnb 2 odalı daire €110-140/gece.',
     tips:[{t:'Arabayı park edin, metro kullanın',c:'good'},{t:'Eyfel biletini online ÖNCEDEN alın',c:'warn'},{t:'Louvre Pazartesi kapalı!',c:'warn'},{t:'Seine nehir turu çocuklara harika',c:'good'},{t:'FR gişeli otoyol (péage) pahalı',c:'warn'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Disneyland',co:'FR',la:48.87,lo:2.78,t:'sightseeing',day:9,n:0,dk:460,dt:'~4.5 saat',
     desc:'Disneyland Paris! Avrupa\'nın en büyük tema parkı. 2 park: Disneyland Park + Walt Disney Studios. Çocuklar için hayallerinin gerçek olduğu yer.',
     halal:'Park içinde halal seçenekler sınırlı. Chicken nuggets, balık, patates kızartması güvenli. Yanınıza atıştırmalık alın. Park dışında Val d\'Europe AVM\'de kebapçılar var.',
     tips:[{t:'Biletleri online ÖNCEDEN alın (daha ucuz)',c:'warn'},{t:'Sabah erken (park açılışında) gidin',c:'good'},{t:'2 park kombo bilet alın',c:'info'},{t:'Park içi yemek pahalı, yanınıza alın',c:'warn'},{t:'RER A treni ile Paris merkezden 40 dk',c:'info'}]},
    {c:'Lyon',co:'FR',la:45.76,lo:4.83,t:'overnight',day:10,n:1,dk:150,dt:'~1.5 saat',
     desc:'11. GECE. Fransa\'nın gastronomi başkenti. Vieux Lyon (UNESCO — Rönesans binaları), Fourvière Tepesi (basilika + panorama), Presqu\'île yarımadası, traboules (gizli geçitler — çocuklar bayılır).',
     halal:'Guillotière bölgesi Arap/Türk restoranları dolu. Halal boucheries (kasap) var. Lyon mutfağı domuz ağırlıklı — DİKKAT! Kebapçılar ve balık güvenli. Part-Dieu AVM\'de seçenekler.',
     accom:'Presqu\'île veya Part-Dieu bölgesi €80-100/gece. Fourvière manzaralı otel tercih edin.',
     tips:[{t:'Lyon mutfağı domuz ağırlıklı, DİKKAT',c:'warn'},{t:'Guillotière helal bölge',c:'good'},{t:'Traboules gizli geçitler çocukları büyüler',c:'good'},{t:'Fourvière tepesine füniküler ile çıkın',c:'good'}]},
    {c:'Cenevre',co:'CH',la:46.20,lo:6.14,t:'transit',day:11,n:0,dk:280,dt:'~3 saat',
     desc:'İsviçre girişi! Leman Gölü kıyısında zarif şehir. Jet d\'Eau (140m su fıskiyesi — ikon), BM Avrupa Merkezi, Eski Şehir, Çiçek Saati. Göl kenarında yürüyüş çocuklarla güzel.',
     halal:'Pâquis bölgesi çok kültürlü — kebap ve helal restoranlar mevcut. Manor Food süpermarkette çeşitli seçenekler.',
     tips:[{t:'CH vinyeti 40 CHF ZORUNLU',c:'warn'},{t:'İsviçre ÇOK pahalı, bütçeye dikkat',c:'warn'},{t:'Jet d\'Eau rüzgarlı günde ıslanırsınız!',c:'info'},{t:'CHF para birimi, €1≈0.95 CHF',c:'info'}]},
    {c:'Zürih',co:'CH',la:47.37,lo:8.54,t:'overnight',day:11,n:1,dk:120,dt:'~1.5 saat',
     desc:'12. GECE. İsviçre\'nin finans merkezi ama çok güzel! Zürih Gölü kenarında yürüyüş, Bahnhofstrasse (dünyanın en pahalı caddesi), Lindenhof tepesi (panorama), Eski Şehir sokakları.',
     halal:'Langstrasse bölgesinde kebap dükkanları ve çok kültürlü restoranlar. Migros/Coop süpermarketlerde helal etiketli ürünler. Kendi yemeğinizi hazırlamak bütçe dostu.',
     accom:'PAHALI! €130-170/gece. Airbnb tercih edin. Hauptbahnhof civarı ulaşım açısından en pratik.',
     tips:[{t:'İsviçre süpermarketi bile pahalı',c:'warn'},{t:'Zürih Gölü kenarı akşam yürüyüşü harika',c:'good'},{t:'Lindenhof tepesi ücretsiz panorama noktası',c:'good'},{t:'Market alışverişi restorandan %60 ucuz',c:'info'}]},
    {c:'Chur',co:'CH',la:46.85,lo:9.53,t:'sightseeing',day:12,n:0,dk:120,dt:'~1.5 saat',
     desc:'İsviçre\'nin en eski şehri, Alplerin kapısı. Bernina Express treni (Tirano\'ya — UNESCO rotası) veya araçla geçiş. Her iki durumda da muhteşem Alp manzaraları. Eski Şehir çok şirin.',
     tips:[{t:'Bernina Express treni manzarası efsane (online bilet)',c:'good'},{t:'Araçla geçiş de muhteşem virajlı yollar',c:'good'},{t:'Chur Eski Şehir 30 dk yürüyüş',c:'info'}]},
    {c:'İnterlaken',co:'CH',la:46.68,lo:7.86,t:'transit',day:12,n:0,dk:20,dt:'~30 dk',
     desc:'İki göl arası (Thun ve Brienz) — tam bir İsviçre kartpostalı! Jungfrau, Eiger ve Mönch dağlarına bakan muhteşem panorama. Paraşüt ve macera sporlarının merkezi.',
     tips:[{t:'Höhematte parkından Jungfrau manzarası',c:'good'},{t:'Tandem paraşüt çocuklar için (10+ yaş)',c:'info'},{t:'Brienz Gölü turkuaz rengi muhteşem',c:'good'}]},
    {c:'Grindelwald',co:'CH',la:46.62,lo:8.03,t:'transit',day:12,n:0,dk:15,dt:'~30 dk',
     desc:'Eiger Dağı\'nın kuzey yüzü eteklerinde masalsı Alp köyü. First Cliff Walk asma yolu (yükseklik korkusu olmayanlar için), Grindelwald Glacier kanyonu. Fotoğraf tutkunları için cennet.',
     tips:[{t:'First Cliff Walk cam teras (yükseklik korkusu?)',c:'info'},{t:'Eiger kuzey yüzü manzarası dağcılık efsanesi',c:'good'},{t:'Köy içinde şirin kafeler',c:'good'}]},
    {c:'Lauterbrunnen',co:'CH',la:46.59,lo:7.90,t:'sightseeing',day:12,n:0,dk:250,dt:'~3 saat',
     desc:'72 şelaleli muhteşem vadi! Staubbach Şelalesi (297m, köyün ortasında), Trümmelbach Şelaleleri (dağın içinde — çocuklar büyülenir). Tolkien\'in İlk Çağ ilhamı aldığı yer.',
     tips:[{t:'Staubbach Şelalesi köy içinden ücretsiz izlenir',c:'good'},{t:'Trümmelbach Şelaleleri dağın İÇİNDE (biletli)',c:'good'},{t:'Vadide yürüyüş yapın, her adım kartpostal',c:'good'},{t:'Jungfraujoch treni buradan kalkar (pahalı ama efsane)',c:'info'}]},
    {c:'Como Gölü',co:'IT',la:45.98,lo:9.26,t:'transit',day:12,n:0,dk:50,dt:'~1 saat',
     desc:'İtalya\'ya geçiş! Alplerin eteklerinde lüks göl hayatı. George Clooney\'nin villası burada. Bellagio kasabası (göl üzerinde manzara), Como şehri katedrali. Muhteşem manzara yolu.',
     tips:[{t:'Bellagio köyünde 1 saat mola harika',c:'good'},{t:'İtalya girişinde Autostrada başlıyor',c:'info'},{t:'Göl kenarında gelato molası',c:'good'}]},
    {c:'Milano',co:'IT',la:45.46,lo:9.19,t:'overnight',day:12,n:1,dk:270,dt:'~3 saat',
     desc:'13. GECE. İtalya\'nın moda ve iş başkenti. Duomo (gotik başyapıt, çatıya çıkın), Galleria Vittorio Emanuele II (dünyanın en eski AVM\'si), Navigli kanalları (akşam yürüyüşü).',
     halal:'Via Padova Arap/Afrika bölgesi — helal restoran ve kasap yoğun. Porta Venezia civarında da seçenekler. Pizza Margherita ve risotto güvenli. Coop/Esselunga\'da helal etiketli tavuk.',
     accom:'Stazione Centrale civarı €90-110/gece. Metro ile Duomo\'ya 10 dk.',
     tips:[{t:'Duomo çatısına çıkın (merdiven daha ucuz)',c:'good'},{t:'Via Padova helal restoran bölgesi',c:'good'},{t:'Son Akşam Yemeği tablosu rezervasyonla (2 ay önceden!)',c:'warn'},{t:'Navigli akşam yürüyüşü romantik',c:'good'}]},
    {c:'Venedik',co:'IT',la:45.44,lo:12.31,t:'overnight',day:13,n:1,dk:150,dt:'~2 saat',
     desc:'14. GECE. ⭐ VENEDİK! Dünyanın eşsiz şehri. Arabayı Mestre\'de park edin. San Marco Meydanı, Rialto Köprüsü, Murano cam adası (yapım gösterisi çocukları büyüler), gondol turu.',
     halal:'Ada\'da helal restoran neredeyse yok. Mestre\'de döner dükkanları var. Pizza ve deniz ürünleri güvenli. Rialto balık pazarında taze deniz ürünü. Gelato helal.',
     accom:'Mestre\'de otel €80-100/gece (ada\'da çok pahalı). Tren/vaporetto ile ada\'ya 15 dk.',
     tips:[{t:'Arabayı MESTRE\'de park edin (ada yasak)',c:'warn'},{t:'Vaporetto 24h aile bileti alın (~€40)',c:'good'},{t:'Murano cam yapımı çocukları büyüler',c:'good'},{t:'Gondol ~€80/30dk (max 6 kişi, ailece binin)',c:'info'},{t:'San Marco sabah erken boş',c:'good'}]},
    {c:'Bologna',co:'IT',la:44.49,lo:11.34,t:'transit',day:14,n:0,dk:100,dt:'~1.5 saat',
     desc:'\"Kızıl Şehir\" (terracotta çatılar), \"Şişman Şehir\" (İtalya\'nın en lezzetli mutfağı), \"Bilge Şehir\" (en eski üniversite). Due Torri kuleleri, 40 km revaklı sokak (UNESCO). Pizza al taglio muhteşem.',
     halal:'Via Zamboni civarında birkaç kebap dükkanı. Piazza Maggiore civarında dönerci. Pizza al taglio (dilim pizza) ve pasta helal. Piadina\'da domuz şarküteri dikkat!',
     tips:[{t:'Due Torri (Asinelli) kulesine çıkın — panorama',c:'good'},{t:'Bologna İtalya\'nın yemek başkenti',c:'good'},{t:'\"Prosciutto\" domuz, \"pollo\" tavuk',c:'warn'}]},
    {c:'Floransa',co:'IT',la:43.76,lo:11.25,t:'overnight',day:14,n:1,dk:270,dt:'~3 saat',
     desc:'15. GECE. Rönesans\'ın beşiği! Duomo (Brunelleschi kubbesi — çatıya çıkın), Ponte Vecchio (kuyumcular köprüsü), Uffizi Galerisi (Botticelli!), Piazzale Michelangelo (gün batımı panorama).',
     halal:'San Lorenzo pazarı civarında birkaç kebapçı. Via dei Neri\'de döner dükkanı. Pizza ve gelato her yerde helal. Trattoria\'larda \"bistecca\" sığır ama genellikle helal KESİM değil — dikkat.',
     accom:'Santa Maria Novella veya San Lorenzo civarı €90-120/gece. Merkeze yürüme mesafesi önemli.',
     tips:[{t:'Duomo kubbe tırmanışı online bilet ŞART',c:'warn'},{t:'Piazzale Michelangelo gün batımı KAÇIRMAYIN',c:'good'},{t:'Uffizi online bilet (kuyruk çok uzun)',c:'warn'},{t:'Gelato: Vivoli veya Gelateria dei Neri en iyiler',c:'good'}]},
    {c:'Roma',co:'IT',la:41.90,lo:12.49,t:'overnight',day:15,n:2,dk:270,dt:'~3.5 saat',
     desc:'16-17. GECE. ⭐ ROMA! Ebedi Şehir. Kolezyum (gladyatör hikayeleri çocukları büyüler), Vatikan (Sistina Şapeli, San Pietro), Trevi Çeşmesi (para at + dilek tut), Pantheon, İspanyol Merdivenleri.',
     halal:'Esquilino (Termini yakını) çok kültürlü — kebap dükkanları. Via Cavour Arap/Hint restoranları. Pizza al taglio güvenli. Roma Büyük Camii (Avrupa\'nın en büyüğü) ziyaret edin.',
     accom:'Termini civarı €90-110/gece. Metro A ve B hattı kesişimi, her yere kolay ulaşım.',
     tips:[{t:'Kolezyum + Forum + Palatine kombo bilet ÖNCEDEN alın',c:'warn'},{t:'Vatikan kuyruğu uzun, online bilet ŞART',c:'warn'},{t:'Pizza al taglio ucuz ve helal öğle yemeği',c:'good'},{t:'Roma Büyük Camii ziyaret edilebilir',c:'good'},{t:'Trevi\'ye gece gidin, daha az kalabalık',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Amalfi',co:'IT',la:40.63,lo:14.60,t:'destination',day:17,n:0,dk:0,dt:'',
     desc:'18. GÜN. Amalfi Kıyıları! İtalya\'nın en güzel sahil yolu. Positano (pastel renkli evler uçurumda), Amalfi kasabası (katedral + limonata), Ravello (muhteşem bahçeler). Mavi mağara (Grotta dello Smeraldo) tekne turu.',
     halal:'Deniz ürünleri ve pizza güvenli. Limoncello (alkollü) yerine limonata deneyin. Küçük kasabalarda helal restoran yok — yanınıza erzak alın veya deniz ürünü tercih edin.',
     tips:[{t:'Amalfi sahil yolu dar ve virajlı — dikkatli sürün',c:'warn'},{t:'Positano fotoğraf için İtalya\'nın en ikonigi',c:'good'},{t:'Amalfi limoncello yerine limonata',c:'good'},{t:'Plajlarda şezlong kiralama ~€20/gün',c:'info'},{t:'Erken sabah çıkın, yol kalabalık',c:'warn'}]}
  ]
}
];

/* ═══════ GİDİŞ ROTALARI ═══════ */
const OUTBOUND = [
{
  id:'balkan', name:'Balkan Klasik + Prag', icon:'🏰',
  tag:'Plovdiv · Belgrad · Budapeşte · Prag · Frankfurt',
  km:4145,
  tolls:[
    {n:'TR HGS (Niğde-KMO-Kapıkule)',v:16},{n:'BG e-Vinyeti (haftalık)',v:8},
    {n:'RS Otoyol Gişeleri',v:15},{n:'HU e-Matrica (10 gün)',v:18},
    {n:'SK e-Známka (10 gün)',v:16},{n:'CZ e-Známka (10 gün)',v:16}
  ],
  stops:[
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'start',day:0,n:0,dk:970,dt:'~10 saat',
     desc:'00:00 hareket. Ankara-Niğde Otoyolu → Ankara Çevre → Bolu → KMO → Edirne → Kapıkule Gümrük. Türkiye içinde duraklama yapılmaksızın doğrudan sınır kapısına geçiş yapılacaktır.',
     tips:[{t:'HGS bakiyesini kontrol edin',c:'warn'},{t:'TR\'de full depo — en ucuz yakıt',c:'good'},{t:'Kapıkule öncesi Edirne bypass edilir',c:'info'}]},
    {c:'Kapıkule Sınır',co:'TR',la:41.68,lo:26.56,t:'border',day:0,n:0,dk:150,dt:'~1.5 saat',
     desc:'~15:00 varış. Pasaport, ehliyet, ruhsat, green card, vize, çocuk belgeleri hazır tutun.',
     tips:[{t:'Yaz aylarında 1-3 saat bekleme',c:'warn'},{t:'AB EES biyometrik kontrol',c:'warn'},{t:'BG vinyetini bgtoll.bg\'den alın',c:'info'}]},
    {c:'Plovdiv',co:'BG',la:42.15,lo:24.75,t:'overnight',day:0,n:1,dk:390,dt:'~4 saat',
     desc:'İLK GECE. Sınırdan ~2.5 saat. Avrupa Kültür Başkenti — Eski Şehir, Roma Tiyatrosu, Kapana bölgesi harika.',
     halal:'Eski şehir civarında Türk lokantaları mevcut. Kebap ve pide kolayca bulunur. Müslüman Türk nüfusu sayesinde helal et bulmak kolay. Marketlerde \'Халал\' etiketli ürünler var.',
     accom:'Booking.com\'dan "aile odası" arayın. Şehir merkezinde €40-55/gece. Çocuklu aileler için apart otel ideal.',
     tips:[{t:'Şehir merkezi yürüme mesafesinde otel',c:'good'},{t:'Akşam yemeği ~€25-35/aile',c:'good'},{t:'BGN para birimi, €1≈2 BGN',c:'info'}]},
    {c:'Belgrad',co:'RS',la:44.79,lo:20.45,t:'overnight',day:1,n:1,dk:375,dt:'~4 saat',
     desc:'2. GECE. Sofya üzerinden Niş → Belgrad. Kalemegdan Kalesi, Knez Mihailova, Ada Ciganlija gölü (çocuklar için plaj).',
     halal:'Boşnak restoranlarında ızgara et genelde helal (sığır/kuzu). Ćevapi ve pljeskavica güvenli. Dorćol ve Stari Grad\'da Boşnak lokantaları. "Svinjsko" domuz demek — kaçının!',
     accom:'Stari Grad veya Vračar bölgesinde apart otel. €50-65/gece. Airbnb çok uygun.',
     tips:[{t:'Sırbistan Schengen DEĞİL, ayrı vize yok',c:'info'},{t:'RSD veya EUR nakit bulundurun',c:'warn'},{t:'Ada Ciganlija çocuklar için süper',c:'good'}]},
    {c:'Budapeşte',co:'HU',la:47.50,lo:19.04,t:'sightseeing',day:2,n:2,dk:530,dt:'~5.5 saat',
     desc:'3-4. GECE. Tuna kenarı, Parlamento, Széchenyi Termal (çocuklar girebilir), Buda Kalesi, Büyük Pazar.',
     halal:'Kerepesi út civarında Türk restoranları ve dönerci. Istanbul Restaurant, Turkish Bistro. Langos helal. Büyük Pazar\'da taze meyve/sebze. HUF para birimi.',
     accom:'Pest tarafı daha uygun. Airbnb ile 2 odalı daire €65-80/gece. Termal yakınında otel çocuklara uygun.',
     tips:[{t:'e-Matrica\'yı ÖNCEDEN alın!',c:'warn'},{t:'Széchenyi termal çocuklarla harika',c:'good'},{t:'Tram 2 Tuna kıyısı manzara turu',c:'good'},{t:'€1 ≈ 400 HUF',c:'info'}]},
    {c:'Prag',co:'CZ',la:50.08,lo:14.44,t:'sightseeing',day:4,n:2,dk:500,dt:'~5 saat',
     desc:'5-6. GECE. ⭐ PRAG! Bratislava üzerinden (SK vinyeti gerekli). Karlov Köprüsü, Prag Kalesi, Astronomik Saat, Petřín teleferik.',
     halal:'Kebapçılar Wenceslas Meydanı ve Můstek civarında yaygın. Trdelník (baca böreği) helal. "Vepřové" domuz demek — dikkat! Balık ve sebze güvenli. CZK para birimi.',
     accom:'Staré Město veya Vinohrady bölgesi. Apart otel €65-80/gece. Batı Avrupa\'nın yarı fiyatına lüks kalabilirsiniz.',
     tips:[{t:'SK e-Známka zorunlu (Budapeşte→Bratislava)',c:'warn'},{t:'CZ e-Známka zorunlu',c:'warn'},{t:'Petřín teleferik + ayna labirenti çocuklara',c:'good'},{t:'€1 ≈ 25 CZK',c:'info'}]},
    {c:'Frankfurt',co:'DE',la:50.11,lo:8.68,t:'overnight',day:6,n:1,dk:440,dt:'~4.5 saat',
     desc:'7. GECE. Prag → Nürnberg → Frankfurt. Römerberg meydanı, Main nehri yürüyüşü.',
     halal:'Münchener Straße tamamen Türk lokanta ve marketlerle dolu! Helal döner, lahmacun, iskender her yerde. Almanya\'da helal bulmak en kolay ülke.',
     accom:'Hauptbahnhof civarı ulaşım açısından pratik. €100-120/gece. Motel One zinciri uygun fiyatlı.',
     tips:[{t:'Almanya otoyol ücretsiz ✓',c:'good'},{t:'Çekya\'da yakıt ikmali yapın (ucuz)',c:'good'},{t:'Autobahn hız sınırsız bölüm var, dikkat',c:'warn'}]},
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'destination',day:7,n:10,dk:0,dt:'~4.5 saat',
     desc:'🎯 VARIŞ! 10 GECE. Köln\'de Dom Katedrali molası. Erasmus Köprüsü, Markthal, Küp Evler, Kinderdijk yel değirmenleri.',
     halal:'West-Kruiskade Türk/Fas/Surinam restoranlarıyla dolu. Tanger Markt, Istanbul Market — helal süpermarket. Endonezya mutfağı büyük bölümü helal. Kip (tavuk) restoranlar güvenli.',
     accom:'Airbnb/apart otel otelden %40 ucuz! 2 yatak odalı daire €90-130/gece. Zuid veya Delfshaven bölgeleri uygun.',
     tips:[{t:'Airbnb çok daha uygun (6 kişi)',c:'good'},{t:'NL\'de yakıt en pahalı, DE\'de doldurun',c:'warn'},{t:'OV-chipkaart toplu taşıma kartı alın',c:'info'},{t:'Albert Heijn market ucuz alışveriş',c:'good'}]}
  ]
},
{
  id:'adriyatik', name:'Hırvatistan + Alpler', icon:'🏔️',
  tag:'Sofya · Belgrad · Zagreb · Ljubljana · Münih',
  km:4050,
  tolls:[
    {n:'TR HGS',v:16},{n:'BG e-Vinyeti',v:8},{n:'RS Otoyol',v:15},
    {n:'HR Vinyeti (10 gün)',v:8},{n:'SI e-Vinyeti (haftalık)',v:16},
    {n:'AT Vinyeti (10 gün)',v:11}
  ],
  stops:[
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'start',day:0,n:0,dk:970,dt:'~10 saat',
     desc:'00:00 hareket. Ankara-Niğde Otoyolu → KMO → Kapıkule.',
     tips:[{t:'HGS bakiyesi kontrol',c:'warn'},{t:'TR\'de full depo yapın',c:'good'}]},
    {c:'Kapıkule',co:'TR',la:41.68,lo:26.56,t:'border',day:0,n:0,dk:150,dt:'~1.5 saat',
     desc:'~15:00 varış. Belgeler hazır olsun.',
     tips:[{t:'Yaz aylarında 1-3 saat bekleme',c:'warn'}]},
    {c:'Sofya',co:'BG',la:42.70,lo:23.32,t:'overnight',day:0,n:1,dk:390,dt:'~4 saat',
     desc:'İLK GECE. Bulgaristan başkenti. Aleksander Nevski Katedrali, Vitosha Bulvarı yürüyüşü.',
     halal:'Banya Başı Camii civarında Türk restoranları yoğun. Zhenski Pazar çevresinde dönerci ve kebapçılar. Al Safa helal süpermarket.',
     accom:'Şehir merkezinde apart otel €40-55/gece. Vitosha Bulvarı yürüme mesafesinde tercih edin.',
     tips:[{t:'Merkez Cami civarı helal restoran bölgesi',c:'good'},{t:'BGN para birimi',c:'info'}]},
    {c:'Belgrad',co:'RS',la:44.79,lo:20.45,t:'overnight',day:1,n:1,dk:390,dt:'~4 saat',
     desc:'2. GECE. Niş üzerinden Belgrad. Kalemegdan, Ada Ciganlija.',
     halal:'Boşnak ızgara eti helal. Ćevapi güvenli. "Svinjsko" = domuz, kaçının!',
     accom:'Apart otel €50-65/gece.',
     tips:[{t:'RS Schengen dışı',c:'info'},{t:'EUR veya RSD nakit',c:'warn'}]},
    {c:'Zagreb',co:'HR',la:45.81,lo:15.98,t:'overnight',day:2,n:1,dk:140,dt:'~2 saat',
     desc:'3. GECE. Hırvatistan başkenti. Yukarı Şehir, Dolac Pazarı, Jelačić Meydanı.',
     halal:'Tkalčićeva caddesinde birkaç Türk/Boşnak restoranı. Dolac pazarında taze ürünler. Döner dükkanları merkez civarında. Hırvatistan\'da EUR kullanılır.',
     accom:'Donji Grad (aşağı şehir) bölgesi. €60-75/gece.',
     tips:[{t:'HR 2023\'ten beri EUR kullanıyor',c:'info'},{t:'Dolac pazarı taze meyve/sebze',c:'good'}]},
    {c:'Ljubljana',co:'SI',la:46.06,lo:14.51,t:'overnight',day:3,n:1,dk:370,dt:'~4 saat',
     desc:'4. GECE. Masal gibi küçük başkent. Üçlü Köprü, Ljubljana Kalesi (teleferik), Preseren Meydanı.',
     halal:'Kebap dükkanları Prešeren Meydanı civarında. Balkan mutfağı restoranları helal seçenekler sunar. Helal et sınırlı, balık ve sebze tercih edin.',
     accom:'Merkez çok küçük, her yer yürüme mesafesinde. €65-80/gece.',
     tips:[{t:'SI e-Vinyeti zorunlu',c:'warn'},{t:'Kale teleferik çocuklara harika',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Münih',co:'DE',la:48.14,lo:11.58,t:'sightseeing',day:4,n:2,dk:830,dt:'~8.5 saat',
     desc:'5-6. GECE. Salzburg üzerinden. Marienplatz, Englischer Garten (sörf dalgası!), BMW Welt (ücretsiz).',
     halal:'Hauptbahnhof civarında döner ve kebap. Schillerstraße Türk lokantaları. Adan Market helal kasap. Viktualienmarkt\'ta meyve/sebze.',
     accom:'Hauptbahnhof civarı pratik. €100-120/gece. Motel One uygun.',
     tips:[{t:'AT vinyeti Salzburg geçişi için gerekli',c:'warn'},{t:'Englischer Garten çocuklarla muhteşem',c:'good'},{t:'BMW Welt ücretsiz giriş',c:'good'}]},
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'destination',day:6,n:10,dk:0,dt:'~8 saat',
     desc:'🎯 VARIŞ! Stuttgart → Frankfurt → Köln üzerinden Rotterdam. 10 gece.',
     halal:'West-Kruiskade helal cennet. Tanger Markt, Istanbul Market. Endonezya mutfağı helal.',
     accom:'Airbnb 2 oda €90-130/gece.',
     tips:[{t:'Almanya\'da yakıt ikmali',c:'good'},{t:'OV-chipkaart alın',c:'info'}]}
  ]
},
{
  id:'romanya', name:'Romanya + Viyana', icon:'🎭',
  tag:'Bükreş · Sibiu · Budapeşte · Viyana · Prag',
  km:4300,
  tolls:[
    {n:'TR HGS',v:16},{n:'BG e-Vinyeti',v:8},{n:'RO e-Rovinieta (30 gün)',v:7},
    {n:'HU e-Matrica',v:18},{n:'AT Vinyeti (10 gün)',v:11},
    {n:'CZ e-Známka',v:16}
  ],
  stops:[
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'start',day:0,n:0,dk:970,dt:'~10 saat',
     desc:'00:00 hareket. KMO üzerinden Kapıkule.',
     tips:[{t:'TR\'de full depo',c:'good'}]},
    {c:'Kapıkule',co:'TR',la:41.68,lo:26.56,t:'border',day:0,n:0,dk:150,dt:'~1.5 saat',
     desc:'Sınır geçişi. Ruse Köprüsü üzerinden Romanya\'ya.',
     tips:[{t:'RO vinyetini online alın',c:'warn'}]},
    {c:'Bükreş',co:'RO',la:44.43,lo:26.10,t:'overnight',day:0,n:1,dk:280,dt:'~3.5 saat',
     desc:'İLK GECE. Romanya başkenti. Parlamento Sarayı (dünyanın en büyük 2. binası), Eski Şehir (Lipscani).',
     halal:'Lipscani civarında döner ve kebap dükkanları. Carrefour/Mega Image\'da helal etiketli tavuk. Romanya\'da helal et bulmak biraz zor, market tavuğu güvenli.',
     accom:'Eski şehir civarı €40-55/gece. Apart otel tercih edin.',
     tips:[{t:'RON para birimi, €1≈5 RON',c:'info'},{t:'Parlamento turu çocukları etkiler',c:'good'}]},
    {c:'Sibiu',co:'RO',la:45.80,lo:24.15,t:'overnight',day:1,n:1,dk:450,dt:'~5 saat',
     desc:'2. GECE. Transilvanya\'nın incisi! Büyük Meydan, Yalancılar Köprüsü, ASTRA açık hava müzesi.',
     halal:'Küçük şehir, helal restoran sınırlı. Market alışverişi (peynir, ekmek, meyve) en güvenli. Pizzacılarda Margherita güvenli. Balık varsa tercih edin.',
     accom:'Büyük Meydan civarı €40-55/gece. Çok şirin pension\'lar var.',
     tips:[{t:'ASTRA müzesi çocuklara süper',c:'good'},{t:'Transilvanya manzarası muhteşem',c:'good'}]},
    {c:'Budapeşte',co:'HU',la:47.50,lo:19.04,t:'overnight',day:2,n:1,dk:240,dt:'~2.5 saat',
     desc:'3. GECE. Kısa geçiş — Tuna, Parlamento, Széchenyi hamam.',
     halal:'Kerepesi út Türk restoranları. Langos helal. Büyük Pazar taze ürünler.',
     accom:'Pest tarafı €65-80/gece.',
     tips:[{t:'e-Matrica zorunlu',c:'warn'},{t:'Langos deneyin (çocuklar bayılır)',c:'good'}]},
    {c:'Viyana',co:'AT',la:48.21,lo:16.37,t:'sightseeing',day:3,n:2,dk:330,dt:'~3.5 saat',
     desc:'4-5. GECE. İmparatorluk başkenti. Schönbrunn Sarayı, Stephansdom, Prater lunapark (dev dönme dolap), Naschmarkt.',
     halal:'Naschmarkt\'ta Türk ve Arap yemek tezgahları. Favoriten (10. Bölge) helal kasap ve lokanta yoğun. Etsan, Orient helal marketler. Döner/kebap her köşede.',
     accom:'Favoriten veya Ottakring bölgeleri uygun. €100-130/gece.',
     tips:[{t:'AT vinyeti zorunlu',c:'warn'},{t:'Prater lunapark çocuklar için harika',c:'good'},{t:'Schönbrunn bahçesi ücretsiz',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Prag',co:'CZ',la:50.08,lo:14.44,t:'overnight',day:5,n:1,dk:570,dt:'~5.5 saat',
     desc:'6. GECE. Kısa ama yoğun Prag molası. Karlov Köprüsü, Eski Şehir Meydanı.',
     halal:'Wenceslas civarında kebapçılar. Trdelník helal. "Vepřové" = domuz, dikkat!',
     accom:'Staré Město €65-80/gece.',
     tips:[{t:'CZ e-Známka zorunlu',c:'warn'},{t:'CZK para birimi',c:'info'}]},
    {c:'Köln',co:'DE',la:50.94,lo:6.96,t:'overnight',day:6,n:1,dk:280,dt:'~3 saat',
     desc:'7. GECE. Dom Katedrali (UNESCO), Ren nehri yürüyüşü.',
     halal:'Keupstraße (Mülheim) = Küçük İstanbul! Helal döner, pide, lahmacun, baklava. Ehrenfeld\'de de Türk/Arap restoranları bol.',
     accom:'Hauptbahnhof civarı €100-120/gece.',
     tips:[{t:'DE otoyol ücretsiz',c:'good'},{t:'Keupstraße helal cennet',c:'good'}]},
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'destination',day:7,n:10,dk:0,dt:'~2.5 saat',
     desc:'🎯 VARIŞ! 10 gece Rotterdam.',
     halal:'West-Kruiskade, Tanger Markt, Istanbul Market.',
     accom:'Airbnb €90-130/gece.',
     tips:[{t:'NL yakıt pahalı, DE\'de doldurun',c:'warn'}]}
  ]
}
];

/* ═══════ DÖNÜŞ ROTALARI ═══════ */
const RETURN = [
{
  id:'italy', name:'Klasik İtalya', icon:'🇮🇹',
  tag:'Münih · Verona · Venedik · Ancona Feribotu',
  km:3200,
  ferryFrom:'Ancona', ferryTo:'İgoumenitsa', ferryCost:600,
  tolls:[
    {n:'AT Vinyeti + Brenner',v:24},{n:'IT Autostrada gişeleri',v:50},
    {n:'GR Egnatia Odos',v:15},{n:'TR HGS (İpsala-Konya)',v:16}
  ],
  stops:[
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'start',day:0,n:0,dk:830,dt:'~8 saat',
     desc:'DÖNÜŞ BAŞLIYOR. Frankfurt üzerinden güneye.',
     tips:[{t:'DE\'de yakıt ikmali',c:'good'}]},
    {c:'Münih',co:'DE',la:48.14,lo:11.58,t:'overnight',day:0,n:1,dk:380,dt:'~4 saat',
     desc:'1. GECE. Son Almanya molası. Englischer Garten, Marienplatz.',
     halal:'Schillerstraße Türk lokantaları. Adan Market helal kasap.',
     accom:'€100-120/gece.',
     tips:[{t:'AT vinyetini online alın',c:'warn'},{t:'Englischer Garten çocuklarla güzel',c:'good'}]},
    {c:'Verona',co:'IT',la:45.44,lo:10.99,t:'overnight',day:1,n:1,dk:120,dt:'~4 saat',
     desc:'2. GECE. Brenner Geçidi — Alpler muhteşem! Romeo & Juliet, Arena, Piazza delle Erbe.',
     halal:'Pizza Margherita genelde güvenli. Deniz ürünleri helal. Via Mazzini civarında birkaç kebapçı. Coop/Esselunga\'da helal etiketli tavuk.',
     accom:'Merkez civarı €90-110/gece.',
     tips:[{t:'Brenner manzarası için mola',c:'good'},{t:'AT vinyeti + Brenner özel ücreti',c:'warn'},{t:'Gelato + pizza çocuk favorisi',c:'good'}]},
    {c:'Venedik',co:'IT',la:45.44,lo:12.34,t:'sightseeing',day:2,n:1,dk:300,dt:'~1.5 saat',
     desc:'3. GECE. ⭐ VENEDİK! Arabayı Mestre\'ye park edin. San Marco, Rialto, Murano cam adası.',
     halal:'Ada\'da helal restoran neredeyse yok. Mestre\'de döner dükkanları. Pizza ve deniz ürünleri güvenli. Rialto balık pazarında taze deniz ürünü. Gelato helal.',
     accom:'Mestre\'de otel €80-100/gece. Ada\'da çok pahalı, Mestre tercih edin.',
     tips:[{t:'Arabayı Mestre\'de park (ada yasak)',c:'warn'},{t:'Vaporetto 24h aile bileti alın',c:'good'},{t:'Murano cam yapımı çocukları büyüler',c:'good'}]},
    {c:'Ancona',co:'IT',la:43.62,lo:13.52,t:'ferry',day:3,n:0,dk:0,dt:'~3.5 saat',
     desc:'⛴️ FERİBOT! Akşam feribotu. Ancona → İgoumenitsa (~16-20 saat). Operatörler: Minoan, Anek, Superfast. 2 KABİN ALIN.',
     halal:'Feribotta restoran var ama helal seçenek sınırlı. Binmeden önce Ancona\'da yemek yiyin veya yanınıza erzak alın.',
     tips:[{t:'Bilet ÖNCEDEN directferries.com',c:'warn'},{t:'2 kabin alın (4+2)',c:'info'},{t:'Feribotta çocuk oyun alanı var',c:'good'}]},
    {c:'Denizde',co:'SEA',la:40.50,lo:18.00,t:'ferry',day:4,n:0,dk:330,dt:'Feribot ~18 saat',
     desc:'⛴️ Adriyatik geçişi. Kabinde uyku, güvertede güneşlenme. Sabah İgoumenitsa varış.',
     tips:[{t:'Kabinde priz var, şarj edin',c:'info'},{t:'Güvertede yunus görebilirsiniz!',c:'good'}]},
    {c:'Selanik',co:'GR',la:40.63,lo:22.94,t:'overnight',day:5,n:1,dk:350,dt:'~3.5 saat',
     desc:'4. GECE. İgoumenitsa → Egnatia Odos → Selanik. Beyaz Kule, sahil yürüyüşü.',
     halal:'DİKKAT: Yunan gyros genelde domuz! "Kotopoulo" (tavuk) isteyin. Ladadika\'da balık restoranları güvenli. Sahilde meyve suyu ve tatlıcılar.',
     accom:'Sahil civarı €60-80/gece.',
     tips:[{t:'Gyros\'ta "kotopoulo" (tavuk) isteyin!',c:'warn'},{t:'Yunan yemekleri lezzetli ve uygun',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'İpsala Sınır',co:'GR',la:40.92,lo:26.38,t:'border',day:6,n:0,dk:840,dt:'~9 saat',
     desc:'Schengen çıkış. Edirne\'de Selimiye + tava ciğer molası.',
     tips:[{t:'İpsala Kapıkule\'den az beklemeli',c:'good'},{t:'Edirne tava ciğer!',c:'good'}]},
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'end',day:6,n:0,dk:0,dt:'',
     desc:'🏠 EVE DÖNÜŞ! KMO → Bolu → Ankara → Konya. Uzun son gün, sabah erken çıkın.',
     tips:[{t:'Son gün çok uzun, erken hareket',c:'warn'},{t:'Bolu\'da öğle molası',c:'good'}]}
  ]
},
{
  id:'swiss', name:'İsviçre + Milano', icon:'🇨🇭',
  tag:'Lüksemburg · Luzern · Milano · Ancona Feribotu',
  km:3400,
  ferryFrom:'Ancona', ferryTo:'İgoumenitsa', ferryCost:600,
  tolls:[
    {n:'CH Vinyeti (yıllık)',v:43},{n:'IT Autostrada',v:40},
    {n:'GR Egnatia Odos',v:15},{n:'TR HGS',v:16}
  ],
  stops:[
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'start',day:0,n:0,dk:320,dt:'~3.5 saat',
     desc:'DÖNÜŞ. Belçika üzerinden güneye.',
     tips:[{t:'Erken çıkış',c:'info'}]},
    {c:'Lüksemburg',co:'LU',la:49.61,lo:6.13,t:'overnight',day:0,n:1,dk:420,dt:'~4.5 saat',
     desc:'1. GECE. Minik ama zengin başkent. Casemates du Bock, Corniche yürüyüşü. Ücretsiz toplu taşıma!',
     halal:'Gare bölgesinde birkaç Türk/Arap kebapçısı. Auchan/Cactus marketlerinde helal ürünler. Küçük şehir ama kebap bulunur.',
     accom:'Gare civarı €100-120/gece.',
     tips:[{t:'Toplu taşıma tamamen ücretsiz!',c:'good'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Luzern',co:'CH',la:47.05,lo:8.31,t:'overnight',day:1,n:1,dk:280,dt:'~3 saat',
     desc:'2. GECE. Strasbourg üzerinden. Kapellbrücke (ahşap köprü), göl manzarası, Alpler panoraması.',
     halal:'İsviçre pahalı ama merkez civarında kebap dükkanları var. Manor Food süpermarket çeşitli seçenekler. Kendi yemeğinizi hazırlamak bütçe dostu.',
     accom:'PAHALII! €130-160/gece. Airbnb tercih edin.',
     tips:[{t:'CH vinyeti 40 CHF zorunlu',c:'warn'},{t:'İsviçre çok pahalı, bütçeye dikkat',c:'warn'},{t:'CHF para birimi, €1≈0.95 CHF',c:'info'},{t:'Göl kıyısı çocuklarla güzel',c:'good'}]},
    {c:'Milano',co:'IT',la:45.46,lo:9.19,t:'overnight',day:2,n:1,dk:420,dt:'~4 saat',
     desc:'3. GECE. Gotthard tüneli. Duomo, Galleria Vittorio Emanuele, Navigli kanalları.',
     halal:'Via Padova Arap/Afrika bölgesi — helal restoran ve kasap yoğun. Porta Venezia civarında da seçenekler. Pizza ve risotto güvenli.',
     accom:'Stazione Centrale civarı €90-110/gece.',
     tips:[{t:'Gotthard tüneli uzun, sıra olabilir',c:'warn'},{t:'Via Padova helal bölge',c:'good'}]},
    {c:'Ancona',co:'IT',la:43.62,lo:13.52,t:'ferry',day:3,n:0,dk:0,dt:'~4 saat',
     desc:'⛴️ Bologna üzerinden Ancona. Akşam feribotu İgoumenitsa\'ya.',
     halal:'Binmeden yemek yiyin veya erzak alın.',
     tips:[{t:'Bilet önceden alın',c:'warn'},{t:'2 kabin alın',c:'info'}]},
    {c:'Denizde',co:'SEA',la:40.50,lo:18.00,t:'ferry',day:4,n:0,dk:330,dt:'~18 saat',
     desc:'⛴️ Adriyatik geçişi.',
     tips:[{t:'Güvertede yunus!',c:'good'}]},
    {c:'Selanik',co:'GR',la:40.63,lo:22.94,t:'overnight',day:5,n:1,dk:350,dt:'~3.5 saat',
     desc:'4. GECE. Beyaz Kule, Ladadika.',
     halal:'"Kotopoulo" (tavuk) isteyin! Balık güvenli.',
     accom:'€60-80/gece.',
     tips:[{t:'Gyros\'ta domuz dikkat!',c:'warn'}]},
    {c:'İpsala',co:'GR',la:40.92,lo:26.38,t:'border',day:6,n:0,dk:840,dt:'~9 saat',
     desc:'Schengen çıkış. Edirne molası.',
     tips:[{t:'İpsala az beklemeli',c:'good'}]},
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'end',day:6,n:0,dk:0,dt:'',
     desc:'🏠 EVE DÖNÜŞ!',
     tips:[{t:'Sabah erken hareket',c:'warn'}]}
  ]
},
{
  id:'france', name:'Fransa + Roma', icon:'🇫🇷',
  tag:'Paris · Lyon · Nice · Roma · Bari Feribotu',
  km:4600,
  ferryFrom:'Bari', ferryTo:'İgoumenitsa', ferryCost:550,
  tolls:[
    {n:'FR Péage otoyol gişeleri',v:70},{n:'IT Autostrada',v:55},
    {n:'GR Egnatia Odos',v:15},{n:'TR HGS',v:16}
  ],
  stops:[
    {c:'Rotterdam',co:'NL',la:51.92,lo:4.48,t:'start',day:0,n:0,dk:500,dt:'~5 saat',
     desc:'DÖNÜŞ. Brüksel üzerinden Paris\'e.',
     tips:[{t:'Belçika geçiş ücretsiz',c:'good'}]},
    {c:'Paris',co:'FR',la:48.86,lo:2.35,t:'sightseeing',day:0,n:2,dk:460,dt:'~4.5 saat',
     desc:'1-2. GECE. ⭐ PARİS! Eyfel, Louvre, Notre-Dame, Champs-Élysées. Çocuklar için Disneyland (günübirlik).',
     halal:'Belleville, Barbès, Goutte d\'Or helal cennet! Rue du Faubourg Saint-Denis dönerci ve kebapçılarla dolu. Quick fast food bazı şubeleri tamamen helal.',
     accom:'10. veya 11. bölge uygun fiyatlı. €90-120/gece. Metro ile her yere ulaşım.',
     tips:[{t:'Arabayı park edin, metro kullanın',c:'good'},{t:'Belleville helal restoran bölgesi',c:'good'},{t:'FR gişeli otoyol (péage)',c:'warn'},{t:'EUR kullanılır',c:'info'}]},
    {c:'Lyon',co:'FR',la:45.76,lo:4.84,t:'overnight',day:2,n:1,dk:470,dt:'~4.5 saat',
     desc:'3. GECE. Fransa\'nın gastronomi başkenti. Vieux Lyon, Fourvière tepesi.',
     halal:'Guillotière bölgesi Arap/Türk restoranları dolu. Halal boucheries var. Lyon mutfağı domuz ağırlıklı — DİKKAT! Kebapçılar ve balık güvenli.',
     accom:'Presqu\'île bölgesi €80-100/gece.',
     tips:[{t:'Lyon mutfağı domuz ağırlıklı, dikkat',c:'warn'},{t:'Guillotière helal bölge',c:'good'}]},
    {c:'Nice',co:'FR',la:43.71,lo:7.26,t:'overnight',day:3,n:1,dk:530,dt:'~5.5 saat',
     desc:'4. GECE. Côte d\'Azur! Promenade des Anglais, eski şehir, plaj. Çocuklar denize bayılır.',
     halal:'Eski şehirde birkaç kebapçı. Socca (nohut pankeki) yerel helal spesiyalite. Deniz ürünleri bol ve güvenli.',
     accom:'Sahil yakını €90-110/gece.',
     tips:[{t:'Plaj çocuklar için süper',c:'good'},{t:'Socca deneyin (helal yerel lezzet)',c:'good'}]},
    {c:'Roma',co:'IT',la:41.90,lo:12.50,t:'sightseeing',day:4,n:2,dk:450,dt:'~6 saat',
     desc:'5-6. GECE. ⭐ ROMA! Kolezyum, Vatikan, Trevi Çeşmesi, Pantheon. Çocuklar gladyatör hikayeleriyle büyülenir.',
     halal:'Esquilino (Termini yakını) çok kültürlü, kebap dükkanları. Via Cavour Arap/Hint restoranları. Pizza al taglio güvenli. Roma Büyük Camii ziyaret edilebilir.',
     accom:'Termini civarı €90-110/gece. Metro ile her yere.',
     tips:[{t:'Esquilino helal bölge',c:'good'},{t:'Vatikan kuyruğu uzun, online bilet',c:'warn'},{t:'Pizza al taglio ucuz ve helal',c:'good'}]},
    {c:'Bari',co:'IT',la:41.12,lo:16.87,t:'ferry',day:6,n:0,dk:0,dt:'~4.5 saat',
     desc:'⛴️ Bari → İgoumenitsa feribotu (~12 saat). Daha kısa deniz yolu.',
     halal:'Bari\'de limon çıkmadan yemek yiyin. Focaccia Barese (zeytinyağlı ekmek) helal.',
     tips:[{t:'Bari feribotu Ancona\'dan kısa',c:'good'},{t:'Bilet önceden alın',c:'warn'}]},
    {c:'Selanik',co:'GR',la:40.63,lo:22.94,t:'overnight',day:7,n:1,dk:350,dt:'~3.5 saat',
     desc:'7. GECE. İgoumenitsa → Selanik.',
     halal:'"Kotopoulo" tavuk isteyin. Balık güvenli.',
     accom:'€60-80/gece.',
     tips:[{t:'Gyros domuz olabilir, dikkat!',c:'warn'}]},
    {c:'İpsala',co:'GR',la:40.92,lo:26.38,t:'border',day:8,n:0,dk:840,dt:'~9 saat',
     desc:'Schengen çıkış.',
     tips:[{t:'Edirne tava ciğer molası',c:'good'}]},
    {c:'Konya',co:'TR',la:37.87,lo:32.49,t:'end',day:8,n:0,dk:0,dt:'',
     desc:'🏠 EVE DÖNÜŞ!',
     tips:[{t:'Uzun gün, erken hareket',c:'warn'}]}
  ]
}
];

/* ═══════ ROTTERDAM GÜNLERİ ═══════ */
const RDAM_INFO = {
  desc:'10 gün Rotterdam\'da! Günübirlik geziler:',
  items:[
    {title:'🚂 Amsterdam (tren 1.5 saat)', text:'Anne Frank Evi, kanal turu, Rijksmuseum. NS treni ile gidin, park imkansız. Halal: De Pijp bölgesi, Albert Cuyp Market.'},
    {title:'🚂 Den Haag (30 dk)', text:'Madurodam minyatür parkı (çocuklar!), Scheveningen plajı. Halal: Hobbemastraat Türk dükkanları.'},
    {title:'🚗 Kinderdijk', text:'UNESCO yel değirmenleri. Çocuklar değirmenlerin içine girebilir. Bisiklet kiralayın.'},
    {title:'🚗 Delft', text:'Porselen fabrikası, küçük kanallar. Yarım günlük gezi.'},
    {title:'🚗 Gouda', text:'Peynir pazarı (sadece Perşembe!). Stroopwafel deneyin.'},
    {title:'🏠 Rotterdam\'da', text:'Markthal, Küp Evler, Erasmus Köprüsü, Europoort liman turu, Diergaarde Blijdorp hayvanat bahçesi.'}
  ]
};

/* ═══════ İPUÇLARI ═══════ */
const TIPS = [
  {icon:'fas fa-sim-card', bg:'var(--teal)', title:'SIM Kart & İnternet',
   text:'Türkiye\'den çıkmadan Vodafone/Turkcell roaming paketlerini kontrol edin (pahalı olabilir). En ekonomik: AB\'ye girince eSIM kullanın — Airalo veya Holafly uygulamaları €10-15 arası 30 gün AB geneli data. Sırbistan Schengen dışı, ayrı data paketi gerekebilir.'},
  {icon:'fas fa-road', bg:'var(--accent)', title:'Vinyetler & Otoyol Geçişleri',
   text:'TÜM vinyetleri ÖNCEDEN online alın: Bulgaristan (bgtoll.bg), Macaristan (ematrica.nemzetiutdij.hu), Slovakya (eznamka.sk), Çekya (edalnice.cz), Avusturya (asfinag.at — 18 gün bekleme süresi var!), Romanya (rovinieta.ro). Almanya/Hollanda ücretsiz. İtalya/Fransa/Yunanistan gişeli.'},
  {icon:'fas fa-passport', bg:'var(--red)', title:'Vize & Belgeler (6 Kişi)',
   text:'4 yetişkin × €90 + 2 çocuk × €45 = €450 vize ücreti + VFS hizmet bedeli ~€240. Yanınızda: pasaportlar, vize, ehliyet, uluslararası ehliyet, ruhsat, green card, otel rezervasyonları, seyahat sigortası, çocuk nüfus cüzdanları. Green Card sigortayı 2 hafta ÖNCEDEN başvurun.'},
  {icon:'fas fa-ship', bg:'#5B86E5', title:'İtalya → Yunanistan Feribotu',
   text:'Ancona→İgoumenitsa: ~16-20 saat gece feribotu. Bari→İgoumenitsa: ~12 saat. directferries.com veya anek.gr\'den bilet. Araç + 6 kişi + 2 kabin: ~€500-700. YAZ SEZONU erken ayırtın! Minoan Lines, Anek Lines, Superfast tercih edin.'},
  {icon:'fas fa-utensils', bg:'var(--green)', title:'Helal Yemek Stratejisi',
   text:'Almanya, Hollanda, Fransa = helal cennet (Türk/Arap nüfusu yoğun). Balkanlar = Boşnak ızgara eti genelde helal. İtalya = pizza + deniz ürünleri güvenli. Yunanistan = gyros\'ta DOMUZ var, tavuk isteyin! Her yerde: market + soğutucu çanta = en ucuz. Vito\'ya soğutucu çanta koyun.'},
  {icon:'fas fa-gas-pump', bg:'var(--amber)', title:'Yakıt Stratejisi',
   text:'En ucuz: Türkiye (€1.25), Çekya (€1.55), Lüksemburg (€1.55). En pahalı: Hollanda (€2.30), İsviçre (€2.10). Sınır geçmeden MUTLAKA doldurun! Vito deposu ~75L, full depoyla ~900 km. Almanya\'dan Hollanda\'ya geçmeden son istasyonda durun.'},
  {icon:'fas fa-child', bg:'var(--accent)', title:'Çocuklu Seyahat',
   text:'Her 2-3 saatte mola. Tablet + kulaklık, boyama kitabı, atıştırmalık hazır. Vito arkasına yastık/battaniye. AB\'de 135 cm altı çocuklara uygun koltuk ZORUNLU. Vito\'da 6 adet reflektör yelek bulunmalı (AB yasası). Raststätte molalarında çocuk parkı var (Almanya).'},
  {icon:'fas fa-car', bg:'var(--muted)', title:'Araç Hazırlığı (Vito)',
   text:'Kontrol: motor yağı, antifriz, lastik basıncı, fren, farlar. Yanınızda: stepne, kriko, 6 reflektör yelek (AB ZORUNLU), yangın söndürücü, ilk yardım çantası, çekme halatı, yedek ampul seti. Avusturya\'da floresan yelek zorunlu.'},
  {icon:'fas fa-coins', bg:'var(--teal)', title:'Para Birimleri',
   text:'EUR: Almanya, Hollanda, Avusturya, İtalya, Fransa, Yunanistan, Hırvatistan, Slovenya, Lüksemburg. Diğer: BGN (€1≈2), RSD (€1≈117 nakit!), HUF (€1≈400), CZK (€1≈25), RON (€1≈5), CHF (€1≈0.95). Sırbistan\'da EUR nakit de kabul edilir.'},
  {icon:'fas fa-tachometer-alt', bg:'var(--red)', title:'Hız Sınırları (Otoyol)',
   text:'TR:120 · BG:140 · RS:130 · HR:130 · SI:130 · HU:130 · AT:130 · CZ:130 · DE:sınırsız (önerilen 130) · NL:100(!) · IT:130 · FR:130 · CH:120 · RO:130 · GR:130. Hollanda\'da 100 km/h aşımı ciddi ceza!'},
  {icon:'fas fa-mosque', bg:'var(--accent)', title:'Namaz & Camiler',
   text:'Muslim Pro veya HalalTrip uygulaması indirin — kıble, namaz vakitleri, yakın cami gösterir. Önemli camiler: Sofya Banya Başı, Belgrad Bayraklı, Budapeşte, Frankfurt Merkez, Rotterdam Mevlana, Paris Büyük Camii, Roma Büyük Camii, Viyana İslam Merkezi.'},
  {icon:'fas fa-phone', bg:'var(--green)', title:'Acil Durumlar',
   text:'AB geneli acil numara: 112 (polis, ambulans, itfaiye). Sırbistan: 112/192/194. TC Dışişleri: +90 312 292 1000. En yakın konsolosluk numaralarını telefonunuza kaydedin. Seyahat sigortası poliçe numarasını yanınızda taşıyın.'}
];

/* ═══════ STATE ═══════ */
let routeMode = 'complete'; // 'complete' veya 'split'
let selComp = 0, selOut = 0, selRet = 0, curTab = 'out';
let map, markersG=[], linesG=[];

/* ═══════ INIT ═══════ */
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('startDateInput');
  const timeInput = document.getElementById('startTimeInput');
  if (dateInput && dateInput.value) {
    const val = dateInput.value.split('-');
    baseStartDate = new Date(parseInt(val[0]), parseInt(val[1]) - 1, parseInt(val[2]));
  }
  if (timeInput && timeInput.value) {
    baseStartTime = timeInput.value;
  }
  loadTheme();
  renderRouteCards();
  initMap();
  renderAll();
  bindEvents();
});

function loadTheme(){
  const t = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeToggle').innerHTML = t==='dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

/* ═══════ ROUTE CARDS ═══════ */
function renderRouteCards(){
  const cc = document.getElementById('completeCards');
  if(cc){
    cc.innerHTML = COMPLETE.map((r,i) => `
      <div class="route-card ${routeMode==='complete' && i===selComp?'selected':''}" onclick="pickComp(${i})">
        <div class="rc-icon">${r.icon}</div>
        <div class="rc-name">${r.name}</div>
        <div class="rc-stops">${r.tag}</div>
        <div class="rc-meta">
          <span><i class="fas fa-road"></i> ~${(r.km).toLocaleString('tr')} km</span>
          <span><i class="fas fa-moon"></i> ${r.stops.reduce((s,x)=>s+(x.n||0),0)} gece</span>
        </div>
      </div>
    `).join('');
  }

  const oc = document.getElementById('outboundCards');
  oc.innerHTML = OUTBOUND.map((r,i) => `
    <div class="route-card ${routeMode==='split' && i===selOut?'selected':''}" onclick="pickOut(${i})">
      <div class="rc-icon">${r.icon}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-stops">${r.tag}</div>
      <div class="rc-meta">
        <span><i class="fas fa-road"></i> ~${(r.km).toLocaleString('tr')} km</span>
        <span><i class="fas fa-moon"></i> ${r.stops.reduce((s,x)=>s+(x.n||0),0)} gece</span>
      </div>
    </div>
  `).join('');

  const rc = document.getElementById('returnCards');
  rc.innerHTML = RETURN.map((r,i) => `
    <div class="route-card ${routeMode==='split' && i===selRet?'selected':''}" onclick="pickRet(${i})">
      <div class="rc-icon">${r.icon}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-stops">${r.tag}</div>
      <div class="rc-meta">
        <span><i class="fas fa-road"></i> ~${(r.km).toLocaleString('tr')} km</span>
        <span><i class="fas fa-ship"></i> ${r.ferryFrom}→${r.ferryTo}</span>
      </div>
    </div>
  `).join('');
}

function pickComp(i){ routeMode='complete'; selComp=i; renderRouteCards(); renderAll(); }
function pickOut(i){ routeMode='split'; selOut=i; renderRouteCards(); renderAll(); }
function pickRet(i){ routeMode='split'; selRet=i; renderRouteCards(); renderAll(); }

/* ═══════ MAP ═══════ */
function initMap(){
  map = L.map('map',{center:[46,14],zoom:5,scrollWheelZoom:true});
  setTiles();
  drawMap();
}
function setTiles(){
  const dark = document.documentElement.getAttribute('data-theme')==='dark';
  const url = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  map.eachLayer(l => { if(l instanceof L.TileLayer) map.removeLayer(l); });
  L.tileLayer(url,{attribution:'© OpenStreetMap © CARTO',subdomains:'abcd',maxZoom:19}).addTo(map);
}
function mIcon(t){
  const ic = {start:'fa-flag',border:'fa-passport',overnight:'fa-moon',sightseeing:'fa-camera',destination:'fa-location-dot',ferry:'fa-ship',end:'fa-home'};
  return L.divIcon({className:'custom-marker',html:`<div class="m-pin ${t}"><i class="fas ${ic[t]||'fa-circle'}"></i></div>`,iconSize:[28,28],iconAnchor:[14,28],popupAnchor:[0,-28]});
}
function drawMap(){
  markersG.forEach(m=>map.removeLayer(m)); linesG.forEach(l=>map.removeLayer(l));
  markersG=[]; linesG=[];
  
  let out = [], ret = [];
  if (routeMode === 'complete') {
    out = COMPLETE[selComp].stops;
    ret = [];
  } else {
    out = OUTBOUND[selOut].stops;
    ret = RETURN[selRet].stops;
  }
  
  // outbound line
  if(out.length>1){
    const l=L.polyline(out.map(s=>[s.la,s.lo]),{color:'#2B7A78',weight:3,opacity:0.8}).addTo(map);
    linesG.push(l);
  }
  // return line
  if(ret.length>1){
    const l=L.polyline(ret.map(s=>[s.la,s.lo]),{color:'#C4784A',weight:3,opacity:0.7,dashArray:'6,6'}).addTo(map);
    linesG.push(l);
  }
  // markers
  const allS = [...out, ...ret.slice(1)]; // skip Rotterdam duplicate
  allS.forEach(s => {
    const m = L.marker([s.la,s.lo],{icon:mIcon(s.t)}).addTo(map);
    const cn = C[s.co];
    m.bindPopup(`<div style="font-family:'DM Sans',sans-serif;min-width:160px;"><strong>${cn.f} ${s.c}</strong><br><small>${cn.n}</small></div>`,{maxWidth:250});
    markersG.push(m);
  });
  const coords = allS.map(s=>[s.la,s.lo]);
  if(coords.length) map.fitBounds(coords,{padding:[25,25]});
}

/* ═══════ TIMELINE ═══════ */
function getTimedStopsForCurrentTab() {
  if (routeMode === 'complete') {
    return calculateRouteTimes(COMPLETE[selComp].stops);
  }
  
  const outStops = OUTBOUND[selOut].stops;
  const retStops = RETURN[selRet].stops;
  
  if (curTab === 'out') {
    return calculateRouteTimes(outStops);
  } else {
    // Return tab timing: calculate departure date from Rotterdam
    const timedOut = calculateRouteTimes(outStops);
    const lastOut = timedOut[timedOut.length - 1]; // Rotterdam
    
    const outParts = baseStartTime.split(':');
    const outHours = parseInt(outParts[0]) || 0;
    const outMins = parseInt(outParts[1]) || 0;
    let currentDateTime = new Date(baseStartDate.getFullYear(), baseStartDate.getMonth(), baseStartDate.getDate(), outHours, outMins);
    
    for (let i = 0; i < outStops.length - 1; i++) {
      const driveMin = parseDuration(outStops[i].dt);
      currentDateTime = new Date(currentDateTime.getTime() + driveMin * 60000);
      
      const next = outStops[i + 1];
      if (i + 1 === outStops.length - 1) break;
      
      if (next.t === 'border') {
        currentDateTime = new Date(currentDateTime.getTime() + 120 * 60000);
      } else if (next.t === 'transit') {
        currentDateTime = new Date(currentDateTime.getTime() + 60 * 60000);
      } else if (next.n > 0 || next.t === 'overnight' || next.t === 'destination') {
        currentDateTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate() + (next.n || 1), 9, 0);
      } else if (next.t === 'sightseeing') {
        currentDateTime = new Date(currentDateTime.getTime() + 180 * 60000);
      } else {
        currentDateTime = new Date(currentDateTime.getTime() + 60 * 60000);
      }
    }
    
    const rdamNights = lastOut.n || 10;
    const rdamDepartureDateTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate() + rdamNights, 9, 0);
    
    const processedRet = retStops.map(s => ({ ...s }));
    let retDateTime = rdamDepartureDateTime;
    
    processedRet[0].arrivalStr = '';
    processedRet[0].departureStr = formatDateTime(retDateTime);
    
    for (let i = 0; i < processedRet.length - 1; i++) {
      const current = processedRet[i];
      const next = processedRet[i + 1];
      const driveMin = parseDuration(current.dt);
      
      let arrivalTime = new Date(retDateTime.getTime() + driveMin * 60000);
      next.arrivalStr = formatDateTime(arrivalTime);
      
      let nextDepartureTime;
      if (next.t === 'border') {
        nextDepartureTime = new Date(arrivalTime.getTime() + 120 * 60000);
        next.stayDesc = 'Sınır ve pasaport kontrolü: ~2 saat';
      } else if (next.t === 'transit') {
        nextDepartureTime = new Date(arrivalTime.getTime() + 60 * 60000);
        next.stayDesc = 'Mola ve dinlenme: ~1 saat';
      } else if (next.n > 0 || next.t === 'overnight' || next.t === 'end') {
        const nights = next.n || 1;
        nextDepartureTime = new Date(arrivalTime.getFullYear(), arrivalTime.getMonth(), arrivalTime.getDate() + nights, 9, 0);
        next.stayDesc = `${nights} gece konaklama`;
      } else if (next.t === 'sightseeing') {
        nextDepartureTime = new Date(arrivalTime.getTime() + 180 * 60000);
        next.stayDesc = 'Şehir gezisi ve mola: ~3 saat';
      } else if (next.t === 'ferry') {
        nextDepartureTime = new Date(arrivalTime.getTime() + 180 * 60000);
        next.stayDesc = 'Feribot biniş hazırlıkları: ~3 saat';
      } else {
        nextDepartureTime = new Date(arrivalTime.getTime() + 60 * 60000);
        next.stayDesc = 'Mola: ~1 saat';
      }
      
      if (i + 1 === processedRet.length - 1) {
        next.departureStr = '';
      } else {
        next.departureStr = formatDateTime(nextDepartureTime);
      }
      retDateTime = nextDepartureTime;
    }
    
    return processedRet;
  }
}

function renderTimeline(){
  const box = document.getElementById('timeline') || document.getElementById('timelineContainer');
  if(!box) return;
  if(curTab==='rdam'){ renderRdam(box); return; }
  
  let stops = [];
  let dayBase = 0;

  if (routeMode === 'complete') {
    if(curTab === 'ret') {
      box.innerHTML = '<div style="padding:20px;text-align:center;">Avrupa Büyük Tur seçili olduğundan dönüş rotası da gidişin (Tüm Rota) içindedir. Lütfen Gidiş sekmesini kullanın.</div>';
      return;
    }
    stops = COMPLETE[selComp].stops;
  } else {
    stops = curTab==='out' ? OUTBOUND[selOut].stops : RETURN[selRet].stops;
    if(curTab==='ret'){
      const lastOut = OUTBOUND[selOut].stops[OUTBOUND[selOut].stops.length-1];
      dayBase = lastOut.day + lastOut.n;
    }
  }

  const timedStops = getTimedStopsForCurrentTab();

  box.innerHTML = timedStops.map((s, idx) => {
    const cn = C[s.co];
    const isTR = s.co==='TR';
    const gDay = s.day + dayBase;
    const tipsH = s.tips ? s.tips.map(t=>`<span class="tip-tag ${t.c}">${t.t}</span>`).join('') : '';
    
    let connector = '';
    if(idx < timedStops.length - 1) {
      const next = timedStops[idx + 1];
      const nextCn = C[next.co];
      // Display the actual travel details stored on s (current stop)
      const distLabel = s.dk > 0 ? `${s.dk} km` : '';
      const timeLabel = s.dt || '';
      const infoItems = [];
      if(distLabel) infoItems.push(`<i class="fas fa-road"></i> ${distLabel}`);
      if(timeLabel) infoItems.push(`<i class="fas fa-clock"></i> ${timeLabel}`);
      
      connector = `
      <div class="route-connector">
        <div class="route-connector-inner">
          <div class="rc-dot"></div>
          <div class="rc-line-wrap">
            <svg viewBox="0 0 200 32" preserveAspectRatio="none">
              <path d="M0,16 C40,4 60,28 100,16 C140,4 160,28 200,16"/>
            </svg>
            ${infoItems.length ? `<div class="rc-info">${infoItems.join('<span style="opacity:0.3">|</span>')}</div>` : ''}
          </div>
          <div class="rc-dot rc-dot-end"></div>
        </div>
        <div class="rc-city-labels">
          <span class="rc-city-label">${cn.f} ${s.c}</span>
          <span class="rc-city-label" style="text-align:right">${nextCn.f} ${next.c}</span>
        </div>
      </div>`;
    }
    
    return `
    <div class="tl-card" data-type="${s.t}">
      <div class="tl-top">
        <span class="tl-day">Gün ${gDay+1}</span>
        <span class="tl-date">${dateStr(gDay)}</span>
      </div>
      <div class="tl-city">
        ${cn.f} ${s.c}
        ${s.n>0 ? `<span class="tl-nights">🛏️ ${s.n} gece</span>` : ''}
      </div>
      <div class="tl-meta">
        ${s.dk>0 ? `<span><i class="fas fa-road"></i> ${s.dk} km</span>` : ''}
        ${s.dt ? `<span><i class="fas fa-clock"></i> ${s.dt}</span>` : ''}
        ${s.n>0 && !isTR ? `<span><i class="fas fa-bed"></i> ~€${cn.hp}/gece</span>` : ''}
      </div>
      
      <!-- Time calculations -->
      <div class="tl-card-times">
        ${s.arrivalStr ? `
        <div class="time-box arr">
          <span><i class="fas fa-sign-in-alt"></i> Varış</span>
          <strong>${s.arrivalStr}</strong>
        </div>` : ''}
        ${s.departureStr ? `
        <div class="time-box dep">
          <span><i class="fas fa-sign-out-alt"></i> Kalkış</span>
          <strong>${s.departureStr}</strong>
        </div>` : ''}
      </div>
      ${s.stayDesc ? `<div style="font-size:0.75rem; color:var(--muted); margin-top:8px; font-style:italic;"><i class="fas fa-clock"></i> ${s.stayDesc}</div>` : ''}

      ${s.desc ? `<div class="tl-desc">${s.desc}</div>` : ''}
      ${s.halal && !isTR ? `<div class="tl-halal">${s.halal}</div>` : ''}
      ${s.accom && !isTR ? `<div class="tl-accom">${s.accom}</div>` : ''}
      ${tipsH ? `<div class="tl-tips">${tipsH}</div>` : ''}
    </div>${connector}`;
  }).join('');
}

function renderRdam(box){
  box.innerHTML = `
    <div class="tl-card" data-type="destination">
      <div class="tl-city">🇳🇱 ${RDAM_INFO.desc}</div>
      ${RDAM_INFO.items.map(it => `
        <div style="margin-top:12px;">
          <strong style="font-size:0.9rem;">${it.title}</strong>
          <p style="font-size:0.8rem;color:var(--text2);margin-top:4px;line-height:1.6;">${it.text}</p>
        </div>
      `).join('')}
    </div>`;
}

/* ═══════ COSTS ═══════ */
function calcCosts(){
  let out, ret, allStops, fc;
  
  if (routeMode === 'complete') {
    out = COMPLETE[selComp];
    ret = {tolls:[], stops:[]};
    allStops = out.stops;
    fc = out.ferryCost || 0;
  } else {
    out = OUTBOUND[selOut];
    ret = RETURN[selRet];
    allStops = [...out.stops, ...ret.stops.slice(1)];
    fc = ret.ferryCost || 600;
  }

  const costs = {fuel:{items:[],total:0},tolls:{items:[],total:0},acc:{items:[],total:0},food:{items:[],total:0},visa:{items:[],total:0},extra:{items:[],total:0}};

  // Fuel by country
  const cd={};
  allStops.forEach(s=>{ if(s.dk>0) cd[s.co]=(cd[s.co]||0)+s.dk; });
  Object.entries(cd).forEach(([co,km])=>{
    const c=C[co]; if(!c||c.d===0) return;
    const l=(km/100)*VITO_LPK, cost=l*c.d;
    costs.fuel.items.push({l:`${c.f} ${c.n} (${km} km)`,v:cost});
    costs.fuel.total+=cost;
  });

  // Tolls
  [...out.tolls, ...ret.tolls].forEach(t=>{
    costs.tolls.items.push({l:t.n,v:t.v});
    costs.tolls.total+=t.v;
  });

  // Accommodation (NOT in Turkey)
  allStops.filter(s=>s.n>0 && s.co!=='TR' && s.co!=='SEA').forEach(s=>{
    const c=C[s.co], cost=s.n*c.hp;
    costs.acc.items.push({l:`${c.f} ${s.c} (${s.n} gece)`,v:cost});
    costs.acc.total+=cost;
  });

  // Food (NOT in Turkey, 6 people)
  const fd={};
  allStops.forEach(s=>{ if(s.co!=='TR'&&s.co!=='SEA') fd[s.co]=(fd[s.co]||0)+Math.max(1,s.n); });
  Object.entries(fd).forEach(([co,days])=>{
    const c=C[co]; if(!c||c.fp===0) return;
    const cost=days*c.fp*6;
    costs.food.items.push({l:`${c.f} ${c.n} (${days}g × 6 kişi)`,v:cost});
    costs.food.total+=cost;
  });

  // Visa, insurance, ferry
  costs.visa.items=[
    {l:'🛂 Schengen Vizesi (4 yetişkin)',v:360},
    {l:'🛂 Schengen Vizesi (2 çocuk)',v:90},
    {l:'📋 VFS Hizmet Bedeli (6 kişi)',v:240},
    {l:'🚗 Green Card Sigorta',v:59},
    {l:'🏥 Seyahat Sigortası (6 kişi)',v:180}
  ];
  if (fc > 0) {
    costs.visa.items.push({l:`⛴️ Feribot: ${ret.ferryFrom}→${ret.ferryTo}`,v:fc});
  }
  costs.visa.total=costs.visa.items.reduce((s,i)=>s+i.v,0);

  // Extras
  costs.extra.items=[
    {l:'🅿️ Park ücretleri',v:80},
    {l:'📱 eSIM / data paketi',v:15},
    {l:'🎫 Müze/gezi/gondol/termal',v:150},
    {l:'🚂 Amsterdam/Den Haag tren',v:60},
    {l:'⛽ Acil yedek bütçe',v:200}
  ];
  costs.extra.total=costs.extra.items.reduce((s,i)=>s+i.v,0);

  return costs;
}

function renderCosts(){
  const costs = calcCosts();
  const cats = [
    {k:'fuel',icon:'fuel',title:'Yakıt Maliyeti'},
    {k:'tolls',icon:'toll',title:'Otoyol & Vinyetler'},
    {k:'acc',icon:'acc',title:'Konaklama'},
    {k:'food',icon:'food',title:'Yemek (6 kişi)'},
    {k:'visa',icon:'visa',title:'Vize & Sigorta & Feribot'},
    {k:'extra',icon:'extra',title:'Diğer Giderler'}
  ];

  document.getElementById('costGrid').innerHTML = cats.map(cat => {
    const d = costs[cat.k];
    return `
    <div class="cost-card">
      <div class="cc-head"><div class="cc-icon ${cat.icon}"><i class="fas fa-${cat.icon==='fuel'?'gas-pump':cat.icon==='toll'?'road':cat.icon==='acc'?'bed':cat.icon==='food'?'utensils':cat.icon==='visa'?'passport':'ellipsis'}"></i></div><h3>${cat.title}</h3></div>
      <div class="cc-body">${d.items.map(i=>`<div class="cc-row"><span class="label">${i.l}</span><span class="val">€${Math.round(i.v)}</span></div>`).join('')}</div>
      <div class="cc-total"><span>Toplam</span><strong>€${Math.round(d.total)}</strong></div>
    </div>`;
  }).join('');

  const gt = Object.values(costs).reduce((s,c)=>s+c.total,0);
  const segs = [
    {c:'fuel',v:costs.fuel.total,l:'Yakıt'},
    {c:'toll',v:costs.tolls.total,l:'Geçiş'},
    {c:'acc',v:costs.acc.total,l:'Konaklama'},
    {c:'food',v:costs.food.total,l:'Yemek'},
    {c:'visa',v:costs.visa.total,l:'Vize/Feribot'},
    {c:'extra',v:costs.extra.total,l:'Diğer'}
  ];

  document.getElementById('grandTotal').innerHTML = `
    <div class="gt-inner">
      <div class="gt-left">
        <h3>Toplam Tahmini Maliyet</h3>
        <p>${OUTBOUND[selOut].name} + ${RETURN[selRet].name} · 6 Kişi</p>
      </div>
      <div class="gt-right">
        <div class="gt-eur">€${Math.round(gt).toLocaleString('tr')}</div>
        <div class="gt-try">≈ ₺${Math.round(gt*EUR_TRY).toLocaleString('tr')}</div>
      </div>
    </div>
    <div class="gt-bar">${segs.map(s=>`<div class="gt-seg ${s.c}" style="width:${(s.v/gt*100)}%" title="${s.l}: €${Math.round(s.v)}"></div>`).join('')}</div>
    <div class="gt-legend">${segs.map(s=>`<div><span class="dot gt-seg ${s.c}" style="display:inline-block;width:8px;height:8px;border-radius:2px;"></span> ${s.l}: €${Math.round(s.v)}</div>`).join('')}</div>
  `;

  // Header chip
  document.getElementById('chipCost').querySelector('span').textContent = `€${Math.round(gt).toLocaleString('tr')}`;
  const totalKm = OUTBOUND[selOut].km + RETURN[selRet].km;
  document.getElementById('chipKm').querySelector('span').textContent = `~${totalKm.toLocaleString('tr')} km`;
}

/* ═══════ TIPS ═══════ */
function renderTips(){
  document.getElementById('tipsGrid').innerHTML = TIPS.map(t => `
    <div class="tip-card">
      <div class="tc-icon" style="background:${t.bg}"><i class="${t.icon}"></i></div>
      <h4>${t.title}</h4>
      <p>${t.text}</p>
    </div>
  `).join('');
}

/* ═══════ RENDER ALL ═══════ */
function renderAll(){
  drawMap();
  renderTimeline();
  renderCosts();
  renderTips();
}

/* ═══════ EVENTS ═══════ */
function bindEvents(){
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      curTab = this.dataset.tab;
      renderTimeline();
    });
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('themeToggle').innerHTML = next==='dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    setTiles();
  });

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    document.getElementById('header').classList.toggle('scrolled', window.scrollY > 50);
  });

  // Departure date/time event listeners
  const btnRecalc = document.getElementById('btnRecalculateTimes');
  const dateInput = document.getElementById('startDateInput');
  const timeInput = document.getElementById('startTimeInput');
  
  if (btnRecalc) {
    btnRecalc.addEventListener('click', () => {
      if (dateInput && dateInput.value) {
        const val = dateInput.value.split('-');
        baseStartDate = new Date(parseInt(val[0]), parseInt(val[1]) - 1, parseInt(val[2]));
      }
      if (timeInput && timeInput.value) {
        baseStartTime = timeInput.value;
      }
      renderTimeline();
    });
  }
  
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        const val = dateInput.value.split('-');
        baseStartDate = new Date(parseInt(val[0]), parseInt(val[1]) - 1, parseInt(val[2]));
        renderTimeline();
      }
    });
  }
  
  if (timeInput) {
    timeInput.addEventListener('change', () => {
      if (timeInput.value) {
        baseStartTime = timeInput.value;
        renderTimeline();
      }
    });
  }
}

// Global functions for onclick
window.pickComp = pickComp;
window.pickOut = pickOut;
window.pickRet = pickRet;
