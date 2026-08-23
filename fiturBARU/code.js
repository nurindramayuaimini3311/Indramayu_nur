/**
 * INDRAMAYU CLUB PUSAT - FULL SERVER
 * Project ID: 11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY
 * Fix Gmail error + Bot Email + Google Search Bot
 */

// Router utama - FIX dari error doGet time trigger
function doGet(e) {
  try {
    // Kalau dipanggil dari trigger jam-jaman, jangan load HTML (ini yang bikin error Auth)
    if (!e ||!e.parameter) {
      return ContentService.createTextOutput("OK - " + new Date()).setMimeType(ContentService.MimeType.TEXT);
    }

    var page = (e.parameter.page || 'android').toString().toLowerCase().trim();

    // Daftar page yang valid
    var pages = {
      'android': 'android',
      'index': 'index',
      'kamus': 'kamus',
      'administrasi': 'administrasi',
      'admin': 'admin_panel',
      'admin_panel': 'admin_panel',
      'halaman2': 'halaman2',
      'google': 'google_bot',
      'google_bot': 'google_bot',
      'search': 'google_bot'
    };

    var fileName = pages[page] || 'android';

    // Coba load file, kalau gagal fallback ke android
    try {
      var template = HtmlService.createTemplateFromFile(fileName);
      return template.evaluate()
       .setTitle('Indramayu Club - ' + fileName)
       .addMetaTag('viewport', 'width=device-width, initial-scale=1')
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err2) {
      // fallback
      return HtmlService.createTemplateFromFile('android').evaluate()
       .setTitle('Indramayu Club')
       .addMetaTag('viewport', 'width=device-width, initial-scale=1')
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

  } catch (err) {
    return ContentService.createTextOutput('Error doGet: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return '<!-- include ' + filename + ' not found -->';
  }
}

// ==================== BOT EMAIL ====================

function botKirimEmail(tujuan, subjek, pesan) {
  tujuan = tujuan || Session.getActiveUser().getEmail() || 'jamHari87@gmail.com';
  subjek = subjek || 'Tes Bot Indramayu Club - ' + new Date().toLocaleString('id-ID');
  pesan = pesan || 'Halo! Ini email otomatis dari sistem Indramayu Club Makrifat.\n\nBot aktif dan berjalan normal.\nWaktu: ' + new Date().toLocaleString('id-ID') + '\n\nLink App: https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec';

  GmailApp.sendEmail(tujuan, subjek, pesan, {
    htmlBody: '<div style="font-family:Arial;padding:20px;background:#f5f5f5"><div style="background:white;padding:20px;border-radius:10px"><h2 style="color:#4285F4">Indramayu Club Bot</h2><p>' + pesan.replace(/\n/g, '<br>') + '</p><hr><a href="https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec" style="background:#4285F4;color:white;padding:10px 20px;text-decoration:none;border-radius:20px;display:inline-block">Buka Aplikasi</a></div></div>'
  });

  return 'Email terkirim ke ' + tujuan;
}

function botAutoReply() {
  try {
    var threads = GmailApp.search('is:unread -from:me', 0, 10);
    var count = 0;
    for (var i = 0; i < threads.length; i++) {
      var msgs = threads[i].getMessages();
      var last = msgs[msgs.length - 1];
      if (last.isUnread() &&!last.isDraft()) {
        var from = last.getFrom();
        // jangan auto reply ke no-reply
        if (from.indexOf('no-reply') === -1 && from.indexOf('noreply') === -1) {
          threads[i].reply(
            'Assalamualaikum Wr Wb,\n\n' +
            'Terima kasih, pesan Anda sudah diterima sistem Indramayu Club Makrifat.\n' +
            'Admin Jamhari akan segera membalas.\n\n' +
            'Pesan asli: "' + last.getPlainBody().substring(0, 200) + '"\n\n' +
            'Waktu: ' + new Date().toLocaleString('id-ID') + '\n\n' +
            '---\nBot Auto Reply - Indramayu Club\n' +
            'https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec'
          );
          count++;
        }
        threads[i].markRead();
      }
    }
    Logger.log('AutoReply: ' + count + ' email dibalas');
    return count;
  } catch (e) {
    Logger.log('Error botAutoReply: ' + e.message);
    return 0;
  }
}

function botLaporanHarian() {
  try {
    var emailAdmin = Session.getActiveUser().getEmail();
    var unread = GmailApp.getInboxUnreadCount();
    var threads = GmailApp.search('newer_than:1d', 0, 5);

    var html = '<h2 style="color:#4285F4">Laporan Harian Indramayu Club</h2>' +
      '<p>Tanggal: <b>' + new Date().toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'}) + '</b></p>' +
      '<p>Unread inbox: <b>' + unread + '</b></p>' +
      '<p>Email 24 jam terakhir: <b>' + threads.length + ' thread</b></p>' +
      '<hr>' +
      '<p><a href="https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec" style="background:#4285F4;color:white;padding:12px 25px;text-decoration:none;border-radius:25px;display:inline-block;margin:5px">Buka Dashboard</a>' +
      '<a href="https://script.google.com/macros/s/11rbjpq2MFmBZR2FiIPI_It5iJAorwvbMfYLiO59esHKulpP2Fjc4AEuY/exec?page=google_bot" style="background:#34A853;color:white;padding:12px 25px;text-decoration:none;border-radius:25px;display:inline-block;margin:5px">Buka Google Bot</a></p>';

    GmailApp.sendEmail(emailAdmin, 'Laporan Harian - Indramayu Club ' + new Date().toLocaleDateString('id-ID'), 'Unread: ' + unread, { htmlBody: html });
    return 'Laporan terkirim ke ' + emailAdmin;
  } catch (e) {
    Logger.log('Error laporan: ' + e.message);
  }
}

// Job per jam - FIX yang bikin error Gmail sebelumnya (sekarang aman, tidak load HTML)
function myHourlyJob() {
  Logger.log('Hourly Job OK: ' + new Date().toLocaleString('id-ID'));
  // contoh: cek email tiap jam
  // botAutoReply();
}

function botLogSearch(keyword) {
  Logger.log('SEARCH LOG: "' + keyword + '" - ' + new Date().toLocaleString('id-ID') + ' - IP: ' + (Session.getActiveUser().getEmail() || 'anonymous'));
  // kalau mau simpan ke Google Sheet:
  // SpreadsheetApp.openById('ID_SHEET').appendRow([new Date(), keyword, Session.getActiveUser().getEmail()]);
}

// Untuk test
function testAll() {
  botKirimEmail();
  botLogSearch('test pencarian google');
}
