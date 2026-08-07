-- ============================================================================
-- INSERT SAMPLE AGENDA DATA - 2 Days of Regental Activities
-- ============================================================================

-- Get admin UUID first
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get superadmin ID
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@simpati.go.id' LIMIT 1;

    IF admin_id IS NULL THEN
        RAISE NOTICE 'Admin not found. Skipping insert.';
        RETURN;
    END IF;

    -- ========================================================================
    -- DAY 1: 10 AGUSTUS 2026
    -- ========================================================================

    -- 07:00 - Apel Pagi ASN
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Apel Pagi ASN Kabupaten', 'Apel pagi rutin untuk seluruh Aparatur Sipil Negara Kabupaten Pesawaran', '2026-08-10', '07:00', '08:00', 'Halaman Kantor Bupati Pesawaran', 'Apel', 'Drs. H. Ahmad Fauzi', '081234567001', 350, 'Seragam Dinas Harian', 'published', admin_id);

    -- 08:30 - Rapat Koordinasi OPD
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Rapat Koordinasi Seluruh Kepala OPD', 'Pembahasan evaluasi capaian kinerja semester I dan rencana aksi semester II tahun 2026', '2026-08-10', '08:30', '10:30', 'Aula Rumah Dinas Bupati', 'Rapat', 'Sekretaris Daerah', '081234567002', 45, 'Batik', 'published', admin_id);

    -- 11:00 - Coffee Morning
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Coffee Morning dengan Para Stakeholder', 'Sarapan pagi dan diskusi santai dengan pengusaha dan tokoh masyarakat', '2026-08-10', '11:00', '12:00', 'Ruang Tamu Bupati', 'Meeting', 'Staf Ahli Bidang Ekonomi', '081234567003', 15, 'Semi Formal', 'published', admin_id);

    -- 13:00 - Audiensi Investor
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('audiensi', 'Audiensi Investor PT. Energi Nusantara', 'Pembahasan rencana pembangunan PLTSa (Pembangkit Listrik Tenaga Surya) di Kabupaten Pesawaran', '2026-08-10', '13:00', '14:30', 'Ruang Rapat Utama', 'Delegasi', 'Kepala DPMTSP', '081234567004', 8, 'Jas', 'published', admin_id);

    -- 15:00 - Kunjungan Puskesmas
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Kunjungan ke Puskesmas Gedong Tataan', 'Monitoring layanan kesehatan dan penyerapan anggaran bidang kesehatan', '2026-08-10', '15:00', '17:00', 'Puskesmas Gedong Tataan', 'Kunjungan', 'Kepala Dinas Kesehatan', '081234567005', 25, 'Seragam Puskesmas', 'published', admin_id);

    -- 18:00 - Peninjauan Jalan
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Peninjauan Kondisi Jalan Poros Desa', 'Survey langsung kondisi jalan rusak di Desa Kagungan Dalem dan sekitarnya', '2026-08-10', '18:00', '19:30', 'Kecamatan Gedong Tataan', 'Kunjungan', 'Kepala Dinas PU', '081234567006', 10, 'Smart Casual', 'published', admin_id);

    -- ========================================================================
    -- DAY 2: 11 AGUSTUS 2026
    -- ========================================================================

    -- 07:00 - Pembinaan UMKM
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Pembinaan Kelompok UMKM Kopi Pesawaran', 'Pelatihan dan pendampingan pengelolaan usaha kopi untuk meningkatkan ekonomi kreatif', '2026-08-10', '07:00', '09:00', 'Kecamatan Negeri Katon', 'Pelatihan', 'Kepala DISKOPUKM', '081234567007', 50, 'Batik', 'published', admin_id);

    -- 09:30 - Rapat Forkopimda
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Rapat Forkopimda Kabupaten Pesawaran', 'Pembahasan situasi keamanan dan ketertiban serta kesiapan menghadapi elections 2024', '2026-08-10', '09:30', '11:30', 'Ruang Command Center', 'Rapat', 'Sekretaris Daerah', '081234567008', 20, 'Jas', 'published', admin_id);

    -- 13:00 - Penyerahan Bantuan Sosial
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Penyerahan Bantuan Sosial Beras', 'Distribusi bantuan sosial beras untuk keluarga penerima manfaat di 5 kecamatan', '2026-08-10', '13:00', '15:00', 'Aula Kantorcam Negeri Katon', 'Seremoni', 'Kepala Dinas Sosial', '081234567009', 100, 'Seragam', 'published', admin_id);

    -- 15:30 - Audiensi Masyarakat
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('audiensi', 'Audiensi Masyarakat Desa Marga Mulya', 'Penerimaan aspirasi dan keluhan warga terkait pengalihan lahan dan kompensasi', '2026-08-10', '15:30', '17:00', 'Ruang Tamu Bupati', 'Masyarakat', 'Asisten Pemerintahan', '081234567010', 25, 'Semi Formal', 'published', admin_id);

    -- 18:00 - Penandangan MoU
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Penandatanganan MoU dengan Universitas Lampung', 'Kerjasama bidang pendidikan, penelitian, dan pengabdian masyarakat', '2026-08-10', '18:00', '19:30', 'Aula Rumdin Bupati', 'Seremoni', 'Sekretaris Daerah', '081234567011', 40, 'Batik', 'published', admin_id);

    -- 20:00 - Silaturahmi Tokoh Agama
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Silaturahmi dengan Forum Kerukunan Umat Beragama', 'Mempererat hubungan dan mendengarkan aspirasi para tokoh agama di Kabupaten', '2026-08-10', '20:00', '21:30', 'Masjid Agung Pesawaran', 'Silaturahmi', 'Staf Ahli Bidang Kemsosbud', '081234567012', 35, 'Kemeja Putih', 'published', admin_id);

    RAISE NOTICE 'Successfully inserted agenda data for 2026-08-10';

END $$;

-- Day 2
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@simpati.go.id' LIMIT 1;

    IF admin_id IS NULL THEN
        RAISE NOTICE 'Admin not found. Skipping Day 2 insert.';
        RETURN;
    END IF;

    -- ========================================================================
    -- DAY 2: 11 AGUSTUS 2026
    -- ========================================================================

    -- 07:00 - Apel Pagi
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Apel Pagi ASN Kabupaten', 'Apel pagi rutin seminggu penuh', '2026-08-11', '07:00', '08:00', 'Halaman Kantor Bupati', 'Apel', 'Drs. H. Ahmad Fauzi', '081234567001', 340, 'Seragam Dinas', 'published', admin_id);

    -- 08:30 - Musrenbang
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Musyawarah Perencanaan Pembangunan (Musrenbang) RPJMDes', 'Pembahasan prioritas pembangunan desa tahun 2027-2032', '2026-08-11', '08:30', '12:00', 'Aula Kec. Negeri Katon', 'Musyawarah', 'Kepala BAPPEDA', '081234567013', 80, 'Batik', 'published', admin_id);

    -- 13:00 - Kunjungan Sekolah
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Kunjungan ke SMAN 1 Gedong Tataan', 'Sidak dan evaluasi persiapan tahun ajaran baru serta赠fasilitas pendidikan', '2026-08-11', '13:00', '14:30', 'SMAN 1 Gedong Tataan', 'Kunjungan', 'Kepala DISDIK', '081234567014', 30, 'Batik', 'published', admin_id);

    -- 15:00 - Audiensi Provinsi
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('audiensi', 'Penerimaan Tamu dari Pemerintah Provinsi Lampung', 'Kunjungan kerja Gubernur Lampung beserta rombongan', '2026-08-11', '15:00', '16:30', 'Ruang Tamu Utama', 'Dinas', 'Asisten Perekonomian', '081234567015', 15, 'Jas', 'published', admin_id);

    -- 17:00 - Evaluasi Kinerja
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Evaluasi Kinerja Perangkat Daerah', 'Evaluasi capaian Key Performance Indicator semester I OPD tahun 2026', '2026-08-11', '17:00', '19:00', 'Ruang Rapat Utama', 'Rapat', 'Sekretaris Daerah', '081234567002', 25, 'Batik', 'published', admin_id);

    -- 19:30 - Penutupan Kegiatan
    INSERT INTO agenda (jenis, title, description, date, time_start, time_end, location, sub_jenis, pic_name, pic_phone, participants_count, dresscode, status, created_by)
    VALUES ('kegiatan', 'Penutupan Bulan Bhakti Gotong Royong', 'Apresiasi dan ramah tamah dengan masyarakat peserta kegiatan bhakti sosial', '2026-08-11', '19:30', '21:00', 'Aula Kantorcam Way Lima', 'Seremoni', 'Kepala Kesbangpol', '081234567016', 150, 'Seragam', 'published', admin_id);

    RAISE NOTICE 'Successfully inserted agenda data for 2026-08-11';
    RAISE NOTICE 'All sample agenda data inserted successfully!';

END $$;

-- Verify inserted data
SELECT
    COUNT(*) as total_agenda,
    COUNT(DISTINCT date) as total_hari,
    COUNT(CASE WHEN jenis = 'kegiatan' THEN 1 END) as total_kegiatan,
    COUNT(CASE WHEN jenis = 'audiensi' THEN 1 END) as total_audiensi
FROM agenda WHERE deleted_at IS NULL AND status = 'published';
