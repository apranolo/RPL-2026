## ini catatan yang saya ketik:
bagian journal
issb electrinc itu wajib
sinta rank saja, sinta rank di pindah ke dikti accreditation
OAI wajib bukan optional
indexation ditulis indexing saja
defered: scientific field itu bisa multi select karena ada kemungkinan masuk beberapa field untuk jurnal nya
abaout journal di batasii maksimal berapa kata
indexing tambahkan EBSCO ProQuest

sinta tahun berapa berlaku sampai tahun berapa, maka input sinta indexed date dengan rentang tahun

assesment tidak perlu ditampilkan di journal detail ini, dipindah ke pembinaan
kallau sudah approve action delete di matikan

di import jurnal, disesuaikan denga perbaruan jurnal
status assesment diganti dengan status approval, kemudian lppm bisa edit delete journal, kemudian score itu dihapus, dan status dan score itu di pindah di pembinaan saja, tambahkan kolom indekssasi nya
all periods dan participation dihilangkan saja itu akan dipindahkan ke pembinaan.

bidang ilmu nya pada import itu tidak dulu, maka scientific field nya
dipersingkat lagi csv nya, menyesuaikan dengan create journal yang baru
title
publisher
issn
e_issn
url
url_oai

pengelola saat import itu di ganti ke lppm saja,baru nanti lppm menugas kan untuk memindahkan ke siapa editor

dirapihkan sinta card di public di hiden dulu sementara untuk saat ini



## ini merupakan todo action secara garis besar nya:
Transfer funds to Akyas for overtime - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=37.9999
Send demo link to Akyas; then Akyas creates tutorial w/ sample data - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=193.9999
Implement journal form: move Sinta to Accreditation; require OAI; add Indexing (EBSCO/ProQuest); add SK fields; limit About/Scope; add cover - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=629.9999
Implement LPPM: Add journal button; remove score; add Approve/Reject; disable Delete on approved; add owner transfer - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=2629.9999
Implement Dikti approval: Approve/Reject w/ reason; Revert to Pending - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3113.9999
Implement CSV import: map to LPPM; allow empty Scientific Field/Indexing; enforce Sinta 1–6; rename OJS URL to OAI - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3469.9999
Clean homepage: hide Sinta; link Browse to View All Journals; fix layout - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4184.9999
Schedule 07:00 AM check-in w/ Akyas - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4317.9999


## ini merupakan summary dari rapat ini:
Impromptu Zoom Meeting - February 11
VIEW RECORDING: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R
Meeting Purpose

Finalize the journal management system for tomorrow's presentation.

Key Takeaways

  - Urgent Revisions for Presentation: The system requires immediate UI/UX fixes for tomorrow's presentation, focusing on simplifying the journal data entry form and clarifying the LPPM approval workflow.
  - Simplified Accreditation: The Accreditation Grade and Sinta Rank fields will be merged into a single Accreditation dropdown (Sinta 1–6) to eliminate user confusion.
  - LPPM Workflow Defined: The LPPM dashboard will be streamlined to focus on journal approval (Approve/Reject) and the ability to reassign journal managers, a critical function for post-import data distribution.
  - CSV Import Strategy: To prevent errors, the CSV import will only accept generic data. Complex fields (e.g., Scientific Field) will be left blank for editors to complete manually post-import.

Topics

Presentation Preparation

  - Goal: Prepare the system for a presentation to campus and UAD stakeholders tomorrow.
  - Deliverables:
      - A simple presentation/tutorial slide deck.
      - A live demo using a generic affiliation (e.g., "Majelis Dikti Litbang, PP Muhammadiyah") to avoid showing specific university data.
  - Support: Akyas will be on standby during the presentation to handle any errors.

Journal Data Entry Form (Editor View)

  - Problem: The current form is confusing, especially regarding accreditation and indexing.
  - Solution: Simplify the form to improve user experience.
      - Accreditation:
          - Merge Accreditation Grade and Sinta Rank into a single Accreditation dropdown (Sinta 1–6).
          - Add Start Year and End Year fields to define the accreditation period.
          - Add optional fields for the accreditation SK (Surat Keputusan) number and date.
      - Indexing:
          - Rename Indeksasi to Indexing.
          - Add EBSCO and ProQuest to the dropdown list.
      - Required Fields:
          - Make OAI URL mandatory for data harvesting.
          - Make ISSN Online mandatory; ISSN Print remains optional.
      - Content:
          - Add a character limit to the About Journal and Scope fields to ensure a clean display on the public journal page.
      - Scientific Field:
          - Keep as a single-select dropdown for now to avoid a major revision.
          - Future Enhancement: Allow up to 3 selections, possibly using a Scopus-based list.

LPPM Dashboard & Workflow

  - Goal: Provide LPPM with the tools to manage journals and their editors.
  - Journal List Table:
      - Simplify: Remove Score and All Participants columns to focus on core management.
      - Enhance: Add Indexing status as a visible column.
      - Actions: The Action column needs View, Edit, Approve, and Reject buttons.
      - Delete Logic:
          - Approved journals → Delete button is hidden.
          - Rejected/Pending journals → Delete button is visible.
  - User Management:
      - LPPM Registration: LPPM users must register and be approved by a Dikti admin.
      - Journal Reassignment: LPPM must be able to reassign a journal's manager. This is critical for distributing journals imported via CSV to their respective editors.

CSV Import Functionality

  - Problem: Importing CSVs with values not in the database (e.g., Scientific Field) causes errors.
  - Solution: Revise the CSV import strategy.
      - Generic Import: The import will only process generic data (title, publisher, URLs).
      - Post-Import Manual Entry: Editors must manually select values for complex fields like Scientific Field and Sinta Rank after the import.
      - CSV Template: The template must be updated to reflect these changes (e.g., rename OJS URL to OAI).

Public-Facing Homepage

  - Goal: Clean up the homepage for a professional presentation.
  - Revisions:
      - Sinta Rank Display: Hide the current Sinta rank distribution graphic to simplify the UI.
      - "Browse" Button: Link the "Browse" button to the "View All Journals" page.
      - Journal Detail Page: Display the journal's Description and Scope above the article search bar, with a character limit to prevent clutter.

Next Steps

  - Akyas:
      - Implement all required revisions to the journal data entry form, LPPM dashboard, and CSV import logic.
      - Add the "reassign journal manager" feature to the journal edit page.
      - Deploy the updated system.
      - Create the presentation/tutorial slides.
  - Andri & Akyas:
      - Conduct a final system review at 7:00 AM tomorrow (Feb 12) before the 1:00 PM presentation.
Action Items
  - Transfer funds to Akyas for overtime - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=37.9999
  - Send demo link to Akyas; then Akyas creates tutorial w/ sample data - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=193.9999
  - Implement journal form: move Sinta to Accreditation; require OAI; add Indexing (EBSCO/ProQuest); add SK fields; limit About/Scope; add cover - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=629.9999
  - Implement LPPM: Add journal button; remove score; add Approve/Reject; disable Delete on approved; add owner transfer - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=2629.9999
  - Implement Dikti approval: Approve/Reject w/ reason; Revert to Pending - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3113.9999
  - Implement CSV import: map to LPPM; allow empty Scientific Field/Indexing; enforce Sinta 1–6; rename OJS URL to OAI - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3469.9999
  - Clean homepage: hide Sinta; link Browse to View All Journals; fix layout - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4184.9999
  - Schedule 07:00 AM check-in w/ Akyas - WATCH (5 secs): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4317.9999


## berikut ini merupakan transcript rapat :
Impromptu Zoom Meeting - February 11
VIEW RECORDING - 77 mins (No highlights): https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R

---

0:00 - Andri Pranolo
  This meeting is being recorded. ke Madinah, ke Madinah terus nanti ke Mekah untuk Ibadah Umroh, kalau titip doa nanti ditulis aja Mas Akias ya.
  ACTION ITEM: Transfer funds to Akyas for overtime - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=37.9999  Nanti saya nitip uang untuk Mas Akias nanti untuk lembur-lembur apa gitu ya sebelum berangkat InsyaAllah saya transfer.

0:56 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Baikah.

1:03 - Andri Pranolo
  Mas, besok ternyata saya juga nggak tahu, tahu-tahu itu dari kampus saya yang ngisi, kemudian dari UAD juga saya yang diminta untuk hadir ini.  Malah saya baru tahunya itu dari undangan itu kalau besok itu jadi. Saya kira nggak jadi, nggak ada pemberitahuan gitu kan.  Ya, tapi tetap progres kan kemarin kita lakukan. Tapi kan saya nggak terlalu strict. Juga kemarin sih ada masalah gigi gitu yang jadi problem.  Mas AKYAS yang untuk editor belum ya? Belum, saya lihat belum di deploy ya?

1:43 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, ini tinggal di deploy sih, Pak.

1:46 - Andri Pranolo
  Oh, oke, tinggal di deploy. Atau Mas AKYAS mau menampilkan di situ?

1:49 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Oh, boleh.

1:52 - Andri Pranolo
  Yang di lokalnya dulu. Paling nanti besok di... Apa ya istilahnya ya? Dikosongkan. Duh, ada mau ikut sih nih. Ini punya ayah nih, boleh nih.  Bagus. Sudah saya kohos ya, Mas? udah.

2:37 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sebentar, Wanda.
  SCREEN SHARING: Akyas started screen sharing - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=171.616849

2:45 - Andri Pranolo
  Kalau kita menyaksikan data. Ini nanti. Amin. Bagus. musik. kasih.

3:06 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sampil nggak, Pak? Terlihat nggak?
  ACTION ITEM: Send demo link to Akyas; then Akyas creates tutorial w/ sample data - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=193.9999

3:11 - Andri Pranolo
  Ya sudah, Mas. Jadi kan kita, ini ya sambil, mau mulai. Kita nanti ini yang jelas dipakai. Mas, akhirnya saya kasih linknya ya.

3:27 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, Pak.

3:27 - Andri Pranolo
  Kemudian nanti saya coba jelaskan. Maksudnya standby kalau ada error atau apa gitu ya. Nanti langsung di handling. Atau kampusnya nggak ada misalkan gitu ya.  Nanti ikut. Kemudian kita perlu membuat semacam guideline sederhana lah. Pakai slide juga nggak apa-apa, karena ini kan nggak terlalu komplek ya.  Karena kita yang fungsi yang... dikerja. ... menikmati yang akan kita pakai itu adalah dari sisi manajemen user, dari mulai registrasi approval user umum, kemudian user LPPM, approval, oleh Dikti, kemudian create new journal, approval, oleh LPPM, atau LPPM langsung create journal, itu ada beberapa hal, tapi sebenarnya nanti kayaknya LPPM juga mereka nggak akan nge-entry besok selesai, tapi lebih kepada nanti akan sosialisasi ke para pengelola jurnal di lingkungannya ya, atau kalau jurnalnya nggak banyak mungkin mereka langsung bisa entry di internetnya masing-masing disini, jadi yang harus kita siapkan untuk besok siang itu slide presentasi, kemudian yang kedua adalah tutorial, atau slide presentasi itu sekalian berisi tutorial mas  Mas Akhias ya, karena ini belum final, sehingga saya tidak bisa membuat, tapi Mas Akhias bisa besok, masih ada waktu kan kita, cuman saya besok pengajian, tapi nanti kita kontak-kontak aja.  Nanti contoh di tutorialnya bisa pakai nama saya, terus LPPM UAD gitu, bisa nanti dipakai BPI UAD gitu ya. Nanti kalau perlu datanya nanti saya informasikan ke apa, atau yang user sekarang.  Sekarang aja ya, untuk simulasi awal, afiliatnya ke, buat satu contoh aja mungkin Mas Akhias, Majelis Dikti, apa? Majelis Dikti Litbang, PP Muhammadiyah, mungkin tambahin afiliasi satu gitu.  Untuk tutorial ya, nanti usernya bisa yang user yang tiga kemarin, yang kita pakai ketika membuat tutorial. Jadi, Majelis Dikti Litbang, PP Muhammadiyah.  Muhammadiyah nanti, gitu aja ya, paling ya untuk tutorial ya, kita tidak menggunakan nama kampus tertentu, ya silahkan Mas Kies, Kak, ya jadi yang Dikti kemarin, kemudian nanti afiliasinya dipakai ya Dikti aja, gak apa-apa gitu ya, Majelis Diklip Bank, gitu aja.
  SCREEN SHARING: Akyas started screen sharing - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=381.939483  Ya, yang editor ya Mas? Iya. Atau dari mulai registrasi dulu Mas? Kita coba. Ya, ini editor dulu ya? Oke, dulu sih gak apa-apa.  Editor dulu.

6:45 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Editor itu kan yang kemarin Bapak, itu untuk pengelola jurnalnya apa ya?

6:50 - Andri Pranolo
  Betul, pengelola jurnal, ya.

6:52 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Jadi untuk di bagian jurnalnya itu, ya menampingkan list...

8:00 - Andri Pranolo
  Diisi. Yang print itu boleh kosong.

8:10 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Terus ada kolom nampilkan cinta dan ini yang profile statusnya. Ini boleh kosong.

8:22 - Andri Pranolo
  Ini masih channel editor ya. Pak, ini di...

8:31 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Ya, jurnal editor. Ada filter juga.

8:34 - Andri Pranolo
  Oke, ya. Nah, untuk scientific field itu kita bebas mereka atau kita tentukan, Pak? Terus tambah jurnal dulu mungkin ya, Tambah jurnal dulu, oke.  Ya Allah, hausin enak. publisher dari mana? Oh nggak accreditation grade itu? Sinta 1, Sinta 2, Sinta 3, Sinta 4, Sinta 5, Sinta 6.
  ACTION ITEM: Implement journal form: move Sinta to Accreditation; require OAI; add Indexing (EBSCO/ProQuest); add SK fields; limit About/Scope; add cover - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=629.9999

10:31 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Masih sama ini? Beda atau gimana?

10:35 - Andri Pranolo
  Oh iya, itu sebenarnya salah satu aja mas. Jadi yang Sinta ranknya itu di accreditation aja. Jadi akreditasi sama Sinta itu sama mas.  Atau Sinta rank aja, teraktirasi. Coba turun dulu mas. Saat. Asli. kasih. Mas, sebentar Oke, indeksasi Oh, ada disitu ya, indeksasi ya Indeksasinya masih bentuk Oke Karena indeksasinya kan banyak ya Pak Ah, betul sih Iya, nggak apa-apa Jadi seleksi aja Iya, bisa kita tuliskan Di situ, yang penting sih ada Skopus, Doach, Kavernikus, Google Scholar, Garuda, Ristek, Dikti, Dimension Ya itu penting sih, base Itu udah yang lumayan sih Udah yang penting-penting Kalau tambahin lagi Atau yang atas dulu Mas, kembali ke Akritasi tadi Biar nggak bingungin orang Terus naik lagi Nah Gimana?  Berarti Nah Gimana? Sinta Rank Ini Dipindah Di Akreditasi, Mas Dik, Di Akreditasi Ini Iya Jadi Sinta 1, Sinta 2, Sinta 3, Sinta 9 Akreditasi yang gak perlu Baik Ya Itu aja sih Yang atas gak perlu Terus dipindah ke bawah Twitter Injib Jurnal Email OAI OAI OAI OAI itu sebenarnya wajib aja Mas Nanti Ya Itu OAI-nya wajib Mh-mmh-mmh  Terus, Terincip ya, Terus turun lagi, Buat Journal, Scoop, Index, Indexation itu ditulis Indexing aja mas. Bapak, karena kita waktu terbatas, nanti kalau kurang kita versi update, kemudian mereka suruh nambahin lagi isi data, ulang.  Itu paling nggak yang agak ini agak sedikit confused ya, terkait dengan Sinta Reng sama akreditasi itu, ISSN print online, ISSN nggak wajib ya?  Ya, diwajibkan yang online aja. Yang diwajib online aja. Yang print nggak apa-apa opsional. Scientific field itu milih ya, Mas?

14:22 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Ya, milih nanti. Ini kan masih ada perbaikan lagi untuk bagian scientific field kan, bagian di data master itu kan untuk mengelola bidang-bidang.

14:33 - Andri Pranolo
  Nah itu nanti akan berpengaruh ke ini. Oke.

14:36 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Kan masih sekedar sebagai contoh saja sih.

14:38 - Andri Pranolo
  Oke, oke. Berarti nanti kita bikin default aja, Mas, scientific field-nya tuh. Karena nanti kan untuk filtering maksudnya biar tidak ini, tidak membingungkan gitu maksudnya scientific field-nya tuh.  Kita bikin apa ya, atau by subject juga bikin. Itu bisa milih subjeknya, bisa dibuat lebih dari satu enggak, Mas?  Cepet enggak? Subjeknya itu.

16:18 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, Pak. Belum bisa lebih dari satu sih, Pak.

16:20 - Andri Pranolo
  Mas, baru ini satu, ya.

16:22 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Belum multi-multi-multi option.

16:25 - Andri Pranolo
  Oke. Biar ini ya, dia milih yang ter... Ini, ini saya udah dapat. Terima kasih. Terima kasih. Kalau misalkan memungkinkan dia milik tiga field gitu Mas, 1 apa, field 2 apa.

17:12 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Bisa sih Pak, nanti diubah lagi berarti.

17:28 - Andri Pranolo
  Saya mengambil dari Skopo saja. Buatkan objek banyak ya ternyata. Oke, sambil saya buat ya. Subject Bill 1, 2, 3 gitu aja.  Maksimal 3. Cuman untuk gampangnya itu, ini saya buat. Jadi, milihnya itu, nanti agak kompleks sih sebenarnya. Gimana ya? Baru proses ya, Subject Atau Subject gini dulu mas, karena nanti Major Revision ya akhirnya nanti Cuma nanti Ini kan dia mungkin gak akan langsung ngisi ya di sana ya Ke user dulu nyoba gitu kan Nanti yang sisi feelnya bisa kita kosongin lagi Gak masalah sih kayaknya Untuk milih gitu ya Ketika editornya nanti ngisi Ulang itu dia akan Berubah gitu loh Database-nya gitu mas Nanti di nul-nulkan aja dulu Sambil jalan Oke intinya itu mas Nanti kita lengkapi Sementara pakai besarnya gak apa-apa Karena kalau Jadi feel ini nanti dikunci Jadi besok nanti kalau dia edit Itu wajib mengisi 3 feelnya minimal Gitu So, hey  Publish pertama, ya. Publisher. Oke. Saya menghindari untuk major revision ini, Mas. Nanti kita perbaiki lagi. Accred status. Tadi sudah dipindah, ya.  Nanti yang Sintaring itu aja. Kontaknya oke, OAI oke. penting untuk ambil data, penambar, obat jurnal. Terus. Obat jurnal itu mungkin dibatasi maksimum seribu kata.  Misalkan itu berapa, Mas. Kaitan dengan ini sih, dengan bio. Kita aja tampilan. Nanti maksimal berapa kata bagusnya. Tapi kalau memang bisa lebih banyak lagi, ya nggak apa-apa.  Nggak masalah. Terus, scoop dan pop. Fokus Jurnal, oke, Indeksasi, Indeksing nanti gantinya ya?

22:04 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

22:06 - Andri Pranolo
  Oke ini, Indeksing ini tambahin, saya chat ya mas ya?

22:14 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

22:14 - Andri Pranolo
  Pilihannya itu EBSCO, kemudian ProQuest, ProQuest, PDF? PLees, Indeks, ProQuest itu Slip-OPo крутyes, wbfgsm itu ada yang kedua mas? selamat

23:01 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Gimana, Mak?

23:03 - Andri Pranolo
  Ada Web of Science. Nah, Web of Science itu, oh, nggak apa-apa, gitu aja deh, sementara. Tambah dua itu aja, Mas, EBSCO ProQuest.  Ya, sementara itu, untuk indexing. Oke, Mas, cukup itu catatan untuk jurnal baru. Kemudian. Oke, udah. Itu ada View Detail.

23:50 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Ya, ya.

23:52 - Andri Pranolo
  Itu untuk melihat ya. Isiannya. Padahal. Oh kalau itu ya, nunggu approval atau PM ya, approval, approval, ini ngisi Sinta Ranking since kapan nya itu di mana ya, Hadi?  Sinta Ranking, sini ada Sinta Ranking, since kapan nya itu?

24:26 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sinta Ranking, bawah ada, nah, Sinta Ranking.

24:35 - Andri Pranolo
  Yang Index Session itu nggak apa-apa, gitu dulu nggak apa-apa Mas Nanti. Itu milihnya di kapan ya?

24:43 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sinta Ranking, sebentar saya cek. Nah itu gimana ya?

24:52 - Andri Pranolo
  Sinta Ranking. Ranking. Sinta sinta Ranking. Terima kasih. Ini ada nomor, ada expired date, ini bagus ini sebenarnya. Statusnya itu, status Sinta rankingnya itu, berarti statusnya ini belum terkrasi dikti, kalau Sinta otomatis accredited aja mas, terakreditasi.  Kalau ada Sintanya. Ini Sintanya ini ada Sintasin itu, isiannya dimana ya, tadi kok nggak nemu, sama nomor akreditasi dikti-akreditasi itu dimana ininya, isiannya.  Nomor akreditasi sama expired date isu data itu, itu bagus sebenarnya, kalau mereka mengentrikan itu sama, sama expired date isu volume berapa, tahun berapa mas.  Jadi kalau akreditasi itu, bener ada nomornya, tapi ini bukan isu data. Jadi lebih kepada volume nomor sama tahun mulai, atau tidak apa-apa, isu date-nya boleh, tapi expire date-nya itu adalah volume berapa, nomor berapa, tahun berapa, expire-nya itu.  Lebih ke volume berapa, nomor sama tahun. Oke Mas, dicatat sama itu, since-nya itu kan jadi mirip dengan yang bawah.  Terima kasih. Kalau enggak ada, ya dihapus aja sih, SINCE-nya itu sama SINTA-nya ini diturunkan jadi DICTI Accreditation-nya itu Atau kalau enggak DICTI Accreditation-nya dihilangkan dulu enggak apa-apa kalau memang enggak ada di entry-nya Di entry-nya kan tadi kayaknya enggak ada ya, data itu ya Iya tadi, tadi itu Di ad new journal-nya itu, dimana itu datanya, expedrate itu Kan Accreditation itu, nah ini kan aja itu aja Itu SINTA-RANK Jangan-jangan yang kadang itu first published itu jadi berbeda nih, first published year Tapi tadi tanggal kok Nah yang accreditation itu, yang opsional itu kan datanya enggak ada Yang  Tadi itu, Expire-nya kapan, tapi bagus sih kalau ada volume berapa, sampai volume berapa itu menarik. Ya mas, nggak ada ya?  Jadi kalau Itu kalau akreditasi itu, ini saya screenshotkan ya, kalau di akreditasi itu istilahnya itu dia, memang ada nomornya.  nomor, ada tanggal, SKA. Baiklah. Baiklah. Baiklah. Oh yeah, that's Yeah, D. Terima kasih. Mas, di WA, jadi pengumumannya itu, peringkat 1 itu sinta 1 ya, di WA, mulai volume nomor tahun 2024 sampai volume 53 nomor 1 tahun, nah ini contohnya, jadi nanti yang dicatatnya itu mungkin tahunnya aja ya, karena volume 48 nomor 2 itu nggak tahu kapan,  Sama kurang 5361 itu bulan apa itu nggak tahu ya kita nggak perlu langsung aja tahunnya nanti sebagai ininya informasinya jadi aksinta tiganya itu dari tahun berapa sampai tahun berapa gitu mas lebih ke situ aja nanti kalau akreditasi ya jadi buka kalau isu date nya itu berarti isu date SK kan sebenarnya kalau dikti akreditasi tapi masa berlakunya itu hitungannya polume nomor sama tahun itu juga sama polume nomor sama tahun ya polume nomor sama tahun kalau memang mau diinginkan di ditulis atau tahunnya  tahunnya aja juga bisa tahun 2025 sampai 2029 jadi ditulis tahunnya aja gitu bisa juga gitu Mas tahunnya aja gitu kalau Mas Akias ya disinta gitu ya data jurnal bukan juga dia pakenya tahun sih ya Pak baik Pak ya tadi kalau nggak salah itu setelah milih Sinta oh ini Pak Sinsnya itu muncul setelah memilih Sintanya ya karena kan ini tidak di ya ya Terima

33:00 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Baru nanti muncul input untuk dates-nya berapa, Sinta. Dates-nya tanggal berapa. Dates.

33:09 - Andri Pranolo
  Sintanya tanggal berapa. Kalau tadi nomor SK itu dimana yang isinya? Oh ini Sinta 2, date berapa gitu ya? Oh iya, iya, oke, paham, paham.  Sinta 2, itu... Nah itu kalau mau Sinta, dia tanggal jurnal terindik Sinta itu nanti susah misinya. Jadi kalau enggak Sinta 2 itu tahun berapa sampai tahun berapa?  Tahun berlaku, tahun berakhir, paling enggak minimal tahun itu. Yang Sinta index date-nya itu diganti aja. Apa namanya, start. Apa istilahnya?

34:05 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Mulainya.

34:07 - Andri Pranolo
  Rentang tahunnya aja, nggak apa-apa. Nanti kalau perlu fill lagi, misalkan kok kurang lengkap kan bisa kita tambahin. Jadi tahun berapa, sampai tahun berapa.  Nanti mereka misalkan perpanjang akreditasi cinta dua lagi, kan bisa ditulis tahun berapa, sampai tahun berapa. Jadi yang currentnya aja.  Kemudian, itu ya mas ya. Terus tadi yang SKX, nah ini yang bawah ini di mana berarti?

34:59 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Satan. Terima kasih.

35:03 - Andri Pranolo
  Ini sama sebenarnya, informasinya cukup sinta aja mas, nanti bisa dihilangkan aja nanti kalau memang enggak ada entry di ini.  Oke, nanti coba cari dulu di mana. Kalau memang ada SK-nya bagus sih, tapi cukup ini, statusnya akreditasi, nomor SK-nya sama tanggal SK.  Itu boleh. Tapi enggak ada Expired Date-nya, tapi karena Expired-nya di tahun yang Sinta itu tadi, yang di atas.

35:39 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Atas ini tadi.

35:41 - Andri Pranolo
  Ah, gitu. Jadi, yang Sinta kan udah masa berlaku tuh tahun berapa sampai tahun berapa. Nah, yang bawah ini lebih kepada SK-nya, SK akreditasi-nya nomor berapa.  Tanggal berapa SK? Kan SK ada aktifitas nomor sama tanggal berapa? Kalau mau disebutkan. Tanggal SK maksudnya Mas di situ.  Kalau nggak Sinta ya nggak usah muncul. Jadi isiannya bisa di drop down yang tadi itu Mas. Ketika milih Sinta 3, tahun berapa sampai tahun berapa, SK-nya nomor berapa gitu.  Itu bisa di situ. Tapi opsional aja lah. Sementara. Eh, atau kita wajibkan aja nggak apa-apa dia biar melihat SK-nya.  Itu Mas Akias, jelas ya yang tadi ya, yang bawah. Akhiritasnya kalau kita ketemu. Kayaknya di entry-an situ nggak ada tadi.  Itu data jurnal. Kayaknya itu aja Mas. Next?

36:58 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Next? Next. Next?

37:00 - Andri Pranolo
  Asesmen sih, untuk menampilkan asesmen pembinaannya, kalau semisal pembinaan itu Berarti ini sebenarnya di dashboard yang sebelumnya kan ada daftar ya, akreditasi atau indeksasi sebenarnya mas Nah itu kan dari situ sebenarnya Nah berarti yang dibuat historis itu adalah historis pembinaan indeksasi dan akreditasi Nah kalau yang di disini berarti historisnya disimpan disitu aja mas Di akreditasi atau indeksasi dibagi dua Nah klik coba Oke

39:01 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Review-nya di sini Pak.

39:03 - Andri Pranolo
  Iya kan, ini kan approve itu. Review-nya di sini. Jurnal, program aktivitasi. Terus ini Start Assessment itu apa? Set Assessment, oke.  Upload dokumen ya kalau diperlukan. Terus turun lagi Mas. Hasil Review, Complete. Ini Feedback dari Assessor nanti ya?

39:41 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

39:42 - Andri Pranolo
  Oke, berarti kan nanti hasil Assessment di bawah sini semua kan? Yang Assessment yang tadi, yang di jurnal itu. Nah, langsung di sini aja.  Registrasi, Proof gitu ya.

39:57 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Tapi ini nanti mungkin nggak akan kita pakai dulu.

40:00 - Andri Pranolo
  yang untuk besok lebih kepada pendatangnya tapi ini ditampilin nggak apa-apa kalau nanti akan ada fungsi ini gitu disini nah yang assessment itu mungkin lebih kepada artikel itu tadi Mas kalau mau ambil dari OAI Mas Akyas sudah mulai mencoba ambil dari API-nya OJSOI itu untuk ambil judul abstrak itu kayak kemarin itu belum ya nggak belum nggak apa-apa kemarin aja udah ada nyobain cuma masih error gitu Pak untuk Harvest dari Pak Harvest nya itu ya masih kurang iya nanti saya coba iya nggak apa-apa nanti paling tidak artikelnya akan ada disitu semua kalau mau nomor  Hai Cuna Provinsi Tuhan ada di-approp di-publish ya edit kalau bagian edit kalau bisa masih ya oke temer-em walaupun udah di-publish masih bisa edit kan Cuman kalau udah di-publish dia nggak bisa delete kan disitu action delete-nya itu nanti dimatiin aja kalau udah udah approve iya ada apa itu Oke mas itu sementara yang untuk jurnal ya kemudian support lain-lain kosong profil tadi udah ya kayaknya udah mas yang jurnal kemudian dari sisi LPPM kan besok itu belum belum ngundang pola jurnal cuman kita memberikan panduan pada LPPM itu bagaimana kalau yang entry itu editornya  Langsung itu Mas, pola jurnalannya mulai dari Register User itu tadi. Sekarang kalau di LPPM-nya gimana Mas? Ini udah ya tadi ya?

43:09 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Mas jelas ya catatannya? Sudah Pak, jelas sudah.

43:12 - Andri Pranolo
  Ini, oke, ini dashboard untuk di Editor. Oh, tadi barusan Editor yang tadi ya?

43:25 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Yang tadi Editor Pak, ini untuk LPPM ini Pak.

43:29 - Andri Pranolo
  Oke, LPPM. Tadi Editor juga ada ini? Ada, oh ada kayak gini juga ya?

43:35 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Tadi Editor ya? Ada, ada dashboardnya juga.
  ACTION ITEM: Implement LPPM: Add journal button; remove score; add Approve/Reject; disable Delete on approved; add owner transfer - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=2629.9999

43:38 - Andri Pranolo
  Ada dashboardnya juga. Kemudian, Bangalola Jurnal. Terima kasih. Oh ya, tadi yang itu sudah saya coba sih, register gitu ya, ke UAD ya, defaultnya ya Iya Pengelola jurnal, kemudian jurnalnya Ini bisa create user dari sini ya Dia juga bisa Belum saya tambahkan untuk yang masukkan Bapak itu Tambahin jurnal disini, satu lagi tombol bantap Nambah jurnal ya, bener Kemarin ada kayaknya ya Iya, belum Belum saya ambil gitu Nggak apa-apa Nanti di Satu-satu mungkin ada yang nggak mau bikin CSP dulu Atau CSP malah error nanti gitu kan Gira-gira gitu Nggak apa-apa nanti Oh ini kan template-nya udah ada disini Pak Tapi kan harus disesuaikan Mas yang ada double itu loh Saya tadi udah buka template-nya Kan ada SintaRank sama AccreditationRank itu kan sebenarnya sama ya Oh iya Atau Atau Atau Atau  Itu kan sama, Akhirsa Expired Date itu tadi ya jadikan tahun itu ya, tahun mulai dan tahun berakhir Itu aja mungkin revisinya disitu, PON, UOJS, URL, sama OAI itu, dimana itu?  Yang harvestingnya nggak ada ya OAI?

45:25 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, belum ditambahin Pak.

45:28 - Andri Pranolo
  Iya, ini kalau mau import gitu kan, datanya banyak. Nah, tadi disesuaikan aja mas dengan yang tadi intinya. Sama, berarti form tambah jurnalnya kan sama dengan form yang tadi editor ya.  Cuman ini di sisi review, di sisi LPPM. Terus kalau ada jurnal baru, itu assessment statement itu maksudnya apa mas?  K... Nah, itu aja, Mas. Status. Sementara status ini itu aja. Status assessment itu bukan assessment status, tapi status jurnal yang tadi itu approve.  Apa istilahnya tadi?

47:18 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Reject. Reject.

47:20 - Andri Pranolo
  Ditolak. Dan dia bisa delete di sini, Mas, kalau LPPM-nya. Bisa edit, bisa delete, Mas. Diterima, ditolak gitu ya, statusnya ya.  Mungkin di kanan aja, edit, delete gitu. Terus score itu dihilangkan aja ya di situ, Mas. Nah, nanti yang kayak assessment status score itu nanti di pembinaan semua.  Kalau status kayak gitu. Oke, Mas. Clear ya. Oke. Jadi setelah serintah. Rang, Sinta Berapa, gitu. Kemudian nanti di sisi kanannya ada Edit, ada Delete, ada Approved ya, mungkin ya, sisi kanannya.  Ya, Status dan Skornya nanti dihapus aja. Jadi di Action itu ada, ya di Action itu ada View, Edit, Edit, Edit, Delete, Approve gitu kan.

48:34 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Approve ya, Approve.

48:35 - Andri Pranolo
  Approve atau Reject gitu ya. Ya, Approve atau Delete gitu aja kan sama. Berarti Delete nggak di Approve kan.

48:45 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

48:46 - Andri Pranolo
  Hmm. Gitu Mas. Mas. Approval status boleh. Sudah di-approve, menunggu approval, ditolak. Ya, berarti kalau ditolak berarti nggak dihapus kan?

49:08 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

49:09 - Andri Pranolo
  Ya, ditolak boleh. Tapi tetap yang ditolak bisa di-delete gitu. Yang udah di-approve mungkin nggak bisa di-delete gitu ya. Kecuali dikti aja.  Misalkan gitu, Mas. Delet-nya hilang gitu. Yang sudah di-approve, delet-nya hilang. Kemudian, Al-Accreditation, Scientific Field, General Management ya. Al-Indexation. Nanti kayak Al-Accreditation itu apa, Akreditasi.  Oke, coba satu-satu kita. Oke ya, non-sinta. Clear. Oke, di sini boleh. Kemudian Scientific Field itu adalah bidang ilmu. Oke.  L-Indexation itu skopus beberapa pesaian. Terima kasih. Terima Berarti, kalau memang memungkinkan, ditambahin kolom indeksasinya, Mas, di sini.

50:06 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Di bagian ini, kolom indeksasinya.

50:09 - Andri Pranolo
  Di sini, setelah sinta, indeksasi, indeksing, skopus, apa itu ditambilin semua, kayak yang view jurnal itu lah, Mas.

50:17 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

50:18 - Andri Pranolo
  Warni-warni itu, di situ bisa. Kemudian, alfriots, itu tidak perlu, dihilangkan dulu aja. Karena nanti itu, di ini, di akreditasi, di indeksasikan, munculnya.

50:35 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

50:36 - Andri Pranolo
  Al-participans, itu juga dihilangkan kayaknya. Coba, Mas, al-participans.

50:43 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, kepeminaan ini yang penting.

50:45 - Andri Pranolo
  kepeminaan. Jadi dua itu. Sama, al-oproof status.

50:51 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, ini juga masih.

50:54 - Andri Pranolo
  sini, ya.

50:56 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Diubah untuk ini aja, Mas.

50:57 - Andri Pranolo
  Ah, betul. approval jurnalnya, yang dioproof mana, yang belum mana, gitu. Bisa ke situ. Itu aja, Nas, Pak. Untuk pembinaan nanti ajalah kita bahas.  Yang penting, besok itu intinya ya, user sama, ini ngisi data jurnalnya, LPPM tuh bisa apa, terus editor bisa apa, gitu.  Seperti itu. Kalau registrasi user, tadi saya sudah mencoba. Oke. Berarti yang LPPM nanti Dikti yang approve ya? Karena besok mungkin kan kita akan minta mereka LPPM yang hadir untuk registrasi sebagai LPPM.  Kemudian nanti mereka di-approve oleh Dikti, kan? Iya, di-approve oleh Dikti, Iya. Usernya.
  ACTION ITEM: Implement Dikti approval: Approve/Reject w/ reason; Revert to Pending - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3113.9999

51:56 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Usernya. Oke So dari Itu nanti di bagian titiknya Admin Campus ini nanti ada pending nih Pak, approval ya Iya Approve atau reject, alasan rejectnya kenapa nanti akan muncul Iya Misalkan harus menggunakan akun institusi misalkan kan kira-kira gitu I I I I I I I I I I  Oke, tidak akan muncul di sini, dan juga itu bisa revert, misalnya tidak jadi di reject, misalnya bisa revert ya, di revert atau akan kembalikan ke pending tadi, oke, kembali lagi, terus bisa di approve, jadi akan lanjut, bertambahkan di sini, statusnya langsung apa?

53:31 - Andri Pranolo
  Oke, setelah itu, yang penting dia bisa ngelola dengan anak buahnya, para pengelola jurnal, ya, intinya itu sih, mas, yang besok kita prioritaskan jadi, ini, mungkin dashboard kalau mau mungkin, dimunculkan sih, kampus mana yang sudah mengisi itu, kan, udah ada ya?

53:57 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  I Ans dificil. Mutta. Sampai Gimana Pak? Kampus saja untuk...

54:02 - Andri Pranolo
  Dashboard itu terdistribusi indeksasi semua kampus WAD, berapa jurnal itu yang sudah mengisi? Itu di sini ya? Oke, oke.

54:11 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

54:14 - Andri Pranolo
  Turunnya.

54:15 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Ini distribusi perangkat Unif, ya berapa jurnal?

54:21 - Andri Pranolo
  Itu sih Mas Akyas kira-kira yang besok kita prioritaskan.

54:32 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Jadi untuk bikin GUAD-nya besok pagi atau gimana Pak?

54:37 - Andri Pranolo
  Kan nunggu revisi dulu Mas Akyas ya?

54:40 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Oh, iya kan.

54:42 - Andri Pranolo
  Untuk GUAD-nya. Nanti masih jam 1 sih acara Mas, jadi kalau misal mau awal gitu ya. Kayaknya tadi kita minor-minor aja kan revisinya ya, kita nggak yang besar gitu ya.  Setelah itu kita coba bikin GUAD-nya. Untuk besok kita kirimkan ke para editor ya, karena kemudian kalau yang halaman depannya gimana mas serinya?

56:09 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Halaman depannya itu?

56:12 - Andri Pranolo
  Yang udah fungsional, halaman utama.

56:16 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Baru untuk ini sih pak?

56:19 - Andri Pranolo
  Ya Tio disitu ya, di searching itu udah fungsional, udah berfungsi ya?

56:24 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, jadi untuk filternya udah sih pak.

56:27 - Andri Pranolo
  Udah semuanya, indeksasi.

56:31 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sintai bentar. Dua, sebentar. Ada.

56:36 - Andri Pranolo
  Yang import nggak error scientific field-nya berbeda mas? Gimana pak? import Excel. Kan import Excel ada saya ngisi scientific field.  Yang nggak ada di database nanti nggak bikin error ya? Nambah berarti jadinya?

56:51 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Atau nanti jadi double scientificnya? Nah itu, itu kemarin saya cek. Masih ini ya?

56:57 - Andri Pranolo
  Belum apa?

56:58 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Atau... Atau nanti. Harus sesuai yang database itu.

57:02 - Andri Pranolo
  Nah itu makanya saya belum ngomong lagi Pak.

57:05 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Mesti error itu. belum.

57:07 - Andri Pranolo
  Oh importnya masih error.

57:10 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya kalau misalnya di luar dari yang scientific yang ada gitu Pak. Sembanya kan di.

57:15 - Andri Pranolo
  Oh berarti nanti kita list aja. Mereka suruh milih. Itu dulu aja. Ngelist selengkapnya. Bidangnya. Kalau mau pakai export. Jadi.  Kita kasih guidance aja mas. Bidang-bidang yang bisa di. Import.

57:35 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Untuk saat ini. Untuk saat ini baru.

57:37 - Andri Pranolo
  Bidang-bidang ini. Semisal. Ya. Misalkan. Ini.
  ACTION ITEM: Implement CSV import: map to LPPM; allow empty Scientific Field/Indexing; enforce Sinta 1–6; rename OJS URL to OAI - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=3469.9999

57:45 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Itu kan yang di bagian. Import. Jurnal itu. Nah ini Pak. Sampai

58:00 - Andri Pranolo
  Bidang ilmu yang valid, karena ya masih terbatas gitu kan, belum ada manajemen untuk bidang ilmunya kan belum ada atau semisal bisa otomatis tertambahkan kalau semisal di luar dari database Atau gini aja bidang ilmunya Mas, Mas Akias Bidang ilmunya mereka tidak perlu isi bisa nggak terus diimportkan ke database kita jadi kosong nanti bidang ilmunya ketika ngedit mereka baru bisa Satu persatu gitu loh editornya yang ngedit Oh berarti setelah diinputkan baru bisa diinput ke bidang ilmunya gitu Iya dipilih bidang ilmunya karena kan ini pilihan ya sama indeksasi itu juga kan milihkan Iya Pak Nah jadi data generic jurnalnya aja dimasukin situ sisanya nanti mereka memilih setelah diimport paling nggak gitu aja sih yang pilihan-pilihan gitu  Sama Sintareng itu, pilihannya 1-6 saja, gak usah ada ngetik Sintanya. Yang Sintareng ikut ini saja, 1-6 atau kosong. Terus yang format Scopus itu OJS URL sama OJS URL sebenarnya OJS OAI aja, OAI gitu OJS URL-nya diganti OAI Coba di template-nya Excel-nya mas, ditampilkan Tepat di Excel-nya.  Ya.

59:55 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  selamat menikmati Terima kasih. Jadi, Pak, bentuknya CSV.

1:00:41 - Andri Pranolo
  Nah, bentuknya kan CSV.

1:00:45 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, judul Publisher.

1:00:50 - Andri Pranolo
  Nah, title Publisher, ISSN, ISSN kan boleh kosong. Scientific file itu Nanti kalau dia ngisi malah error kan, kita minta kosong aja Publication itu apa, stopped ya Publication ini ya Publication year itu mulai terbitnya, kan nanti berubah kan Accreditation expired date itu jadi tahun expired ya, year expired Accreditation year expired Url, access url, email, email, phone, email about scoops Oh sampai ke scoops ya itu ya Terima kasih Terima kasih Terima  URL, URL, URL, URL, URL, OA, Gitu Aja Mas, Gimana Mas, Sementara, Pak, Nanti Di Setting Lagi Agar Bisa, Pak, Paling Kaya Masuk Itu Dulu Aja, Cuman ISSN Gak Wajib Gitu Ya, Kosong Boleh Gitu Karena Nanti E...  E... E... E...

1:03:53 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  E... E... E... E... Terima kasih.

1:04:43 - Andri Pranolo
  Itu, coba kembali lagi ke, nah itu kayaknya aman itu aja mas yang di insert ke database-nya, tapi bisa nggak itu mas?  Kan ada fill-nya banyak gitu kan. Kan dia berdasarkan, Kayak yang gak error tuh email, email itu adalah email jurnal apa email pengelola, email jurnal ya?

1:06:08 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Email yang ini Iya, berarti nanti kalau datanya banyak kan di atas ada pilih pengelola jurnal Iya Berarti harus milih dulu ya, berarti pengelola jurnalnya ke LPPM semua ya?  Hmm, pengelolanya ke, jadi ke ini semua ntar harus misal, kalau input banyak Iya, ke yang terdaftar kan?

1:06:29 - Andri Pranolo
  Iya LPPM bisa terdaftar di sini kan? Di list ini kan?

1:06:36 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Kalau input Oh enggak ya?

1:06:39 - Andri Pranolo
  Ini malah ke editor Oh, nanti ke editor itu semua dia pertama masuk Kemudian nanti Kemudian nanti itu harus dialihkan atau gimana?

1:06:56 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Pengalihannya Ini masih kayak inputnya ke ini Ini sih Pak, apa, ke editor pengelolaannya.

1:07:05 - Andri Pranolo
  Ya maksudnya kan kalau UAD kan ada 64, UAD ada seratusan jurnal. Berarti kan ketika import itu masuk ke satu orang itu semua ya?

1:07:14 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya. Atau di alihkan ke LPPM-nya Pak?

1:07:17 - Andri Pranolo
  Mungkin ke LPPM dulu, nanti dari LPPM di alihkan ke editor satu per satu. Nah, cara ngalihkannya gimana Mas? Misalkan jurnal.  Tadi klik jurnal. Ada listnya. Nah ini cara mengganti pengelolanya gimana?

1:07:45 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sudah ada belum ya? Belum, Pak. Belum ada itu.

1:07:48 - Andri Pranolo
  Nah itu mungkin dibuat ya, secara di edit. Ketika edit itu mengganti ke pengelola yang lain gitu di sini bisa.

1:07:58 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

1:08:03 - Andri Pranolo
  Oke, Mas, itu Mas, ke pengelola ya. Itu berarti harus ada ke pengelola yang lain. Sampun dicatat Mas, tadi Mas Agies ya, yang beberapa catatan tadi.

1:08:21 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, Pak.

1:08:22 - Andri Pranolo
  Sama ini ya, mengganti pengelola ya. Pengelolanya ganti terus diubah di sini. Begitu, data jurnal nanti, mungkin setelah besok kita ubah ya, pelengkapan datanya.  Saya kira itu dulu Mas Agies, nanti biar nggak kemalaman karena kita, kayaknya harus agak maraton, ini jam 1 ya, acara, acaranya jam 1.  Ada pertanyaan buatan Mas Agies?

1:09:02 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Tidak sih Pak, ada sih.

1:09:04 - Andri Pranolo
  Belum ada ya.

1:09:06 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Oke.

1:09:08 - Andri Pranolo
  Kalau tidak ada itu intinya yang hal-hal tadi itu ya, yang harus di-edit, intinya terkait dengan data jurnal, sama berapa menu yang mungkin belum perlu ditampilkan di situ, sama nanti yang terakhir adalah bagaimana mengganti pengelolanya kalau setelah import, sama nambahin tambah data manual gitu ya.  Selain import CSP.

1:09:34 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Oh iya.

1:09:35 - Andri Pranolo
  Gitu. Dua aja Mas AKYAS ya, sebenarnya Insya Allah nggak terlalu banyak lah. Revisinya nanti kita apa adanya dulu. Yang penting ya alaman utamanya nanti bisa muncul.
  ACTION ITEM: Clean homepage: hide Sinta; link Browse to View All Journals; fix layout - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4184.9999  Sama halaman utama Mas, sebut sedikit komentar mungkin biar terlihat lebih. di alaman utama tadi. Nah ini mungkin kesintanya kan.  terlihat Kalau ini dikecil, eh sebentar, ini pantasnya gimana ya?

1:10:09 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Ini kan kayak nempel ke bawah ya? Iya.

1:10:13 - Andri Pranolo
  Itu mungkin agak dirapihkan aja sedikit. Sinta 1, 2, 3, 4, atau non-sinta gitu. Itu bisa di... Terus sama browse, Browse itu browse aja.  Nanti linknya... Link ke yang fitur jurnal itu kan ada view all jurnal, Mas. Kesitu aja. Nah, kan belum fungsi kan?  Nah, diarahkan ke view all jurnal aja nanti browse-nya itu. Nah, diarahkan ke sini.

1:10:52 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, Mbak.

1:10:53 - Andri Pranolo
  Baik, Pak. Sama, ini kayaknya kurang ini ya ada sinta 1, 2, 3, 3, 4, 5, 6, 11, 29, Ini mungkin sementara dihilangkan dulu, enggak apa-apa sih, dihiden dulu aja, dihiden dulu aja sementara mas, nanti kita, kalau yang bagian dalam udah selesai, nanti kita mulai inilah menata kira-kira apa yang ditampilkan di halaman depan, ini hasil untuk browsing itu dulu, browse jurnal ya, by topic, by Sinta, karena di view all jurnal kan bisa, klik coba mas itu, kan bisa milih Sinta berapa kan, sama, ke sini dulu aja, intinya di sini dulu, nanti kita perbaiki pelan-pelan, yang ini, gitu paling mas yang Sintanya, biar, biar, terlihat simple dulu aja, terus jurnal,
  ACTION ITEM: Schedule 07:00 AM check-in w/ Akyas - WATCH: https://fathom.video/share/A7xn1sFUPwYfmYQy-nJyrd11KRSmy-4R?timestamp=4317.9999  Oke, pagi-pagi mungkin agak awal, jam 7-an mungkin Mas, kita coba cek ulang lagi ya, bareng-bareng pagi-pagi Mas Akias. Oke, maturnum Mas Akias, khawatirnya Mas Akias mau mulai mengerjakan.  Dan nanti biar gak terlalu malam kita diskusi, intinya itu yang ini yang Sintanya nanti dihidun dulu aja, sementara, kemudian nanti fokus ke bitur jurnalnya, kemudian view jurnal coba Mas, view jurnal salah satu aja, yang, oh ini udah fungsi ya sebenarnya ya, Sintanya berapa itu udah berfungsi.  Ya. terima kasih Oke. Ini untuk filter bayar itu?

1:13:09 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Oh ya, Sarah. Ini kan kemarin saya menjelikan yang kata Bapak dari Garuda.

1:13:14 - Andri Pranolo
  Oh ya, boleh bagus ini Mas. Cuman ya belum ya, on progress ya.

1:13:21 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

1:13:22 - Andri Pranolo
  Berarti nanti ada input covernya kan di sini?

1:13:28 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya, harusnya ada.

1:13:30 - Andri Pranolo
  Iya, ada input cover dan seterusnya. Kemudian nanti, tadi dekripsinya Mas tetap ditampilkan aja sih.

1:13:40 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Deskripsi yang mana Pak?

1:13:42 - Andri Pranolo
  Oke. Oke. Oke. Oke.

1:15:09 - ADTRAINING
  Terima kasih. Nanti ya, gitu dulu aja nggak apa-apa nanti ya, ini seperti ini, kemudian filter from to article year, jurnal keperawatan kesehatan, search article, berarti decrypsi jurnal nggak dimunculkan di sini ya mas ya?  Yang tadi scoop dan seterusnya itu.

1:16:05 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Bagusnya ditapirkan juga nih sebenarnya Pak.

1:16:07 - ADTRAINING
  Coba nanti view-nya gimana ya?

1:16:12 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Sebelum search artikel ini Pak Lim.

1:16:15 - ADTRAINING
  Oh iya di sini. Oke Mas sih, gak apa-apa. Berarti harus dipatasi, jangan terlalu banyak.

1:16:21 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Iya.

1:16:22 - ADTRAINING
  Dekripsinya misalkan 100 kata gitu. Scoopnya berapa gitu. Atau dekripsinya aja itu termasuk scoop, ringkas aja gitu. Seperti itu. Itu aja dulu Mas Akias ya.  Saya takutnya terbanyakan walaupun gak selesai. Itu dulu. Nanti ini ditambahin itu aja. Iya. Mas Akias nanti sambung pagi ya kita ya.

1:16:48 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Insyaallah. Iya Pak.

1:16:50 - ADTRAINING
  Insyaallah.

1:16:52 - 189 - AKYAS ZAIDAN (webmail.uad.ac.id)
  Waalaikumsalam. Waalaikumsalam. Terima kasih Pak.

1:16:55 - ADTRAINING
  Sampai-sampai Mas Akias matunun gitu. Udah dibantu banyak ini. Assalamualaikum.
