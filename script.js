// Inicializa el mapa
const map = L.map('map').setView([41.3851, 2.1734], 13); // Coordenadas de Barcelona

// Agrega un mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Crear un control personalizado para el texto "Desarrollado por Raul Mas"
const creditControl = L.control({ position: 'bottomleft' }); // Posición en la esquina inferior izquierda

creditControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-control-credit'); // Clase CSS para el control
    div.style.backgroundColor = 'white'; // Fondo blanco
    div.style.padding = '5px 10px'; // Espaciado interno
    div.style.border = '1px solid #ccc'; // Borde ligero
    div.style.borderRadius = '5px'; // Bordes redondeados
    div.style.fontSize = '12px'; // Tamaño de fuente
    div.style.fontFamily = 'Arial, sans-serif'; // Fuente
    div.style.color = '#333'; // Color del texto
    div.innerHTML = 'Desarrollado por Raul Mas'; // Texto a mostrar
    return div;
};

// Añadir el control al mapa
creditControl.addTo(map);

// Referencias a elementos del DOM
const puntosDesplegable = document.getElementById('puntos-desplegable');
const searchBox = document.getElementById('search-box');
const rutaBtn = document.getElementById('ruta-btn');

// Variables globales
let currentPosition = null; // Guarda la posición actual del usuario
let selectedMarker = null; // Guarda el marcador seleccionado actualmente
let selectedPointCoords = null; // Guarda las coordenadas del punto seleccionado (ya sea por desplegable o buscador)

// Ícono predeterminado (azul)
const defaultIcon = L.icon({
    iconUrl: './images/marker-icon.png', // Ruta local al ícono azul
    iconSize: [25, 41], // Tamaño del ícono
    iconAnchor: [12, 41] // Punto de anclaje del ícono
});

// Ícono seleccionado (rojo)
const selectedIcon = L.icon({
    iconUrl: './images/marker-icon-red.png', // Ruta local al ícono rojo
    iconSize: [25, 41], // Tamaño del ícono
    iconAnchor: [12, 41] // Punto de anclaje del ícono
});

// Datos de los puntos de interés (colocados al inicio del archivo)
window.puntosDeInteres = [
  { nombre: "Ram de l'Aigua", codigo: "0000", coords: [41.422472222, 2.204527777] },
  { nombre: "Grup Mare de Déu de la Fe", codigo: "0001", coords: [41.422688, 2.197937] },
  { nombre: "Grup Montseny", codigo: "0002", coords: [41.422149, 2.197734] },
  { nombre: "Doctor Serrat, Pl.", codigo: "0005", coords: [41.41167, 2.186624] },
  { nombre: "Valentí Almirall, Pl.", codigo: "0006", coords: [41.408787, 2.192204] },
  { nombre: "València- Enamorats(Pl. de l'Oca)", codigo: "0007", coords: [41.408805555, 2.184972222] },
  { nombre: "Sant Josep de Calassanç, Pl.", codigo: "0008", coords: [41.412533, 2.180733] },
  { nombre: "Can Robacols, Pl.", codigo: "0011", coords: [41.412040909, 2.183234067] },
  { nombre: "Bac de Roda- Andrade", codigo: "0013", coords: [41.412900407, 2.196564521] },
  { nombre: "Cantàbria- Andrade- Puigecerdà- Concili de Trento", codigo: "0019", coords: [41.418957625, 2.203645739] },
  { nombre: "Trajana, Via- Santander- Verneda, Pg.- Binefar", codigo: "0020", coords: [41.427388888, 2.206027777] },
  { nombre: "Can Felipa, Pl.(Fábrica Catex)", codigo: "0022", coords: [41.403638888, 2.201] },
  { nombre: "Guipúscoa- Biscaia", codigo: "0024", coords: [41.413, 2.192027777] },
  { nombre: "Zenobia Camprubí, Pl.", codigo: "0025", coords: [41.418083333, 2.20925] },
  { nombre: "Pl. Puigcerda", codigo: "0028", coords: [41.417451851, 2.207337714] },
  { nombre: "València- Espronceda- Clot- Biscaia", codigo: "0029", coords: [41.414333886, 2.191605111] },
  { nombre: "Josep Trueta, Jardins", codigo: "0033", coords: [41.403916666, 2.204944444] },
  { nombre: "Xavier Benguerel, Jardins de", codigo: "0036", coords: [41.403833333, 2.19975] },
  { nombre: "Av. Meridiana (consell de Cent - Clot)", codigo: "0038", coords: [41.406, 2.187] },
  { nombre: "Andrade( Agricultura- Treball)", codigo: "0042", coords: [41.416383503, 2.202636153] },
  { nombre: "Doctor Zamenhof", codigo: "0043", coords: [41.417138888, 2.194694444] },
  { nombre: "Alcalá de Guadaira", codigo: "0044", coords: [41.417194444, 2.196972222] },
  { nombre: "Prim, Rbla.(Guipúscoa- Binefar)", codigo: "0046", coords: [41.422472222, 2.204527777] },
  { nombre: "Juan Antonio Parera, C.V.(Menorca- Treball)", codigo: "0047", coords: [41.418833333, 2.196999999] },
  { nombre: "Prim, Rbla.(Gran Via- Andrade)", codigo: "0051", coords: [41.420201125, 2.207627381] },
  { nombre: "Sant Martí, Parc de", codigo: "0055", coords: [41.419472222, 2.198222222] },
  { nombre: "Clot, Parc del", codigo: "0056", coords: [41.407222222, 2.190361111] },
  { nombre: "Plaça de la Palmera de Sant Martí", codigo: "0058", coords: [41.419333333, 2.204444444] },
  { nombre: "Plaça de la Palmera de Sant Martí", codigo: "005802", coords: [41.419305555, 2.204694444] },
  { nombre: "Camp Arriassa( placetes)", codigo: "0066", coords: [41.424793307, 2.203478699] },
  { nombre: "Gran Via, Parc Lineal(Sant Joan de Malta- Bac de Roda)", codigo: "0069", coords: [41.408916666, 2.193555555] },
  { nombre: "Heroines de Girona, Pl.", codigo: "0070", coords: [41.410361111, 2.179694444] },
  { nombre: "Poblenou, Parc", codigo: "0076", coords: [41.39679248, 2.206583949] },
  { nombre: "Prim, Rbla.(Cristobal de Moura- Pere IV)", codigo: "0081", coords: [41.417532699, 2.211237672] },
  { nombre: "Joana Tomàs, Jardins de", codigo: "0087", coords: [41.412194444, 2.188249999] },
  { nombre: "Perú, Pl.", codigo: "0088", coords: [41.414555081, 2.203950792] },
  { nombre: "Creu Roja, Pl. de la", codigo: "0089", coords: [41.407143553, 2.193835833] },
  { nombre: "Port Olímpic, Parc del", codigo: "0092", coords: [41.389002572, 2.197719999] },
  { nombre: "Carles I, Parc de", codigo: "0093", coords: [41.387242927, 2.193399964] },
  { nombre: "Prim, Rbla.(Llull- Pallars)", codigo: "0094", coords: [41.413027777, 2.216944444] },
  { nombre: "Prim, Rbla.(Pere IV- Gran Via)", codigo: "0095", coords: [41.418916998, 2.209509737] },
  { nombre: "Espai Lúdic Canopia Urbana", codigo: "0097", coords: [41.404, 2.185] },
  { nombre: "Plaça de la infancia", codigo: "0102", coords: [41.4135, 2.196861111] },
  { nombre: "Porxos, Pl.", codigo: "0107", coords: [41.414629366, 2.199079909] },
  { nombre: "Eduardo Torroja, Pl.", codigo: "0108", coords: [41.415383249, 2.19998004] },
  { nombre: "S.O. Besòs, C.V.(Bernat Desclot- Narbona- Perpinyà- Bernat Metge)", codigo: "0109", coords: [41.41965338, 2.211810336] },
  { nombre: "Lluis Borrassa Perpinya", codigo: "0114", coords: [41.416805555, 2.217027777] },
  { nombre: "Aragó- Guipúscoa", codigo: "0116", coords: [41.411333333, 2.190444444] },
  { nombre: "Aragó- Guipúscoa", codigo: "011602", coords: [41.409471935, 2.188064045] },
  { nombre: "Meridiana, Av.(Consell de Cent- Aragó)", codigo: "0122", coords: [41.408194444, 2.186888888] },
  { nombre: "Diagonal, Av.( Selva de Mar- Josep Plà)", codigo: "0124", coords: [41.410102887, 2.212751351] },
  { nombre: "Prim, Rbla.(Binefar- Santander)", codigo: "0125", coords: [41.424388224, 2.202215112] },
  { nombre: "Jardins del Maresme (Pirm, Rbla.(Pallars- Veneçuela)", codigo: "0127", coords: [41.414823228, 2.214130226] },
  { nombre: "Espronceda, Pl.", codigo: "0131", coords: [41.410143196, 2.197723177] },
  { nombre: "Verneda, Pl.", codigo: "0133", coords: [41.423305555, 2.201277777] },
  { nombre: "Plaça de la Pau", codigo: "0145", coords: [41.423035741, 2.208538321] },
  { nombre: "Plaça de la Cultura", codigo: "0146", coords: [41.42131565, 2.207278763] },
  { nombre: "30, C.V.(Maresme, Pl.)", codigo: "0147", coords: [41.412416666, 2.215861111] },
  { nombre: "30, C.V.(Diagonal Mar, Pl.)", codigo: "0148", coords: [41.411138888, 2.214027777] },
  { nombre: "30 C.V.(Llull(Diagonal, Av.- Prim, Rbla.))", codigo: "0150", coords: [41.41225, 2.216666666] },
  { nombre: "Mercè Capsir, Pl.", codigo: "0153", coords: [41.415194444, 2.196749999] },
  { nombre: "Sàsser 1", codigo: "0159", coords: [41.418666714, 2.215053163] },
  { nombre: "Rambla de Poblenou, Pallars interior", codigo: "0164", coords: [41.40175, 2.199388888] },
  { nombre: "S.O. Besòs, C.V.(Germans Serra, Pl.)", codigo: "0168", coords: [41.416931959, 2.212956074] },
  { nombre: "S.O. Besòs, C.V.(Jaume Huguet, Pl.)", codigo: "0169", coords: [41.417960525, 2.211890634] },
  { nombre: "30, C.V.(Diagonal- Llull)", codigo: "0170", coords: [41.411472222, 2.217805555] },
  { nombre: "30, C.V.(Diagonal- Llull)", codigo: "017002", coords: [41.411, 2.216611111] },
  { nombre: "Bogatell, Av.(Marina- Alaba)", codigo: "0174", coords: [41.392904075, 2.197899298] },
  { nombre: "Pujades- Marina- Camí Antic de Mataró", codigo: "0176", coords: [41.392805555, 2.189083333] },
  { nombre: "Ramon Turró- Joan Miró(interior)", codigo: "0182", coords: [41.391888888, 2.192583333] },
  { nombre: "S.O. Besòs, C.V.(Alfons el Magnànim(Cristobal de Moura- Jaume Fabré)", codigo: "0198", coords: [41.416339301, 2.214542722] },
  { nombre: "S.O. Besòs, C.V.(Alfons el Magnànim(Cristobal de Moura- Jaume Fabré)", codigo: "019802", coords: [41.415910897, 2.215122241] },
  { nombre: "S.O. Besòs, C.V.(Alfons el Magnànim(Cristobal de Moura- Jaume Fabré)", codigo: "019803", coords: [41.415384802, 2.215906344] },
  { nombre: "Jardins de Victoria Kent(Concili de Trento-Bac de Roda)", codigo: "0200", coords: [41.414, 2.195] },
  { nombre: "La Pau, C.V.(Manuel Ainaud, Pl.)", codigo: "0204", coords: [41.421388888, 2.209444444] },
  { nombre: "Pl. d'Artur Martorell", codigo: "0205", coords: [41.420861111, 2.2085] },
  { nombre: "Plaça de la Conchita Badia", codigo: "0206", coords: [41.422, 2.20625] },
  { nombre: "Pl. de Fernando de los Ríos", codigo: "0208", coords: [41.42390651, 2.208108894] },
  { nombre: "La Pau, C.V.(Clementina Arderiu, Pl.)", codigo: "0209", coords: [41.422466333, 2.210878797] },
  { nombre: "Julio González, Pl.", codigo: "0211", coords: [41.401222222, 2.206916666] },
  { nombre: "S.O. Besòs, C.V.(Alfons el Magnànim- Lluis Borrassà- St. Ramon de Penyafort- Jaume Fabre)", codigo: "0216", coords: [41.415054617, 2.219009412] },
  { nombre: "Can Miralletes(Conca- Sant Antoni Maria Claret- Indústria)", codigo: "0218", coords: [41.413944444, 2.179333333] },
  { nombre: "Joaquim Maurin, Pl.(Menorca-Agricultura-Pont del Treball-Cantàbria)", codigo: "0219", coords: [41.421271477, 2.198304229] },
  { nombre: "València- Espronceda", codigo: "0220", coords: [41.414111111, 2.192166666] },
  { nombre: "Jardins Clot de la Mel", codigo: "0221", coords: [41.412366979, 2.194991697] },
  { nombre: "CV Menorca-Josep Miret- Puigcerdà", codigo: "0223", coords: [41.421621673, 2.202033571] },
  { nombre: "CV Menorca-Josep Miret- Puigcerdà", codigo: "022302", coords: [41.421499999, 2.200861111] },
  { nombre: "S.O.Besós(Alfons el Magnànim-Jaume Fabre-Llull)", codigo: "0225", coords: [41.414, 2.217] },
  { nombre: "S.O. Besòs, C.V.(Alfons El Magnànim(Bernat Metge- Cristobal de Moura))", codigo: "0226", coords: [41.417055555, 2.213416666] },
  { nombre: "S.O. Besòs, C.V.(Alfons El Magnànim(Bernat Metge- Cristobal de Moura))", codigo: "022602", coords: [41.417017765, 2.213649065] },
  { nombre: "Jardins de Mahatma Gandhi", codigo: "0229", coords: [41.403852099, 2.207562834] },
  { nombre: "Diagonal, Av.(Fluvià- Veneçuela)", codigo: "0230", coords: [41.408157257, 2.204890328] },
  { nombre: "Diagonal, Av.(Fluvià- Veneçuela)", codigo: "023002", coords: [41.408138888, 2.204972222] },
  { nombre: "Ramon Calsina, Pl.", codigo: "0232", coords: [41.405737151, 2.211858903] },
  { nombre: "Pere IV- Bogatell", codigo: "0233", coords: [41.393221586, 2.1905031194] },
  { nombre: "Freser- Indústria- Trinxant", codigo: "0237", coords: [41.416327, 2.182983] },
  { nombre: "Diagonal Mar, Parc de", codigo: "0238", coords: [41.407050419, 2.216867977] },
  { nombre: "Diagonal Mar, Parc de", codigo: "023802", coords: [41.406830052, 2.217576506] },
  { nombre: "Diagonal Mar, Parc de", codigo: "023803", coords: [41.406863557, 2.217205217] },
  { nombre: "Diagonal Mar, Parc de", codigo: "023804", coords: [41.406880024, 2.216977701] },
  { nombre: "Diagonal Mar, Parc de", codigo: "023805", coords: [41.407300307, 2.21388589] },
  { nombre: "Josep Maria Sostres, Jardins de", codigo: "0242", coords: [41.404623831, 2.213702804] },
  { nombre: "Joan Fuster i Ortells, Jardins de", codigo: "0243", coords: [41.401879785, 2.210230665] },
  { nombre: "Prim-Veneçuela", codigo: "0244", coords: [41.415073128, 2.213792177] },
  { nombre: "Carles Barral, Jardins de", codigo: "0245", coords: [41.402926062, 2.211749311] },
  { nombre: "Bilbao-(Ramón Turró- Llull)", codigo: "0248", coords: [41.401980869, 2.20528863] },
  { nombre: "Menorca- Prim, Rbla.- Guipúzcoa, Rbla.- Maresme", codigo: "0249", coords: [41.421903316, 2.203681552] },
  { nombre: "Garcia Faria, Parc Lineal de", codigo: "0250", coords: [41.399388888, 2.209] },
  { nombre: "Garcia Faria, Parc Lineal de (Bilbao-Josep Pla)", codigo: "025002", coords: [41.405762, 2.21703] },
  { nombre: "Garcia Faria, Parc Lineal de", codigo: "025003", coords: [41.403656331, 2.214480134] },
  { nombre: "Garcia Faria, Parc Lineal de", codigo: "025004", coords: [41.403919405, 2.214752128] },
  { nombre: "Manuel Sacristan, Jardins de", codigo: "0251", coords: [41.403645376, 2.212877153] },
  { nombre: "Jaime Gil de Biedma, Jardins de", codigo: "0252", coords: [41.400945024, 2.209213161] },
  { nombre: "Irene Polo, Jardin d'", codigo: "0255", coords: [41.406043813, 2.193717824] },
  { nombre: "Ada Bayron, Jardins de", codigo: "0256", coords: [41.40487365, 2.195120085] },
  { nombre: "Maresme- Prim, Rbla.", codigo: "0257", coords: [41.413349523, 2.215966717] },
  { nombre: "Gran Via, Parc Lineal(Selva de Mar- Sant Ramon de Penyafort)", codigo: "0259", coords: [41.421263206, 2.211443834] },
  { nombre: "Gran Via, Parc Lineal(Selva de Mar- Sant Ramon de Penyafort)", codigo: "025902", coords: [41.414935826, 2.203000861] },
  { nombre: "Gran Via, Parc Lineal(Selva de Mar- Sant Ramon de Penyafort)", codigo: "025903", coords: [41.417999777, 2.207115661] },
  { nombre: "Camp de la Bota, Parc del", codigo: "0260", coords: [41.409039058, 2.22188116] },
  { nombre: "Margarida Comas, Jardins", codigo: "0265", coords: [41.392447334, 2.191840448] },
  { nombre: "Carmen Monturiol, Jardins de(Ripollés- Nació- Degà Bahí)", codigo: "0266", coords: [41.413107163, 2.184979603] },
  { nombre: "Bilbao- Castella- Marroc- Bolívia(interior)", codigo: "0267", coords: [41.406860413, 2.197141429] },
  { nombre: "Gran Via, Parc Lineal(Bilbao- Selva de Mar)", codigo: "0269", coords: [41.409425887, 2.19561427] },
  { nombre: "Gran Via, Parc Lineal(Bilbao- Selva de Mar)", codigo: "026902", coords: [41.412390608, 2.199669771] },
  { nombre: "Gran Via, Parc Lineal(Bilbao- Selva de Mar)", codigo: "026903", coords: [41.409361111, 2.195444444] },
  { nombre: "Avinguda Meridiana- Degà Bahí. Trinxant", codigo: "0276", coords: [41.413861, 2.18617] },
  { nombre: "Gran Via, Parc Lineal(Bac de Roda- Extremadura)", codigo: "0277", coords: [41.421509486, 2.210579244] },
  { nombre: "Gran Via, Parc Lineal(Bac de Roda- Extremadura)", codigo: "027702", coords: [41.421472222, 2.210472222] },
  { nombre: "Gran Via, Parc Lineal(Bac de Roda- Extremadura)", codigo: "027703", coords: [41.412472222, 2.19825] },
  { nombre: "Gran Via, Parc Lineal(Bac de Roda- Extremadura)", codigo: "027704", coords: [41.415781711, 2.202882828] },
  { nombre: "Gran Via, Parc Lineal(Bac de Roda- Extremadura)", codigo: "027705", coords: [41.41375, 2.200222222] },
  { nombre: "Carrer dels Pellaires 1", codigo: "0278", coords: [41.403696274, 2.209789946] },
  { nombre: "Jardins teresa de Calcuta", codigo: "0279", coords: [41.405361111, 2.201333333] },
  { nombre: "Centre de Poblenou, Parc del", codigo: "0280", coords: [41.407277777, 2.19975] },
  { nombre: "Jardins Josep Pons", codigo: "0281", coords: [41.413, 2.22] },
  { nombre: "Bac de Roda- Pallars", codigo: "0293", coords: [41.407424242, 2.205700868] },
  { nombre: "Josep Pla-Pallars-Agricultura", codigo: "0294", coords: [41.410751, 2.212069] },
  { nombre: "Alaba Ramon Turro", codigo: "0299", coords: [41.393966, 2.196804] },
  { nombre: "Llull fluvia provincials", codigo: "0302", coords: [41.405842, 2.209673] },
  { nombre: "Passatge Burrull", codigo: "0304", coords: [41.404943, 2.197895] },
  { nombre: "Plaça Juliana Morrell", codigo: "0305", coords: [41.418805555, 2.213583333] },
  { nombre: "Palerm- Pere Moragues Cristobal de Moura", codigo: "0308", coords: [41.418, 2.216] },
  { nombre: "Super Illa Poble Nou", codigo: "0309", coords: [41.401617, 2.195434] },
  { nombre: "Super Illa Poble Nou", codigo: "030902", coords: [41.401525, 2.195244] },
  { nombre: "Almogàvers-Llacuna(antiga 0309 A3 Superilla Poble Nou) 1", codigo: "0312", coords: [41.4021528, 2.197016666] },
  { nombre: "Fòrum de les Cultures, Pl.", codigo: "0315", coords: [41.41, 2.222] },
  { nombre: "Cristobal de Moura- Fluvià(Ca l'Alier)", codigo: "0320", coords: [41.409, 2.204] },
  { nombre: "Jardins Ca l'Aranyó(Bolivia- Ciutat de Granada-Tanger- Roc Boronat)", codigo: "0322", coords: [41.404, 2.192] },
  { nombre: "Entorns de l'Escola la Pau", codigo: "0335", coords: [41.424, 2.209] },
  { nombre: "Parc de la Ciutadella", codigo: "1000", coords: [41.388803367, 2.184756941] },
  { nombre: "Parc de la Ciutadella", codigo: "100002", coords: [41.387694444, 2.186722222] },
  { nombre: "Parc de la Ciutadella", codigo: "100003", coords: [41.386986803, 2.187721908] },
  { nombre: "Parc Zoològic", codigo: "1004", coords: [41.38715905, 2.190434797] },
  { nombre: "Parc Zoològic", codigo: "100402", coords: [41.388925696, 2.188044638] },
  { nombre: "Plaça Josep Maria Folch i Torras", codigo: "1016", coords: [41.376758588, 2.166909694] },
  { nombre: "Pl. George Orwell", codigo: "1020", coords: [41.380572161, 2.177397154] },
  { nombre: "Voltes d'en Cirés, Jardins", codigo: "1024", coords: [41.37715487, 2.173147056] },
  { nombre: "Vila de Madrid, Pl", codigo: "1027", coords: [41.384470869, 2.172157378] },
  { nombre: "Vicenç Martorell, Pl", codigo: "1030", coords: [41.384350679, 2.169228708] },
  { nombre: "Doctor Fleming, Jardí", codigo: "1031", coords: [41.3818, 2.169571] },
  { nombre: "Caramelles, Pl.", codigo: "1041", coords: [41.382269636, 2.167939641] },
  { nombre: "Palau, Pla", codigo: "1045", coords: [41.383163737, 2.183356334] },
  { nombre: "Sant Miquel, Pl.", codigo: "1051", coords: [41.381744145, 2.177537858] },
  { nombre: "Llagut, Pl.", codigo: "1054", coords: [41.381194444, 2.189833333] },
  { nombre: "Poeta Boscà, Pl.", codigo: "1055", coords: [41.379577314, 2.189524266] },
  { nombre: "Plaça Salvador Seguí", codigo: "1071", coords: [41.378802, 2.170939] },
  { nombre: "Sant Pau del Camp, Jardins de", codigo: "1092", coords: [41.376600662, 2.169985058] },
  { nombre: "Pl. Allada Vermell", codigo: "1119", coords: [41.386666666, 2.181499999] },
  { nombre: "Parc de la Barceloneta", codigo: "1122", coords: [41.382722222, 2.192388888] },
  { nombre: "Hilari Salvadó, Plaça", codigo: "1128", coords: [41.379475451, 2.191690126] },
  { nombre: "Joaquim Xirau, Pl", codigo: "1130", coords: [41.378513157, 2.17665773] },
  { nombre: "Rambla del Raval", codigo: "1132", coords: [41.379, 2.169] },
  { nombre: "Jardí del Pou de la Figuera", codigo: "1136", coords: [41.387908876, 2.179302106] },
  { nombre: "Mercaders 25-27", codigo: "1137", coords: [41.38538482, 2.177767064] },
  { nombre: "Pl. Martina Castells Ballespí- Sant Llatzer", codigo: "1141", coords: [41.379812462, 2.166954435] },
  { nombre: "Vuit de Març, Pl.(Duran i Bas)", codigo: "1144", coords: [41.385452541, 2.174644604] },
  { nombre: "Francesc Cambo, AV. 12", codigo: "1147", coords: [41.385995994, 2.17757996] },
  { nombre: "Passeig de Colom", codigo: "1148", coords: [41.378138888, 2.180166666] },
  { nombre: "Parc del Turó de la Peira", codigo: "8000", coords: [41.432115606, 2.165256768] },
  { nombre: "Parc del Turó de la Peira", codigo: "800002", coords: [41.433185359, 2.163723008] },
  { nombre: "Parc del Turó de la Peira", codigo: "800003", coords: [41.432674557, 2.167810939] },
  { nombre: "Parc del Turó de la Peira", codigo: "800004", coords: [41.43354745, 2.163969709] },
  { nombre: "Sant Francesc Xavier, Pl.", codigo: "800101", coords: [41.434443189, 2.164520766] },
  { nombre: "Olof Palme, Pl.", codigo: "8002", coords: [41.433456511, 2.171319834] },
  { nombre: "Josep Maria Jaén, Plta.(Urrutia, Pg.- Pedret)", codigo: "8004", coords: [41.434792051, 2.169160354] },
  { nombre: "Pl. del Carib", codigo: "8008", coords: [41.450301419, 2.177738031] },
  { nombre: "Guineueta, C. V.(Via Favència- Castor- Gasela- Caçador)", codigo: "8010", coords: [41.4414372, 2.167591261] },
  { nombre: "Guineueta C.V.(Gasela, 49)", codigo: "801002", coords: [41.442118135, 2.169581646] },
  { nombre: "Guineueta, C. V.(Via Favència- Castor- Gasela- Caçador)", codigo: "801003", coords: [41.441606503, 2.168582648] },
  { nombre: "Canyelles, C.V.(Guineueta Vella, Rda.- A. Machado- M. Hernandez- Juan R. Jimenez)", codigo: "8011", coords: [41.444029156, 2.164804821] },
  { nombre: "Plaça Garrigó", codigo: "8018", coords: [41.429051505, 2.18133338] },
  { nombre: "Virrei Amat, Pl.", codigo: "8020", coords: [41.429111111, 2.176083333] },
  { nombre: "Felanitx-Alcudia-Valldemossa", codigo: "8022", coords: [41.435636433, 2.173841586] },
  { nombre: "Sóller, Pl.", codigo: "8023", coords: [41.434122387, 2.176242638] },
  { nombre: "Alella - Alloza - Santanyí", codigo: "8025", coords: [41.431603794, 2.175472581] },
  { nombre: "Plaça de la Torre Llobeta", codigo: "8030", coords: [41.426433811, 2.17425745] },
  { nombre: "Trinitat Nova, Jardins", codigo: "8033", coords: [41.449165867, 2.185246767] },
  { nombre: "Nou Barris, Pl.", codigo: "8035", coords: [41.445531174, 2.185854886] },
  { nombre: "Nou Pins, Pl. (Pablo Iglesias- Tissó- Conveni- Nou Pins)", codigo: "8043", coords: [41.443902694, 2.182307911] },
  { nombre: "Guineueta, Parc", codigo: "8045", coords: [41.44073458, 2.172579896] },
  { nombre: "Guineueta, Parc", codigo: "804502", coords: [41.442, 2.171805555] },
  { nombre: "Plaça Angel Pestaña", codigo: "8047", coords: [41.441840553, 2.179855899] },
  { nombre: "Via Julia, 189", codigo: "8053", coords: [41.444862252, 2.179183381] },
  { nombre: "Can Dragó, Parc Esportiu de", codigo: "8056", coords: [41.431662835, 2.181216791] },
  { nombre: "Canyelles, C.V. A. Machado- Federico Garcia Lorca- Miguel Hernandez- Guineueta Vella, Rda.)", codigo: "8057", coords: [41.443665119, 2.168017681] },
  { nombre: "Deià- Escultor Ordoñez- Valldemossa- Alcúdia(interior)", codigo: "8063", coords: [41.434715795, 2.174834737] },
  { nombre: "Alvaro Cunqueiro, Pl.", codigo: "8069", coords: [41.428344871, 2.169457983] },
  { nombre: "Guineueta, C. V.(Caçador- Valldaura, Pg.- Gasela- Isard)", codigo: "8070", coords: [41.439744559, 2.168941578] },
  { nombre: "Guineueta, C. V.(Valldaura, Pg.- Via Favència- Guineueta)", codigo: "8079", coords: [41.439930378, 2.164749645] },
  { nombre: "Guineueta, C. V.(Valldaura, Pg.- Via Favència- Guineueta)", codigo: "807902", coords: [41.441016571, 2.166722799] },
  { nombre: "Pla de Fornells, Parc", codigo: "8082", coords: [41.448659, 2.17745] },
  { nombre: "Pla de Fornells, Parc", codigo: "808202", coords: [41.449415, 2.178274] },
  { nombre: "Via Favència (Pl.Karl Marx - Rda. De la Guineueta Vella)", codigo: "8083", coords: [41.441453731, 2.166142625]},
  { nombre: "Guineueta, C.V.(Valldaura, Pg. - Guineueta - Caçador - Gasela)", codigo: "8089", coords: [41.440066288, 2.168590337] },
  { nombre: "Guineueta, C.V.(Valldaura, Pg. - Guineueta - Caçador - Gasela)", codigo: "808902", coords: [41.439883647, 2.167000636] },
  { nombre: "Guineueta, C.V. (caçador-Valldaura-Esquirol Volador- Izard", codigo: "8090", coords: [41.439443536, 2.172165372] },
  { nombre: "Josep Maria Serra Martí, Parc", codigo: "8097", coords: [41.442583458, 2.166666842] },
  { nombre: "Josep Maria Serra Martí, Parc", codigo: "809702", coords: [41.442626475, 2.165146016] },
  { nombre: "Ciutat Meridiana (rassos de peguera Vallcivera)", codigo: "8101", coords: [41.459892, 2.176111] },
  { nombre: "Ciutat Meridiana (Costabona 18 mercat)", codigo: "8104", coords: [41.461310044, 2.177958202] },
  { nombre: "Costabona", codigo: "8106", coords: [41.462774072, 2.178634226] },
  { nombre: "Ciutat Meridiana (Pedraforca nº 8)", codigo: "8107", coords: [41.461258338, 2.175767594] },
  { nombre: "Ciutat Meridiana (Av. Rassos de Peguera-Pedraforca)", codigo: "8108", coords: [41.4605317, 2.173669377] },
  { nombre: "Pl. Pedraforca", codigo: "8109", coords: [41.462707454, 2.175617526] },
  { nombre: "Gabriel Alomar, Pl.", codigo: "8124", coords: [41.437589558, 2.182458977] },
  { nombre: "Roja, Pl.", codigo: "8127", coords: [41.461499922, 2.179320857] },
  { nombre: "Can Ensenya C.V.", codigo: "8145", coords: [41.438546249, 2.166407272] },
  { nombre: "Petrarca- Cartellà", codigo: "8149", coords: [41.429114862, 2.166324472] },
  { nombre: "Ciutat de Mallorca, Pg.", codigo: "8160", coords: [41.433303795, 2.177653357] },
  { nombre: "Pg. Verdum", codigo: "8161", coords: [41.436416666, 2.173527777] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "8163", coords: [41.436472222, 2.16775] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816302", coords: [41.437166666, 2.167361111] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816303", coords: [41.436777777, 2.166055555] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816304", coords: [41.436888888, 2.165416666] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816305", coords: [41.437255367, 2.167261668] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816306", coords: [41.437307674, 2.167021605] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816307", coords: [41.436838797, 2.165710944] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816308", coords: [41.43864888, 2.163174075] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816309", coords: [41.435727701, 2.169004789] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816310", coords: [41.435727701, 2.169004789] },
  { nombre: "Central de Nou Barris, Pl.", codigo: "816311", coords: [41.435727701, 2.169004789] },
  { nombre: "Les Torres- Aiguablava", codigo: "8169", coords: [41.447055555, 2.179944444] },
  { nombre: "Verda de la Prosperitat, Pl.", codigo: "8172", coords: [41.442490273, 2.183821975] },
  { nombre: "Harry Walker, Pl.", codigo: "8174", coords: [41.440031957, 2.181386916] },
  { nombre: "Torrent de Can Piquer- Piferrer", codigo: "8175", coords: [41.43209209, 2.178255118] },
  { nombre: "Ciutat Meridiana", codigo: "8177", coords: [41.45965954, 2.176398503] },
  { nombre: "Lorena- Valldaura, Pg.", codigo: "8185", coords: [41.438220816, 2.173736992] },
  { nombre: "Constància, Jardins de", codigo: "8188", coords: [41.438555555, 2.167361111] },
  { nombre: "Joan Riera- Almagro", codigo: "8189", coords: [41.441825179, 2.173930682] },
  { nombre: "Lorena (Espais interiors)", codigo: "8190", coords: [41.438016822, 2.172925631] },
  { nombre: "Lorena (Espais interiors)", codigo: "819002", coords: [41.438066644, 2.172338477] },
  { nombre: "Lorena (Espais interiors)", codigo: "819003", coords: [41.438107456, 2.171751436] },
  { nombre: "Vallbona, Av.", codigo: "8191", coords: [41.457337156, 2.185467789] },
  { nombre: "Andreu Nin- Valldaura", codigo: "8193", coords: [41.438860769, 2.182622573] },
  { nombre: "Parc Apolo", codigo: "8196", coords: [41.456004092, 2.181665037] },
  { nombre: "Pl. del Primer de Maig", codigo: "8197", coords: [41.46596156, 2.186078354] },
  { nombre: "Garigliano 52(Pl. del Raïm)", codigo: "8201", coords: [41.446202647, 2.173911073] },
  { nombre: "Pl. Aqüeducte", codigo: "8205", coords: [41.460258431, 2.177013569] },
  { nombre: "Canyelles, C.V.(Antonio Machado- Miguel Hernandez- Federico Garcia Lorca)", codigo: "8207", coords: [41.441992499, 2.163430382] },
  { nombre: "Alzinar-Pierola-Torre Vella", codigo: "8209", coords: [41.462965446, 2.184008324] },
  { nombre: "Plaça de les Roquetes", codigo: "8211", coords: [41.448333333, 2.176277777] },
  { nombre: "Pl. Francesc Layret", codigo: "8212", coords: [41.442292, 2.177331] },
  { nombre: "Pg. Peira- Peñalara 1", codigo: "8213", coords: [41.430944444, 2.171333333] },
  { nombre: "Miquel Ferrà- Pl. Paul Claudel", codigo: "8216", coords: [41.430056521, 2.173242107] },
  { nombre: "Borràs- Boada- Enric Casanovas(Barri de Prosperitat)", codigo: "8220", coords: [41.440004609, 2.178813668] },
  { nombre: "Darnius(Barri de Can Peguera)", codigo: "8221", coords: [41.434852417, 2.166298935] },
  { nombre: "Pintor Alsamora- Andreu Nin", codigo: "8223", coords: [41.434390228, 2.180955102] },
  { nombre: "Garrofers-Escultor Ordóñez", codigo: "8225", coords: [41.437849548, 2.178493711] },
  { nombre: "Tinitat Nova, C.V.(Via Favència- Palamós- Pedrosa- S'agaró)", codigo: "8231", coords: [41.447496905, 2.186153544] },
  { nombre: "Favència, Via nº 374(interior)", codigo: "8233", coords: [41.445830196, 2.182295682] },
  { nombre: "Aiguablava(Bosc de Roquetes-Vila-Real)", codigo: "8234", coords: [41.45059249, 2.184462699] },
  { nombre: "Artesania-Rodrigo Caro", codigo: "8236", coords: [41.447805555, 2.171222222] },
  { nombre: "Artesania-Rodrigo Caro", codigo: "823602", coords: [41.448274528, 2.171430589] },
  { nombre: "Amilcar-Grau,Pgte", codigo: "8237", coords: [41.431534868, 2.172146172] },
  { nombre: "Via Favència Llucena Martín", codigo: "8242", coords: [41.443891, 2.173926] },
  { nombre: "Pl. Juan Ramón Jiménez", codigo: "8248", coords: [41.443, 2.163] },
  { nombre: "Pl. Miguel de Unamuno", codigo: "8256", coords: [41.443, 2.169] },
  { nombre: "Pl. Ideal Flor(Pg. Valldaura-Font d'en Canyelles)", codigo: "8260", coords: [41.439083333, 2.178027777] },
  { nombre: "Escultor Ordoñez- Pintor Alsamora- Brossa", codigo: "8261", coords: [41.435583333, 2.176805555] },
  { nombre: "Mas Duran- Favència, Via", codigo: "826301", coords: [41.44498, 2.176602] },
  { nombre: "Aiguablava- La Fosca- Chafarinas- Empuries- Fenals", codigo: "8265", coords: [41.447760149, 2.181361606] },
  { nombre: "Campillo de la Virgen, Jardins", codigo: "8267", coords: [41.458316, 2.176849] },
  { nombre: "Duero 18(Pitágoras-Petrarca)", codigo: "8274", coords: [41.428888888, 2.165055555] },
  { nombre: "Carrer Eucaliptus", codigo: "8281", coords: [41.460238, 2.180736] },
  { nombre: "Pierola- Pujalt(Vallbona)", codigo: "8282", coords: [41.463, 2.183] },
  { nombre: "Plaça de les dones de Nou Barris", codigo: "8286", coords: [41.448, 2.179] },
  { nombre: "Castellví- Lliçà", codigo: "8287", coords: [41.454, 2.172] },
  { nombre: "De les Agudes 9-11(antic 810602)", codigo: "8288", coords: [41.463, 2.178] },
  { nombre: "San Iscle 34-50", codigo: "8311", coords: [41.433, 2.173] },
  { nombre: "Jardins de Jaume Ferran i Clua", codigo: "9000", coords: [41.423624909, 2.1782302413] },
  { nombre: "Ferran Reyes, Pl.", codigo: "9001", coords: [41.417972222, 2.187388888] },
  { nombre: "Meridiana, Av.- Cardenal Tedeschini- Olesa", codigo: "9002", coords: [41.424915556, 2.186196239] },
  { nombre: "Plaça de la Mainada", codigo: "9004", coords: [41.419401, 2.183589] },
  { nombre: "Felip II- Garcilaso- Concepció Arenal", codigo: "9005", coords: [41.423133127, 2.183801141] },
  { nombre: "Hondures, Jardins d'", codigo: "9014", coords: [41.420931473, 2.18835212] },
  { nombre: "Jardins d'Elx", codigo: "9016", coords: [41.423, 2.188] },
  { nombre: "Marià Brossa, Pl.(Servet- Sant Hipólit)", codigo: "9017", coords: [41.43729708, 2.188220072] },
  { nombre: "Palmeres, Pl.", codigo: "9019", coords: [41.432843021, 2.186324641] },
  { nombre: "Pl. Assemblea de Catalunya", codigo: "9020", coords: [41.424938512, 2.188170578] },
  { nombre: "Mossèn Clapés, Pl.", codigo: "9021", coords: [41.44178979, 2.187936642] },
  { nombre: "Montserrat Roca i Baltà, Pl.(Liuva- Virgili)", codigo: "9022", coords: [41.431424995, 2.19345171] },
  { nombre: "Riera Sant Andreu- Rubén Dario(Pomera, Pl.)", codigo: "9024", coords: [41.433997211, 2.189051149] },
  { nombre: "Abad Escarré, Pl.", codigo: "9025", coords: [41.43025, 2.190888888] },
  { nombre: "Plaça del doctor Caurach Mauri", codigo: "9032", coords: [41.427499999, 2.191083333] },
  { nombre: "Cinca(darrera Parròquia Sant Andreu)", codigo: "9033", coords: [41.436686587, 2.192345218] },
  { nombre: "Aigües de Moncada, Jardin de les", codigo: "9045", coords: [41.453897516, 2.18946183] },
  { nombre: "Pare Pérez del Pulgar- Vicenç Montalt", codigo: "9054", coords: [41.453843805, 2.19335364] },
  { nombre: "Ave Meridiana- Carretera Ribas", codigo: "9056", coords: [41.449777777, 2.18925] },
  { nombre: "Sant Adrià(Enric Sanchís-Llinars del Vallès)", codigo: "9057", coords: [41.436222222, 2.2065] },
  { nombre: "Mossèn Joan Cortinas, Pl.", codigo: "9058", coords: [41.433832906, 2.206827258] },
  { nombre: "Sant Adrià- Estadella- Llinars(Davant mercat)", codigo: "9060", coords: [41.435715305, 2.206804341] },
  { nombre: "Miquel Casablancas i Joanico, Pl.", codigo: "9064", coords: [41.439340874, 2.186818045] },
  { nombre: "Fra Juníper Serra, Pl.", codigo: "9066", coords: [41.439358532, 2.203504118] },
  { nombre: "Felix Rodriguez de la Fuente, Pl.", codigo: "9067", coords: [41.435210676, 2.204165265] },
  { nombre: "Pegaso, Parc de la", codigo: "9071", coords: [41.427638888, 2.188527777] },
  { nombre: "Pegaso, Parc de la", codigo: "907102", coords: [41.427826, 2.189194] },
  { nombre: "Pegaso, Parc de la", codigo: "907103", coords: [41.427638888, 2.188527777] },
  { nombre: "Pegaso, Parc de la", codigo: "907104", coords: [41.427702376, 2.187968597] },
  { nombre: "Pegaso, Parc de la", codigo: "907105", coords: [41.427702376, 2.187968597] },
  { nombre: "Gatcpac, Jardins de", codigo: "9073", coords: [41.440429153, 2.190419482] },
  { nombre: "General Moragues, Pl.", codigo: "9074", coords: [41.417898348, 2.191249792] },
  { nombre: "Maragall, Pg.- Trinxant- Juan de Garay", codigo: "9075", coords: [41.417889026, 2.181018862] },
  { nombre: "Jardins Pepa Colomer", codigo: "9088", coords: [41.4190007, 2.190458303] },
  { nombre: "Sant Adrià(Llinars del Vallès- Estadella) interior", codigo: "9094", coords: [41.436083333, 2.207388888] },
  { nombre: "Costa Daurada Sas", codigo: "9095", coords: [41.43852, 2.2038] },
  { nombre: "Jardins de Virginia Woolf(Olesa(Garcilaso-Av. Meridiana)", codigo: "9099", coords: [41.423, 2.186] },
  { nombre: "Lima(Sas- Guayaquil, Pg.)", codigo: "9116", coords: [41.439114377, 2.204668197] },
  { nombre: "Estadella- Arbeca- Sant Adrià- Llinars del Vallès(interior)", codigo: "9119", coords: [41.436258405, 2.2084974] },
  { nombre: "Trinitat, Parc de la", codigo: "9120", coords: [41.449571442, 2.194232632] },
  { nombre: "Baró de Viver, Pl.", codigo: "9123", coords: [41.447763351, 2.199738009] },
  { nombre: "Modernitat, Pl.(Santa Coloma, Pg.- Dalt, Rda.)", codigo: "9125", coords: [41.446551557, 2.192605972] },
  { nombre: "Trinitat, Plaça", codigo: "9126", coords: [41.449871227, 2.190745066] },
  { nombre: "Sot dels Paletes, Pl.", codigo: "9132", coords: [41.43749189, 2.191581141] },
  { nombre: "Primavera, Plaça de la(Santa Coloma, Pg.(Meridiana, Av.- Ribes, Ctra.))", codigo: "9133", coords: [41.445416666, 2.188083333] },
  { nombre: "Josep Andreu i Abelló, Pl.", codigo: "9135", coords: [41.448318717, 2.190285491] },
  { nombre: "C/ Espiga", codigo: "9136", coords: [41.426208789, 2.180579225] },
  { nombre: "Cardenal Cicognani, Pl.", codigo: "9143", coords: [41.42497584, 2.183263465] },
  { nombre: "Doctor Modrego, Pl.", codigo: "9144", coords: [41.425269284, 2.18019611] },
  { nombre: "Barcino, Via(Camp de Futbol)", codigo: "9147", coords: [41.447607686, 2.192928083] },
  { nombre: "Meridiana, Av.- Santa Coloma, Pg.", codigo: "9165", coords: [41.443959122, 2.187730031] },
  { nombre: "Taxi, Pl. del (Maragall, Pg.- Sant Antoni Ma. Claret)", codigo: "9166", coords: [41.41659113, 2.180903543] },
  { nombre: "Plaça Can Fabra", codigo: "9167", coords: [41.434776343, 2.190968498] },
  { nombre: "Can Portabella, Pl.", codigo: "9175", coords: [41.429064457, 2.19465381] },
  { nombre: "Casa Bloc, Jardins de la", codigo: "9178", coords: [41.440975104, 2.189921911] },
  { nombre: "Lanzarote- Guardiola i Feliu", codigo: "9181", coords: [41.43915812, 2.190279668] },
  { nombre: "Can Galta Cremat, Pl.", codigo: "9183", coords: [41.440716479, 2.187734557] },
  { nombre: "Jardins de Massana", codigo: "9187", coords: [41.427039328, 2.179575454] },
  { nombre: "La Maquinista de Sant Andreu, Parc de", codigo: "9192", coords: [41.437232787, 2.195737838] },
  { nombre: "Cinca- Valentí Iglesias", codigo: "9198", coords: [41.441391169, 2.192729793] },
  { nombre: "Clara", codigo: "9201", coords: [41.446583333, 2.199277777] },
  { nombre: "Mossèn Epifani Lorda- Vicenç Montal", codigo: "9202", coords: [41.45355744, 2.193620587] },
  { nombre: "Fernando Pessoa- Estefania Requesens- Cinca- Joan Comorera", codigo: "9206", coords: [41.439590426, 2.192835901] },
  { nombre: "Pl. del Rom Cremat", codigo: "9209", coords: [41.422120475, 2.183263344] },
  { nombre: "Cinca-Valentí Iglesias-Fernando Pessoa-Estefania de Requesens", codigo: "9210", coords: [41.440608262, 2.192835258] },
  { nombre: "Pilar Miro, Pl.", codigo: "9213", coords: [41.447067625, 2.202021144] },
  { nombre: "Tàrrega-Sèquia Madriguera-Vilamajor-Sas", codigo: "9218", coords: [41.437622397, 2.203836559] },
  { nombre: "Pl. Havaneres", codigo: "9219", coords: [41.421314, 2.182822] },
  { nombre: "Hispano Suiza, Pl. de laz", codigo: "9221", coords: [41.422371464, 2.189459083] },
  { nombre: "Onze de Setembre-Virgili", codigo: "9223", coords: [41.42961457, 2.19346215] },
  { nombre: "Vèlia, Jardins de", codigo: "9225", coords: [41.427334, 2.181503] },
  { nombre: "Pardo- Can Ros- Concepción Arenal(Canódrom)", codigo: "9226", coords: [41.427181, 2.183842] },
  { nombre: "Plaça Maragall", codigo: "9230", coords: [41.420383, 2.180619] },
  { nombre: "Plaça del centre civic de Baró de Viver", codigo: "9234", coords: [41.446231, 2.200302] },
  { nombre: "Pare Perez Pulgar- Vicenç Montal", codigo: "9237", coords: [41.453509, 2.192441] },
  { nombre: "Pare Manyanet- Bonaventura Gispert", codigo: "9243", coords: [41.428, 2.195] },
  { nombre: "Pl. Marià Soteras Mauri", codigo: "924401", coords: [41.418, 2.187] },
  { nombre: "Parc D'Antoni Santiburcio", codigo: "925001", coords: [41.443, 2.189] },
  { nombre: "Residència- Eiximenis- Lanzarote", codigo: "925801", coords: [41.441, 2.189] },
];

// Función para cargar los puntos de interés
function cargarPuntosDeInteres(puntosDeInteres) {
    if (!puntosDeInteres || puntosDeInteres.length === 0) {
        console.error("No hay puntos de interés disponibles.");
        return;
    }

    // Ordenar los puntos por código numéricamente
    puntosDeInteres.sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));

    // Almacenar los marcadores en un array
    const markers = [];

    // Genera las opciones del desplegable y agrega marcadores al mapa
    puntosDeInteres.forEach(punto => {
        if (!punto.coords || punto.coords.length !== 2) {
            console.error("Coordenadas inválidas para el punto:", punto.nombre);
            return;
        }

        // Crea un marcador para cada punto con el ícono predeterminado
        const marker = L.marker(punto.coords, { icon: defaultIcon })
            .addTo(map)
            .bindPopup(`<b>${punto.nombre}</b><br>Código: ${punto.codigo}`);
        markers.push(marker); // Guarda el marcador en el array

        // Genera las opciones del desplegable (código antes del nombre)
        const option = document.createElement('option');
        option.value = punto.coords.join(','); // Guarda las coordenadas como "lat,lng"
        option.textContent = `${punto.codigo} - ${punto.nombre}`; // Código antes del nombre
        puntosDesplegable.appendChild(option);

        // Evento para seleccionar el marcador al hacer clic en él
        marker.on('click', () => {
            // Restaurar el ícono predeterminado para el marcador previamente seleccionado
            if (selectedMarker) {
                selectedMarker.setIcon(defaultIcon);
            }

            // Cambiar el ícono del marcador seleccionado a rojo
            marker.setIcon(selectedIcon);
            selectedMarker = marker; // Actualizar el marcador seleccionado
            selectedPointCoords = punto.coords; // Guardar las coordenadas del punto seleccionado
        });
    });

    // Ajusta la vista del mapa para mostrar todos los marcadores
    const bounds = markers.map(marker => marker.getLatLng());
    if (bounds.length > 0) {
        map.fitBounds(bounds); // Ajusta el mapa para incluir todos los marcadores
    }
}

// Evento para centrar el mapa cuando se selecciona un punto del desplegable
puntosDesplegable.addEventListener('change', event => {
    const selectedCoords = event.target.value.split(',').map(Number); // Convierte "lat,lng" a [lat, lng]
    if (selectedCoords.length === 2) {
        map.setView(selectedCoords, 15);
        selectedPointCoords = selectedCoords; // Guardar las coordenadas del punto seleccionado

        // Encontrar el marcador correspondiente al punto seleccionado
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.getLatLng().equals(L.latLng(selectedCoords))) {
                // Restaurar el ícono predeterminado para el marcador previamente seleccionado
                if (selectedMarker) {
                    selectedMarker.setIcon(defaultIcon);
                }

                // Cambiar el ícono del marcador seleccionado a rojo
                layer.setIcon(selectedIcon);
                selectedMarker = layer; // Actualizar el marcador seleccionado
            }
        });
    }
});

// Referencia al botón de "Buscar"
const searchBtn = document.getElementById('search-btn');

// Función reutilizable para buscar un punto de interés
function buscarPuntoDeInteres() {
    const query = searchBox.value.trim().toLowerCase(); // Texto ingresado por el usuario

    // Validar que window.puntosDeInteres esté definido
    if (!window.puntosDeInteres) {
        console.error("La variable puntosDeInteres no está definida.");
        alert("Error: Los datos de los puntos de interés no están disponibles.");
        return;
    }

    // Buscar el punto por nombre o código usando window.puntosDeInteres
    const puntoEncontrado = window.puntosDeInteres.find(punto =>
        punto.nombre.toLowerCase().includes(query) || punto.codigo.toLowerCase() === query
    );

    if (puntoEncontrado) {
        // Centrar el mapa en las coordenadas del punto encontrado
        map.setView(puntoEncontrado.coords, 15);
        selectedPointCoords = puntoEncontrado.coords; // Guardar las coordenadas del punto seleccionado

        // Encontrar el marcador correspondiente al punto seleccionado
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.getLatLng().equals(L.latLng(puntoEncontrado.coords))) {
                // Restaurar el ícono predeterminado para el marcador previamente seleccionado
                if (selectedMarker) {
                    selectedMarker.setIcon(defaultIcon);
                }

                // Cambiar el ícono del marcador seleccionado a rojo
                layer.setIcon(selectedIcon);
                selectedMarker = layer; // Actualizar el marcador seleccionado
            }
        });

        alert(`Punto encontrado: ${puntoEncontrado.nombre} (${puntoEncontrado.codigo})`);
    } else {
        alert("No se encontró ningún punto con ese nombre o código.");
    }

    // Limpiar el campo de búsqueda
    searchBox.value = '';
}

// Evento para buscar cuando se presiona "Enter"
searchBox.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        buscarPuntoDeInteres();
    }
});

// Evento para buscar cuando se hace clic en el botón de "Buscar"
searchBtn.addEventListener('click', () => {
    buscarPuntoDeInteres();
});

// Función para obtener la ubicación actual del usuario
function obtenerUbicacionActual() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("La geolocalización no está disponible en este navegador.");
        } else {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    resolve([latitude, longitude]);
                },
                error => {
                    reject("Error al obtener la ubicación: " + error.message);
                }
            );
        }
    });
}

// Evento para crear una ruta en Google Maps
rutaBtn.addEventListener('click', async () => {
    try {
        // Obtener la ubicación actual del usuario
        if (!currentPosition) {
            currentPosition = await obtenerUbicacionActual();
        }

        // Verificar que haya un punto seleccionado (ya sea por desplegable o buscador)
        if (!selectedPointCoords) {
            alert("Selecciona un punto de interés (desde el desplegable o el buscador).");
            return;
        }

        // Generar la URL de Google Maps
        const origin = currentPosition.join(','); // Ubicación actual (lat,lng)
        const destination = selectedPointCoords.join(','); // Punto de destino (lat,lng)
        const travelMode = 'driving'; // Modo de transporte (puedes cambiarlo a 'walking', 'bicycling', etc.)

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;

        // Abrir la URL en una nueva pestaña
        window.open(googleMapsUrl, '_blank');
    } catch (error) {
        console.error("Error al crear la ruta:", error);
        alert("No se pudo crear la ruta. Verifica tu conexión a Internet y las coordenadas seleccionadas.");
    }
});

// Espera a que el mapa esté listo antes de cargar los puntos
map.whenReady(() => {
    // Asegúrate de que window.puntosDeInteres esté definido antes de usarlo
    if (window.puntosDeInteres) {
        cargarPuntosDeInteres(window.puntosDeInteres);
    } else {
        console.error("La variable puntosDeInteres no está definida.");
    }
});