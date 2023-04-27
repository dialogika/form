$(document).on('click','.send_contact', function(){
    var input_blanter = document.getElementById('name');

    /* Whatsapp Settings */
    var walink = 'https://web.whatsapp.com/send',
        phone = '6285162992597',
        walink2 = '_Segera lampirkan *bukti transfer* setelah chat berikut, apabila *tidak* maka admin *tidak bisa melakukan proses lebih lanjut*_' + '%0A%0A' 
                + 'Berikut data diri saya 👇🏻: ',
        text_yes = 'Terkirim.',
        text_no = 'Isi semua Formulir lalu klik Send.';

    /* Smartphone Support */
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    var walink = 'whatsapp://send';
    }

    if("" != input_blanter.value){

     /* Call Input Form */
    var input_name      = $("#name").val(),
        input_work      = $("#work").val(),
        input_city      = $("#city").val(),
        input_program   = $("#program :selected").text()
        input_note      = $("#note").val();
        input_unique    = $("#ttl-byr").text();
    /* Final Whatsapp URL */
    var blanter_whatsapp = walink + '?phone=' + phone + '&text=' + walink2 + '%0A%0A' +
        '*Nama*         : ' + input_name + '%0A' +
        '*Program*      : ' + input_program + '%0A' +
        '*Kota*         : ' + input_city + '%0A' +
        '*Profesi*      : ' + input_work + '%0A' +
        '*Catatan*      : ' + input_note + '%0A' + '%0A' +
        '*Total*        : ' + input_unique + '%0A' ;
        

    /* Whatsapp Window Open */
    window.open(blanter_whatsapp,'_blank');
    document.getElementById("text-info").innerHTML = '<span class="yes">'+text_yes+'</span>';
    } else {
    document.getElementById("text-info").innerHTML = '<span class="no">'+text_no+'</span>';
    }
});