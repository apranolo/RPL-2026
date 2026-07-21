import { describe, expect, it } from 'vitest';
import { formatIndo } from '../date';

describe('formatIndo', () => {
    describe('Format dasar (tanpa opsi)', () => {
        it('memformat Date object ke format Indonesia', () => {
            // 1 Januari 2026
            const date = new Date(2026, 0, 1); // bulan 0-indexed
            expect(formatIndo(date)).toBe('1 Januari 2026');
        });

        it('memformat string tanggal ke format Indonesia', () => {
            expect(formatIndo('2026-05-11')).toBe('11 Mei 2026');
        });

        it('menampilkan nama bulan Indonesia dengan benar', () => {
            const bulanIndo = [
                'Januari',
                'Februari',
                'Maret',
                'April',
                'Mei',
                'Juni',
                'Juli',
                'Agustus',
                'September',
                'Oktober',
                'November',
                'Desember',
            ];

            bulanIndo.forEach((bulan, idx) => {
                const date = new Date(2026, idx, 15);
                expect(formatIndo(date)).toContain(bulan);
            });
        });

        it('tidak menambahkan leading zero pada tanggal', () => {
            const date = new Date(2026, 0, 5); // 5 Januari
            expect(formatIndo(date)).toBe('5 Januari 2026');
        });
    });

    describe('Opsi withDay', () => {
        it('menambahkan nama hari di depan tanggal saat withDay: true', () => {
            // 1 Januari 2026 adalah Kamis
            expect(formatIndo('2026-01-01', { withDay: true })).toBe('Kamis, 1 Januari 2026');
        });

        it('menampilkan nama hari Indonesia dengan benar untuk setiap hari', () => {
            const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            // Mulai dari Minggu, 4 Jan 2026 (getDay() = 0)
            const baseDate = new Date(2026, 0, 4); // Minggu

            hariIndo.forEach((hari, idx) => {
                const date = new Date(baseDate);
                date.setDate(4 + idx);
                expect(formatIndo(date, { withDay: true })).toMatch(new RegExp(`^${hari},`));
            });
        });

        it('tidak menambahkan nama hari saat withDay tidak disetel', () => {
            const result = formatIndo('2026-01-01');
            expect(result).not.toMatch(/^(Minggu|Senin|Selasa|Rabu|Kamis|Jumat|Sabtu),/);
        });
    });

    describe('Opsi withTime', () => {
        it('menambahkan waktu HH:mm saat withTime: true', () => {
            // Gunakan Date UTC agar stabil di semua timezone
            // ISO 8601 dengan timezone eksplisit
            const result = formatIndo('2026-01-01T00:00:00', { withTime: true });
            // Cukup periksa bahwa format waktu ada (HH:mm)
            expect(result).toMatch(/\d{2}:\d{2}$/);
        });

        it('memformat jam dan menit dengan leading zero', () => {
            // Buat date lokal dengan jam 7 pagi, menit 5
            const date = new Date(2026, 0, 1, 7, 5, 0);
            const result = formatIndo(date, { withTime: true });
            expect(result).toContain('07:05');
        });

        it('tidak menambahkan waktu saat withTime tidak disetel', () => {
            const result = formatIndo('2026-01-01');
            expect(result).not.toMatch(/\d{2}:\d{2}/);
        });
    });

    describe('Kombinasi withDay dan withTime', () => {
        it('menampilkan hari, tanggal, dan waktu sekaligus', () => {
            const date = new Date(2026, 0, 1, 12, 30, 0); // Kamis, 1 Januari 2026, 12:30
            const result = formatIndo(date, { withDay: true, withTime: true });
            expect(result).toMatch(/^Kamis, 1 Januari 2026, \d{2}:\d{2}$/);
        });
    });

    describe('Input tidak valid', () => {
        it('mengembalikan "-" untuk string tidak valid', () => {
            expect(formatIndo('bukan-tanggal')).toBe('-');
        });

        it('mengembalikan "-" untuk string kosong', () => {
            expect(formatIndo('')).toBe('-');
        });

        it('mengembalikan "-" untuk string "Invalid Date"', () => {
            expect(formatIndo('2026-13-40')).toBe('-');
        });
    });
});
