// INDRAMAYU CLUB PUSAT - WEB + BOT EMAIL FIX
// Script ID: 11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page)? e.parameter.page.toLowerCase() : 'android';
  try {
    if (page == 'kamus') return HtmlService.createTemplateFromFile('kamus').evaluate().setTitle('Kamus').addMetaTag('viewport','width=device-width, initial-scale=1');
    if (page == 'administrasi') return HtmlService.createTemplateFromFile('administrasi').evaluate().setTitle('Admin').addMetaTag('viewport','width=device-width, initial-scale=1');
    if (page == 'admin_panel') return HtmlService.createTemplateFromFile('admin_panel').evaluate().setTitle('Admin Panel');
    if (page == 'halaman2') return HtmlService.createTemplateFromFile('halaman2').evaluate().setTitle('Halaman2');
    if (page == 'index') return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Indramayu Club');
    return HtmlService.createTemplateFromFile('android').evaluate().setTitle('Indramayu Club').addMetaTag('viewport','width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch(err) {
    return ContentService.createTextOutput('Error doGet: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===== BOT EMAIL =====
function botKirimEmail(tujuan, subjek, pesan) {
  tujuan = tujuan || 'dkohar011@gmail.com';
  subjek = subjek || 'Tes Bot Indramayu Club';
  pesan = pesan || 'Halo! Bot aktif jam ' + new Date().toLocaleString('id-ID');
  GmailApp.sendEmail(tujuan, subjek, pesan);
  Logger.log('Email terkirim ke ' + tujuan);
}

function botAutoReply() {
  var threads = GmailApp.search('is:unread', 0, 10);
  for (var i = 0; i < threads.length; i++) {
    var msgs = threads[i].getMessages();
    var last = msgs[msgs.length - 1];
    if (last.isUnread()) {
      threads[i].reply('Assalamualaikum,\n\nPesan Anda sudah masuk sistem Indramayu Club Makrifat dan akan dibalas Admin Jamhari.\n\nWaktu: ' + new Date().toLocaleString('id-ID') + '\n\n- Bot Auto Reply');
      threads[i].markRead();
    }
  }
}

function botLaporanHarian() {
  var emailAdmin = Session.getActiveUser().getEmail();
  var count = GmailApp.getInboxUnreadCount();
  GmailApp.sendEmail(
    emailAdmin,
    'Laporan Harian Indramayu Club - ' + new Date().toLocaleDateString('id-ID'),
    'Inbox unread: ' + count + ' email\n\nCek dashboard: https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec',
    { htmlBody: '<h2>Indramayu Club - Laporan Harian</h2><p>Unread: <b>' + count + '</b></p><p><a href="https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec">Buka Dashboard</a></p>' }
  );
}

function myHourlyJob() {
  Logger.log('Job OK ' + new Date());
}

// biar include di HTML bisa pakai <?!= include('file')?>
