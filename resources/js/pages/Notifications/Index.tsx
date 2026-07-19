import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout'; // Sesuaikan path AppLayout ini jika berbeda di proyekmu

interface Notification {
  id: string; // Diubah ke string untuk mendukung format UUID backend
  id_user: string; // Menambahkan FK id_user sesuai spesifikasi
  title: string;
  message: string;
  read_at: string | null; // Menggunakan datetime string atau null, bukan boolean lagi
  created_at: string;
}

interface Props {
  notifications: Notification[]; // Menerima data dinamis secara langsung melalui Props dari Inertia
}

export default function Index({ notifications }: Props) {
  
  // Mengubah aksi agar mengirimkan request PATCH secara riil ke backend database
  const markAsRead = (id: string) => {
    router.patch(`/notifications/${id}/read`, {}, {
      preserveScroll: true, // Menjaga posisi scroll halaman agar tidak melompat ke atas saat klik tombol
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Semua Notifikasi</h1>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded">
            {notifications.filter(n => n.read_at === null).length} Belum Dibaca
          </span>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Tidak ada notifikasi.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-all ${
                  notif.read_at ? 'bg-gray-50 border-gray-200' : 'bg-primary/5 border-primary/20 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold ${notif.read_at ? 'text-gray-700' : 'text-primary'}`}>
                      {notif.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <span className="text-xs text-gray-400 block mt-2">{notif.created_at}</span>
                  </div>
                  
                  {!notif.read_at && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded transition"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}