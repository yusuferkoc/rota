/* ═══════════════════════════════════════════════════
   ROTA ASİSTANI · chat.js
   ~150 Avrupa şehri veritabanı + akıllı arama
   ═══════════════════════════════════════════════════ */

// Ek ülke verileri
if(!C.PL) C.PL={n:'Polonya',f:'🇵🇱',d:1.60,fp:8,hp:55};
if(!C.BE) C.BE={n:'Belçika',f:'🇧🇪',d:1.85,fp:14,hp:110};
if(!C.BA) C.BA={n:'Bosna-Hersek',f:'🇧🇦',d:1.50,fp:6,hp:40};
if(!C.ME) C.ME={n:'Karadağ',f:'🇲🇪',d:1.60,fp:8,hp:50};
if(!C.MK) C.MK={n:'K. Makedonya',f:'🇲🇰',d:1.45,fp:6,hp:40};
if(!C.AL) C.AL={n:'Arnavutluk',f:'🇦🇱',d:1.55,fp:5,hp:35};

// Ülke bazlı genel helal bilgisi
const GH={
  TR:null,
  BG:'Türk nüfusu sayesinde döner/kebap kolay. Marketlerde helal etiketli ürünler var.',
  RS:'Boşnak ızgara eti genelde helal. Ćevapi güvenli. "Svinjsko"=domuz, kaçının!',
  RO:'Helal et bulmak zor. Market tavuğu, pizza ve balık tercih edin.',
  HU:'Büyük şehirlerde Türk restoranları. Langos helal. Dönerci sınırlı.',
  HR:'Boşnak/Türk lokantaları büyük şehirlerde. Balık ve sebze güvenli.',
  SI:'Merkez civarında kebap dükkanları. Helal et sınırlı, balık tercih edin.',
  SK:'Döner dükkanları var ama az. Market ürünleri güvenli.',
  CZ:'Kebapçılar yaygın. "Vepřové"=domuz dikkat! Trdelník helal.',
  AT:'Döner her yerde. Favoriten/Ottakring helal kasap yoğun.',
  DE:'Türk dönercisi ve helal kasap HER şehirde! En kolay ülke.',
  NL:'Türk/Fas marketleri yaygın. Helal süpermarket bol.',
  IT:'Pizza Margherita ve deniz ürünleri güvenli. Büyük şehirlerde kebapçı.',
  GR:'DİKKAT: Gyros genelde domuz! "Kotopoulo" (tavuk) isteyin. Balık güvenli.',
  FR:'Kebapçılar yaygın. Büyük şehirlerde halal kasap (boucherie) var.',
  CH:'Pahalı ama kebapçılar var. Market + kendi yemeğiniz en ekonomik.',
  BE:'Türk/Fas topluluk var. Döner kolay bulunur.',
  LU:'Gare civarında kebapçılar. Küçük şehir ama bulunur.',
  PL:'Helal restoran az. Büyük şehirlerde kebapçı. Market ürünleri tercih edin.',
  BA:'Müslüman ülke! Helal yemek HER YERDE. Ćevapi, burek, baklava.',
  ME:'Kıyıda balık bol. İç kesimlerde Boşnak mutfağı helal.',
  MK:'Müslüman nüfus yüksek. Helal yemek kolay.',
  AL:'Müslüman çoğunluk. Helal her yerde.'
};

/* ═══════ ŞEHİR VERİTABANI (~150 şehir) ═══════ */
const CITIES=[
// ── TÜRKİYE ──
{n:'Konya',co:'TR',la:37.87,lo:32.49,d:'Mevlana şehri.'},
{n:'Ankara',co:'TR',la:39.93,lo:32.85,d:'Başkent. Anıtkabir.'},
{n:'İstanbul',a:['istanbul'],co:'TR',la:41.01,lo:28.98,d:'Boğaz, Sultanahmet, Ayasofya.'},
{n:'Edirne',co:'TR',la:41.68,lo:26.56,d:'Selimiye Camii, ciğer.'},
{n:'Bolu',co:'TR',la:40.73,lo:31.61,d:'Abant Gölü, doğa.'},
{n:'Eskişehir',a:['eskisehir'],co:'TR',la:39.77,lo:30.52,d:'Porsuk çayı, modern şehir.'},
{n:'Bursa',co:'TR',la:40.19,lo:29.06,d:'İskender kebap, Uludağ.'},
{n:'Antalya',co:'TR',la:36.90,lo:30.69,d:'Akdeniz, Kaleiçi.'},
{n:'İzmir',a:['izmir'],co:'TR',la:38.42,lo:27.14,d:'Ege kıyısı, Kordon.'},
{n:'Çanakkale',a:['canakkale'],co:'TR',la:40.15,lo:26.41,d:'Truva, şehitlikler.'},
// ── BULGARİSTAN ──
{n:'Sofya',a:['sofia'],co:'BG',la:42.70,lo:23.32,h:'Banya Başı Camii civarı helal. Zhenski Pazar kebapçılar. Al Safa helal market.',d:'Başkent. Aleksander Nevski, Vitosha.'},
{n:'Plovdiv',co:'BG',la:42.15,lo:24.75,h:'Eski şehirde Türk lokantaları. Kapana helal kebap/pide.',d:'Kültür başkenti. Roma tiyatrosu, Kapana.'},
{n:'Varna',co:'BG',la:43.21,lo:27.91,d:'Karadeniz tatil şehri. Plajlar.'},
{n:'Burgaz',a:['burgas'],co:'BG',la:42.50,lo:27.47,d:'Karadeniz kıyısı, plaj.'},
{n:'Veliko Tırnovo',a:['veliko tarnovo','tarnovo'],co:'BG',la:43.08,lo:25.63,d:'Ortaçağ kalesi, Tsarevets.'},
// ── SIRBİSTAN ──
{n:'Belgrad',a:['belgrade','beograd'],co:'RS',la:44.79,lo:20.45,h:'Boşnak restoranları helal ızgara. Dorćol/Stari Grad. "Svinjsko"=domuz kaçının!',d:'Kalemegdan, Ada Ciganlija, Knez Mihailova.'},
{n:'Niş',a:['nis'],co:'RS',la:43.32,lo:21.90,d:'Roma kalesi, Çele Kula.'},
{n:'Novi Sad',co:'RS',la:45.25,lo:19.85,d:'Petrovaradin kalesi, EXIT festivali.'},
{n:'Subotica',co:'RS',la:46.10,lo:19.66,d:'Art Nouveau mimari. Macaristan sınırı.'},
// ── ROMANYA ──
{n:'Bükreş',a:['bucharest','bucuresti'],co:'RO',la:44.43,lo:26.10,h:'Lipscani civarı döner/kebap. Carrefour\'da helal tavuk.',d:'Parlamento Sarayı, Lipscani eski şehir.'},
{n:'Sibiu',co:'RO',la:45.80,lo:24.15,d:'Transilvanya incisi. Büyük Meydan, ASTRA müzesi.'},
{n:'Braşov',a:['brasov'],co:'RO',la:45.65,lo:25.60,d:'Transilvanya. Kara Kilise, Bran Kalesi (Drakula).'},
{n:'Cluj-Napoca',a:['cluj'],co:'RO',la:46.77,lo:23.60,d:'Transilvanya başkenti. Üniversite şehri.'},
{n:'Timişoara',a:['timisoara'],co:'RO',la:45.75,lo:21.23,d:'Küçük Viyana. Devrim meydanı.'},
{n:'Constanța',a:['constanta'],co:'RO',la:44.18,lo:28.63,d:'Karadeniz kıyısı, Mamaia plajı.'},
// ── MACARİSTAN ──
{n:'Budapeşte',a:['budapest'],co:'HU',la:47.50,lo:19.04,h:'Kerepesi út Türk restoranları. Langos helal. Büyük Pazar meyve/sebze.',d:'Tuna, Parlamento, Széchenyi Termal, Buda Kalesi.'},
{n:'Debrecen',co:'HU',la:47.53,lo:21.63,d:'Macaristan 2. büyük şehri. Büyük kilise.'},
{n:'Szeged',co:'HU',la:46.25,lo:20.15,d:'Güneş şehri. Votive kilisesi.'},
{n:'Pécs',a:['pecs'],co:'HU',la:46.07,lo:18.23,d:'Erken Hristiyan mezarları (UNESCO).'},
{n:'Győr',a:['gyor'],co:'HU',la:47.69,lo:17.63,d:'Barok şehir merkezi. Viyana yolunda mola.'},
// ── HIRVATİSTAN ──
{n:'Zagreb',co:'HR',la:45.81,lo:15.98,h:'Tkalčićeva Türk/Boşnak restoranları. Dolac pazarı taze ürünler.',d:'Başkent. Yukarı Şehir, Dolac, Jelačić Meydanı.'},
{n:'Split',co:'HR',la:43.51,lo:16.44,d:'Diocletian Sarayı (UNESCO). Adriyatik sahili.'},
{n:'Dubrovnik',co:'HR',la:42.65,lo:18.09,d:'İnci! Sur içi eski şehir. GoT çekim yeri.'},
{n:'Zadar',co:'HR',la:44.12,lo:15.23,d:'Deniz orgu, Güneş Selamı. Hitchcock\'un en güzel gün batımı.'},
{n:'Pula',co:'HR',la:44.87,lo:13.85,d:'Roma amfi tiyatrosu. İstria yarımadası.'},
{n:'Rijeka',co:'HR',la:45.33,lo:14.44,d:'Liman şehri. Slovenya sınırı yakını.'},
// ── SLOVENYA ──
{n:'Ljubljana',a:['laibach'],co:'SI',la:46.06,lo:14.51,h:'Prešeren civarı kebap dükkanları. Balkan mutfağı helal seçenekler.',d:'Masal başkent. Üçlü Köprü, Kale teleferik.'},
{n:'Maribor',co:'SI',la:46.56,lo:15.65,d:'Dünyanın en yaşlı asması. Şarap bölgesi.'},
{n:'Bled',co:'SI',la:46.37,lo:14.11,d:'Göl ortasında kilise! Kremna rezina pasta. Muhteşem manzara.'},
{n:'Piran',co:'SI',la:45.53,lo:13.57,d:'Adriyatik\'te Venedik tarzı liman kasabası.'},
// ── SLOVAKYA ──
{n:'Bratislava',co:'SK',la:48.15,lo:17.11,d:'Tuna kıyısında şirin başkent. Viyana\'ya 1 saat.'},
{n:'Košice',a:['kosice'],co:'SK',la:48.72,lo:21.26,d:'Doğu Slovakya. Gotik katedral.'},
// ── ÇEKYA ──
{n:'Prag',a:['prague','praha'],co:'CZ',la:50.08,lo:14.44,h:'Wenceslas Meydanı kebapçılar. Trdelník helal. "Vepřové"=domuz dikkat!',d:'Karlov Köprüsü, Astronomik Saat, Kale, Petřín.'},
{n:'Brno',co:'CZ',la:49.20,lo:16.61,d:'Çekya 2. şehri. Špilberk kalesi.'},
{n:'Český Krumlov',a:['cesky krumlov','krumlov'],co:'CZ',la:48.81,lo:14.32,d:'Masalsı ortaçağ kasabası (UNESCO). Mutlaka görün!'},
{n:'Karlovy Vary',a:['karlsbad'],co:'CZ',la:50.23,lo:12.87,d:'Kaplıca şehri. Sıcak su kaynakları.'},
{n:'Plzeň',a:['plzen','pilsen'],co:'CZ',la:49.74,lo:13.38,d:'Pilsner birasının doğduğu yer.'},
// ── AVUSTURYA ──
{n:'Viyana',a:['vienna','wien'],co:'AT',la:48.21,lo:16.37,h:'Naschmarkt Türk/Arap tezgahları. Favoriten helal kasap bol. Etsan, Orient market.',d:'Schönbrunn, Stephansdom, Prater lunapark.'},
{n:'Salzburg',co:'AT',la:47.80,lo:13.05,d:'Mozart şehri. Hohensalzburg kalesi. Sound of Music.'},
{n:'Innsbruck',co:'AT',la:47.26,lo:11.39,d:'Alpler ortasında. Altın Çatı, kayak.'},
{n:'Graz',co:'AT',la:47.07,lo:15.44,d:'Avusturya 2. şehri. Kunsthaus, Schlossberg.'},
{n:'Linz',co:'AT',la:48.31,lo:14.29,d:'Tuna kıyısı. Ars Electronica.'},
{n:'Hallstatt',co:'AT',la:47.56,lo:13.65,d:'Göl kenarı masal kasaba (UNESCO). Çok turistik!'},
// ── ALMANYA ──
{n:'Berlin',co:'DE',la:52.52,lo:13.40,h:'Kreuzberg/Neukölln Türk cennet! Döner, lahmacun, pide. Mustafa\'s Gemüse Kebap efsane.',d:'Başkent. Brandenburger Tor, Duvar, Müze Adası.'},
{n:'Münih',a:['munich','münchen'],co:'DE',la:48.14,lo:11.58,h:'Schillerstraße Türk lokantaları. Adan Market helal kasap. Viktualienmarkt.',d:'Marienplatz, Englischer Garten, BMW Welt.'},
{n:'Frankfurt',co:'DE',la:50.11,lo:8.68,h:'Münchener Straße tamamen Türk! Helal döner/iskender/lahmacun cenneti.',d:'Römerberg, Main nehri, gökdelenler.'},
{n:'Hamburg',co:'DE',la:53.55,lo:10.00,d:'Liman şehri. Miniatur Wunderland, Speicherstadt.'},
{n:'Köln',a:['cologne','koln'],co:'DE',la:50.94,lo:6.96,h:'Keupstraße = Küçük İstanbul! Helal döner, pide, baklava.',d:'Dom Katedrali, Ren nehri.'},
{n:'Düsseldorf',a:['dusseldorf'],co:'DE',la:51.23,lo:6.78,d:'Moda ve sanat. Altstadt, Medienhafen.'},
{n:'Stuttgart',co:'DE',la:48.78,lo:9.18,d:'Mercedes ve Porsche müzeleri.'},
{n:'Nürnberg',a:['nuremberg','nurnberg'],co:'DE',la:49.45,lo:11.08,d:'Ortaçağ kalesi, Nürnberg sosisleri.'},
{n:'Dresden',co:'DE',la:51.05,lo:13.74,d:'Elbflorenz. Frauenkirche, Zwinger.'},
{n:'Leipzig',co:'DE',la:51.34,lo:12.37,d:'Müzik şehri. Bach, Gewandhaus.'},
{n:'Heidelberg',co:'DE',la:49.40,lo:8.69,d:'Romantik kale harabeleri, üniversite şehri.'},
{n:'Freiburg',co:'DE',la:47.99,lo:7.85,d:'Kara Orman kapısı. Münster katedrali.'},
{n:'Bremen',co:'DE',la:53.08,lo:8.80,d:'Bremen Mızıkacıları heykeli. Schnoor.'},
{n:'Hannover',co:'DE',la:52.37,lo:9.74,d:'Herrenhausen bahçeleri. Fuar şehri.'},
{n:'Rothenburg ob der Tauber',a:['rothenburg'],co:'DE',la:49.38,lo:10.19,d:'Ortaçağ masalı! Surlarla çevrili en güzel Alman kasabası.'},
{n:'Bamberg',co:'DE',la:49.89,lo:10.89,d:'Küçük Venedik. UNESCO eski şehir.'},
{n:'Würzburg',a:['wurzburg'],co:'DE',la:49.79,lo:9.94,d:'Residenz sarayı. Romantik Yol başlangıcı.'},
{n:'Bonn',co:'DE',la:50.74,lo:7.10,d:'Eski başkent. Beethoven evi.'},
// ── HOLLANDA ──
{n:'Rotterdam',co:'NL',la:51.92,lo:4.48,h:'West-Kruiskade helal cennet. Tanger Markt, Istanbul Market. Endonezya mutfağı helal.',d:'Erasmus Köprüsü, Markthal, Küp Evler.'},
{n:'Amsterdam',co:'NL',la:52.37,lo:4.90,h:'De Pijp bölgesi Türk/Fas. Albert Cuyp Market. Halal restoran çok.',d:'Kanal turu, Anne Frank, Rijksmuseum. NS treni ile gidin.'},
{n:'Den Haag',a:['the hague','lahey'],co:'NL',la:52.08,lo:4.30,d:'Hükümet merkezi. Madurodam, Scheveningen plajı.'},
{n:'Utrecht',co:'NL',la:52.09,lo:5.12,d:'Kanallar, Dom kulesi, üniversite şehri.'},
{n:'Delft',co:'NL',la:52.01,lo:4.36,d:'Mavi porselen, küçük kanallar.'},
{n:'Leiden',co:'NL',la:52.16,lo:4.49,d:'Üniversite şehri. Rembrandt doğum yeri.'},
{n:'Eindhoven',co:'NL',la:51.44,lo:5.47,d:'Tasarım/teknoloji. Philips müzesi.'},
{n:'Maastricht',co:'NL',la:50.85,lo:5.69,d:'En güneydeki şehir. Eski şehir, mağaralar.'},
// ── İTALYA ──
{n:'Roma',a:['rome'],co:'IT',la:41.90,lo:12.50,h:'Esquilino (Termini yakını) kebap dükkanları. Via Cavour Arap/Hint. Pizza al taglio güvenli. Roma Büyük Camii.',d:'Kolezyum, Vatikan, Trevi Çeşmesi, Pantheon.'},
{n:'Milano',a:['milan'],co:'IT',la:45.46,lo:9.19,h:'Via Padova helal bölge — Arap/Afrika kasap ve restoran. Pizza/risotto güvenli.',d:'Duomo, Galleria, Navigli, Son Akşam Yemeği.'},
{n:'Venedik',a:['venice','venezia'],co:'IT',la:45.44,lo:12.34,h:'Ada\'da helal yok. Mestre\'de dönerci. Pizza ve deniz ürünleri güvenli. Gelato helal.',d:'San Marco, Rialto, gondol, Murano cam.'},
{n:'Floransa',a:['florence','firenze'],co:'IT',la:43.77,lo:11.25,h:'San Lorenzo pazarı civarı kebapçılar. Pizza ve gelato güvenli. Deniz ürünleri.',d:'Duomo, Uffizi, Ponte Vecchio, Toskana kapısı.'},
{n:'Napoli',a:['naples','napoli'],co:'IT',la:40.85,lo:14.27,d:'Pizza\'nın doğduğu yer! Pompeii, Vezüv.'},
{n:'Verona',co:'IT',la:45.44,lo:10.99,d:'Romeo & Juliet. Arena, Piazza delle Erbe.'},
{n:'Bologna',co:'IT',la:44.49,lo:11.34,d:'Yemek başkenti. İki kule, arkadlar.'},
{n:'Torino',a:['turin'],co:'IT',la:45.07,lo:7.69,d:'Piemonte başkenti. Mısır müzesi.'},
{n:'Genova',a:['genoa'],co:'IT',la:44.41,lo:8.93,d:'Akvaryum, eski liman. Cinque Terre yakın.'},
{n:'Pisa',co:'IT',la:43.72,lo:10.40,d:'Eğik Kule! Mucizeler Meydanı.'},
{n:'Siena',co:'IT',la:43.32,lo:11.33,d:'Palio yarışları, Campo Meydanı.'},
{n:'Ancona',co:'IT',la:43.62,lo:13.52,d:'Adriyatik limanı. Yunanistan feribotu.'},
{n:'Bari',co:'IT',la:41.12,lo:16.87,d:'Puglia başkenti. Yunanistan feribotu.'},
{n:'Rimini',co:'IT',la:44.06,lo:12.57,d:'Adriyatik plajı. San Marino yakın.'},
{n:'Padova',a:['padua'],co:'IT',la:45.41,lo:11.88,d:'Üniversite şehri. Venedik\'e 30 dk.'},
{n:'Trieste',co:'IT',la:45.65,lo:13.77,d:'Slovenya sınırında. Habsburg mirası.'},
{n:'Como',co:'IT',la:45.81,lo:9.08,d:'Como Gölü. Muhteşem villa manzaraları.'},
{n:'Cinque Terre',a:['cinque terre','5 terre'],co:'IT',la:44.13,lo:9.71,d:'5 renkli köy! UNESCO. Yürüyüş parkuru.'},
{n:'Amalfi',co:'IT',la:40.63,lo:14.60,d:'Amalfi Kıyısı. Muhteşem sahil yolu.'},
// ── YUNANİSTAN ──
{n:'Atina',a:['athens','athina'],co:'GR',la:37.97,lo:23.73,d:'Akropolis, Parthenon, Plaka.'},
{n:'Selanik',a:['thessaloniki','thessalonica'],co:'GR',la:40.63,lo:22.94,h:'"Kotopoulo" (tavuk) isteyin! Gyros domuz olabilir. Ladadika balık güvenli.',d:'Beyaz Kule, sahil. Ladadika akşam yemeği.'},
{n:'İgoumenitsa',a:['igoumenitsa'],co:'GR',la:39.50,lo:20.27,d:'Feribot limanı. İtalya bağlantısı.'},
{n:'Kavala',co:'GR',la:40.94,lo:24.41,d:'Liman şehri. Antik Philippi yakın.'},
{n:'Patra',a:['patras'],co:'GR',la:38.25,lo:21.73,d:'Batı Yunanistan. İtalya feribotu.'},
{n:'Kalambaka',a:['meteora'],co:'GR',la:39.71,lo:21.63,d:'METEORA! Kayaların üstünde manastırlar. Muhteşem!'},
// ── FRANSA ──
{n:'Paris',co:'FR',la:48.86,lo:2.35,h:'Belleville, Barbès, Goutte d\'Or helal cennet! Rue du Faubourg Saint-Denis dönerci dolu. Quick fast food helal şubeler.',d:'Eyfel, Louvre, Notre-Dame, Champs-Élysées.'},
{n:'Lyon',co:'FR',la:45.76,lo:4.84,h:'Guillotière bölgesi helal restoran/kasap. Lyon mutfağı domuz ağırlıklı DİKKAT!',d:'Gastronomi başkenti. Vieux Lyon, Fourvière.'},
{n:'Marsilya',a:['marseille'],co:'FR',la:43.30,lo:5.37,h:'Noailles bölgesi helal cennet! Fransa\'nın en büyük Müslüman nüfusu.',d:'Eski liman, Notre-Dame de la Garde.'},
{n:'Nice',a:['nis fr'],co:'FR',la:43.71,lo:7.26,h:'Eski şehirde kebapçılar. Socca (nohut pankeki) helal yerel lezzet. Deniz ürünleri.',d:'Côte d\'Azur! Promenade des Anglais, plaj.'},
{n:'Strasbourg',a:['strasburg'],co:'FR',la:48.57,lo:7.75,d:'Avrupa Parlamentosu. Petite France, katedrali.'},
{n:'Bordeaux',co:'FR',la:44.84,lo:-0.58,d:'Şarap başkenti. Su aynası meydanı.'},
{n:'Toulouse',co:'FR',la:43.60,lo:1.44,d:'Pembe şehir. Uzay müzesi (Cité de l\'Espace).'},
{n:'Lille',co:'FR',la:50.63,lo:3.06,d:'Kuzey Fransa. Eski Borsa, Wazemmes pazarı.'},
{n:'Montpellier',co:'FR',la:43.61,lo:3.88,d:'Akdeniz\'e yakın üniversite şehri.'},
{n:'Cannes',co:'FR',la:43.55,lo:7.02,d:'Film festivali. Croisette sahili.'},
{n:'Avignon',co:'FR',la:43.95,lo:4.81,d:'Papalar Sarayı. Ünlü köprü.'},
{n:'Colmar',co:'FR',la:48.08,lo:7.36,d:'Küçük Venedik! Alsace masalı kasaba.'},
{n:'Dijon',co:'FR',la:47.32,lo:5.04,d:'Hardal şehri. Burgundy şarap bölgesi.'},
{n:'Reims',co:'FR',la:49.25,lo:3.88,d:'Şampanya başkenti. Gotik katedral.'},
// ── İSVİÇRE ──
{n:'Zürih',a:['zurich','zürich'],co:'CH',la:47.37,lo:8.54,d:'Finans merkezi. Göl, eski şehir.'},
{n:'Luzern',a:['lucerne'],co:'CH',la:47.05,lo:8.31,d:'Kapellbrücke, göl manzarası, Alpler.'},
{n:'Bern',co:'CH',la:46.95,lo:7.45,d:'Başkent. Ayı parkı, saat kulesi.'},
{n:'Cenevre',a:['geneva','geneve','genf'],co:'CH',la:46.20,lo:6.14,d:'BM merkezi. Jet d\'Eau fıskiyesi.'},
{n:'Basel',co:'CH',la:47.56,lo:7.59,d:'3 ülke sınırı. Sanat müzeleri.'},
{n:'Interlaken',co:'CH',la:46.69,lo:7.86,d:'İki göl arası. Jungfrau, paragliding, Alpler.'},
// ── BELÇİKA ──
{n:'Brüksel',a:['brussels','brussel','bruxelles'],co:'BE',la:50.85,lo:4.35,d:'AB başkenti. Grand Place, Manneken Pis, çikolata.'},
{n:'Brugge',a:['bruges','brügge'],co:'BE',la:51.21,lo:3.22,d:'Ortaçağ masalı! Kanallar, çikolata, waffle.'},
{n:'Gent',a:['ghent'],co:'BE',la:51.05,lo:3.72,d:'Gravensteen kalesi. Brugge\'den az turistik.'},
{n:'Antwerp',a:['antwerpen','anvers'],co:'BE',la:51.22,lo:4.40,d:'Elmas başkenti. Moda, MAS müzesi.'},
// ── LÜKSEMBURG ──
{n:'Lüksemburg',a:['luxembourg'],co:'LU',la:49.61,lo:6.13,d:'Minik ama zengin. Casemates, Corniche. Ücretsiz toplu taşıma!'},
// ── POLONYA ──
{n:'Varşova',a:['warsaw','warszawa'],co:'PL',la:52.23,lo:21.01,d:'Başkent. Yeniden inşa eski şehir (UNESCO).'},
{n:'Krakow',a:['cracow','kraków'],co:'PL',la:50.06,lo:19.94,d:'Eski başkent. Wawel, Auschwitz yakın.'},
{n:'Wroclaw',a:['breslau'],co:'PL',la:51.11,lo:17.04,d:'Cüceler şehri! 100 köprü, renkli meydan.'},
{n:'Gdansk',a:['danzig'],co:'PL',la:54.35,lo:18.65,d:'Baltık kıyısı. Amber, eski şehir.'},
// ── BOSNA-HERSEK ──
{n:'Saraybosna',a:['sarajevo'],co:'BA',la:43.86,lo:18.41,h:'Müslüman ülke! Baščaršija\'da ćevapi, burek, baklava HER YERDE helal.',d:'Baščaršija, Latin Köprüsü. Doğu-Batı buluşması.'},
{n:'Mostar',co:'BA',la:43.34,lo:17.81,h:'Helal her yerde. Köprü civarı ćevapi lokantaları.',d:'Ünlü Köprü! UNESCO. Osmanlı mirası.'},
{n:'Travnik',co:'BA',la:44.23,lo:17.67,d:'Osmanlı vezir şehri. Kaleler, çeşmeler.'},
// ── KARADAĞ ──
{n:'Kotor',co:'ME',la:42.42,lo:18.77,d:'Körfez manzarası! Sur içi eski şehir (UNESCO).'},
{n:'Budva',co:'ME',la:42.29,lo:18.84,d:'Adriyatik plajları. Eski şehir.'},
// ── KUZEY MAKEDONYA ──
{n:'Üsküp',a:['skopje'],co:'MK',la:41.99,lo:21.43,d:'Taş Köprü, Eski Çarşı. Helal yemek kolay.'},
{n:'Ohrid',co:'MK',la:41.12,lo:20.80,d:'Ohrid Gölü (UNESCO). Balkanların incisi.'},
// ── ARNAVUTLUK ──
{n:'Tiran',a:['tirana'],co:'AL',la:41.33,lo:19.82,d:'Başkent. Skanderbeg Meydanı, Bunk\'Art müzesi.'}
];

/* ═══════ YARDIMCI FONKSİYONLAR ═══════ */
const ORIG_OUT = JSON.parse(JSON.stringify(OUTBOUND));
const ORIG_RET = JSON.parse(JSON.stringify(RETURN));

function norm(s){
  return s.toLowerCase().replace(/ı/g,'i').replace(/İ/g,'i').replace(/ö/g,'o').replace(/ü/g,'u')
    .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/â/g,'a').replace(/é/g,'e')
    .replace(/è/g,'e').replace(/ä/g,'a').replace(/ë/g,'e').replace(/ô/g,'o').replace(/î/g,'i')
    .replace(/ú/g,'u').replace(/ñ/g,'n').replace(/ř/g,'r').replace(/ž/g,'z').replace(/š/g,'s')
    .replace(/č/g,'c').replace(/ý/g,'y').replace(/á/g,'a').replace(/í/g,'i').replace(/ő/g,'o')
    .replace(/ű/g,'u').replace(/ă/g,'a').replace(/ț/g,'t').replace(/ę/g,'e').replace(/ł/g,'l')
    .replace(/ń/g,'n').replace(/ź/g,'z').replace(/ś/g,'s');
}

function searchCity(q){
  const nq=norm(q.trim());
  if(nq.length<2) return [];
  return CITIES.filter(c=>{
    if(norm(c.n).includes(nq)) return true;
    if(c.a && c.a.some(a=>norm(a).includes(nq))) return true;
    return false;
  }).slice(0,6);
}

function haversine(la1,lo1,la2,lo2){
  const R=6371, dL=(la2-la1)*Math.PI/180, dO=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function bestInsertPos(stops,la,lo){
  let best=1,bestD=Infinity;
  for(let i=0;i<stops.length-1;i++){
    const dAB=haversine(stops[i].la,stops[i].lo,stops[i+1].la,stops[i+1].lo);
    const dAN=haversine(stops[i].la,stops[i].lo,la,lo);
    const dNB=haversine(la,lo,stops[i+1].la,stops[i+1].lo);
    const det=dAN+dNB-dAB;
    if(det<bestD){bestD=det;best=i+1;}
  }
  return best;
}

function recalcDays(stops){
  for(let i=1;i<stops.length;i++){
    stops[i].day=stops[i-1].day+Math.max(stops[i-1].n||0, stops[i-1].t==='start'||stops[i-1].t==='border'?0:1);
    // Fix: start/border with 0 nights should not add a day
    if(i>0 && stops[i-1].n===0 && (stops[i-1].t==='start'||stops[i-1].t==='border'))
      stops[i].day=stops[i-1].day;
  }
}

function addCityToRoute(cityIdx, nights, routeType){
  const city=CITIES[cityIdx];
  const cn=C[city.co];
  if(!cn) return '❌ Ülke verisi bulunamadı.';
  const route=routeType==='out'?OUTBOUND[selOut]:RETURN[selRet];
  const stops=route.stops;
  // Zaten var mı?
  if(stops.some(s=>norm(s.c)===norm(city.n))) return `⚠️ ${city.n} zaten bu rotada!`;
  const pos=bestInsertPos(stops,city.la,city.lo);
  const prev=stops[pos-1], next=stops[pos];
  const dPrev=Math.round(haversine(prev.la,prev.lo,city.la,city.lo)*1.3);
  const dNext=next?Math.round(haversine(city.la,city.lo,next.la,next.lo)*1.3):0;
  // Yeni durak
  const ns={
    c:city.n, co:city.co, la:city.la, lo:city.lo,
    t:nights>0?'overnight':'border', day:0, n:nights,
    dk:dNext, dt:dNext>0?`~${Math.max(1,Math.round(dNext/80))} saat`:'',
    desc:city.d||'',
    halal:city.h||GH[city.co]||'Şehir merkezinde kebap/döner arayın.',
    accom:city.ac||`~€${cn.hp}/gece. Booking.com veya Airbnb tercih edin.`,
    tips:[]
  };
  // Önceki durağın mesafesini güncelle
  prev.dk=dPrev;
  prev.dt=dPrev>0?`~${Math.max(1,Math.round(dPrev/80))} saat`:'';
  stops.splice(pos,0,ns);
  recalcDays(stops);
  renderAll();
  return `✅ ${cn.f} ${city.n} ${routeType==='out'?'gidiş':'dönüş'} rotasına eklendi (${nights} gece). Konum: ${pos}. sıra.`;
}

function removeCityFromRoute(cityName){
  const qn=norm(cityName);
  // Gidiş rotasında ara
  let stops=OUTBOUND[selOut].stops;
  let idx=stops.findIndex(s=>norm(s.c).includes(qn)&&s.t!=='start'&&s.t!=='destination'&&s.t!=='end');
  let found=false, which='gidiş';
  if(idx>0){found=true;}
  else{
    stops=RETURN[selRet].stops;
    idx=stops.findIndex(s=>norm(s.c).includes(qn)&&s.t!=='start'&&s.t!=='end'&&s.t!=='destination');
    if(idx>0){found=true;which='dönüş';}
  }
  if(!found) return `❌ "${cityName}" rotada bulunamadı veya silinemez (başlangıç/bitiş durağı).`;
  const name=stops[idx].c;
  // Önceki durağın mesafesini güncelle
  if(idx>0 && idx<stops.length-1){
    const prev=stops[idx-1],next=stops[idx+1];
    prev.dk=Math.round(haversine(prev.la,prev.lo,next.la,next.lo)*1.3);
    prev.dt=prev.dk>0?`~${Math.max(1,Math.round(prev.dk/80))} saat`:'';
  }
  stops.splice(idx,1);
  recalcDays(stops);
  renderAll();
  return `🗑️ ${name} ${which} rotasından kaldırıldı.`;
}

function resetRoutes(){
  OUTBOUND.forEach((r,i)=>{r.stops=JSON.parse(JSON.stringify(ORIG_OUT[i].stops));});
  RETURN.forEach((r,i)=>{r.stops=JSON.parse(JSON.stringify(ORIG_RET[i].stops));});
  renderAll();
  return '🔄 Tüm rotalar varsayılana sıfırlandı.';
}

/* ═══════ CHAT UI ═══════ */
let chatOpen=false;

function initChat(){
  const fab=document.getElementById('chatFab');
  const panel=document.getElementById('chatPanel');
  const close=document.getElementById('chatClose');
  const input=document.getElementById('chatIn');
  const send=document.getElementById('chatSend');

  fab.addEventListener('click',()=>{chatOpen=!chatOpen;panel.classList.toggle('open',chatOpen);fab.innerHTML=chatOpen?'<i class="fas fa-times"></i>':'<i class="fas fa-comments"></i>';if(chatOpen)input.focus();});
  close.addEventListener('click',()=>{chatOpen=false;panel.classList.remove('open');fab.innerHTML='<i class="fas fa-comments"></i>';});
  send.addEventListener('click',()=>handleInput());
  input.addEventListener('keydown',e=>{if(e.key==='Enter')handleInput();});

  // Hoş geldin mesajı
  addMsg('sys',`Merhaba! Ben rota asistanınız. 🧭

<b>Yapabileceklerim:</b>
• Şehir adı yazın → arayın ve rotaya ekleyin
• <code>sil Viyana</code> → şehri rotadan çıkarın
• <code>sıfırla</code> → rotaları varsayılana döndürün
• <code>yardım</code> → komut listesi

<b>${CITIES.length} Avrupa şehri</b> veritabanında arama yapabilirsiniz.`);
}

function addMsg(type,html){
  const box=document.getElementById('chatMsgs');
  const div=document.createElement('div');
  div.className='chat-msg '+type;
  div.innerHTML=html;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
}

function handleInput(){
  const input=document.getElementById('chatIn');
  const raw=input.value.trim();
  if(!raw) return;
  input.value='';
  addMsg('user',raw);

  const lower=raw.toLowerCase();

  // Komutlar
  if(lower==='yardım'||lower==='help'){
    addMsg('sys',`<b>Komutlar:</b>
• Şehir adı yazın → arama sonuçları
• <code>sil [şehir]</code> → rotadan kaldır
• <code>sıfırla</code> → varsayılan rotalara dön
• <code>yardım</code> → bu mesaj

<b>Örnekler:</b> Viyana, Salzburg, Dubrovnik, Saraybosna...`);
    return;
  }

  if(lower==='sıfırla'||lower==='reset'||lower==='sifirla'){
    addMsg('sys',resetRoutes());
    return;
  }

  // Sil komutu
  if(lower.startsWith('sil ')){
    const city=raw.substring(4).trim();
    addMsg('sys',removeCityFromRoute(city));
    return;
  }
  if(lower.endsWith(' sil')){
    const city=raw.substring(0,raw.length-4).trim();
    addMsg('sys',removeCityFromRoute(city));
    return;
  }

  // Şehir araması
  const results=searchCity(raw);
  if(results.length===0){
    addMsg('sys',`🔍 "${raw}" ile eşleşen şehir bulunamadı. Farklı bir yazım deneyin.`);
    return;
  }

  let html='<div class="cr-list">';
  results.forEach((c,i)=>{
    const ci=CITIES.indexOf(c);
    const cn=C[c.co];
    const isTR=c.co==='TR';
    html+=`<div class="cr-card">
      <div class="cr-top"><strong>${cn.f} ${c.n}</strong> <small>${cn.n}</small></div>
      <div class="cr-desc">${c.d||''}</div>
      ${!isTR?`<div class="cr-acts">
        <select id="crN${ci}" class="cr-sel"><option value="1">1 gece</option><option value="2">2 gece</option><option value="3">3 gece</option><option value="0">Transit</option></select>
        <button onclick="chatAdd(${ci},'out')" class="cr-btn out">Gidiş +</button>
        <button onclick="chatAdd(${ci},'ret')" class="cr-btn ret">Dönüş +</button>
      </div>`:`<div class="cr-acts"><small style="color:var(--muted)">Türkiye durağı (transit)</small></div>`}
    </div>`;
  });
  html+='</div>';
  addMsg('sys',html);
}

window.chatAdd=function(ci,rt){
  const sel=document.getElementById('crN'+ci);
  const nights=sel?parseInt(sel.value):1;
  const result=addCityToRoute(ci,nights,rt);
  addMsg('sys',result);
};

// Override renderCosts for dynamic km
const _rc=renderCosts;
renderCosts=function(){
  _rc();
  const outKm=OUTBOUND[selOut].stops.reduce((s,x)=>s+(x.dk||0),0);
  const retKm=RETURN[selRet].stops.reduce((s,x)=>s+(x.dk||0),0);
  document.getElementById('chipKm').querySelector('span').textContent=`~${(outKm+retKm).toLocaleString('tr')} km`;
};

document.addEventListener('DOMContentLoaded',initChat);
