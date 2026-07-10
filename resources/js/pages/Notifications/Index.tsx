import React, { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Submission Baru',
    message: "Submission dengan judul 'Tugas Akhir Rekayasa Perangkat Lunak' berhasil dibuat.",
    is_read: false,
    created_at: '10 Juli 2026 10:00'
  },
  {
    id: 2,
    title: 'Submission Diperbarui',
    message: "Status atau data submission 'Laporan PKL' telah diperbarui.",
    is_read: true,
    created_at: '09 Juli 2026 15:30'
  }
];

export default function Index() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, is_read: true } : notif))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Semua Notifikasi</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {notifications.filter(n => !n.is_read).length} Belum Dibaca
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
                notif.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-semibold ${notif.is_read ? 'text-gray-700' : 'text-blue-900'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <span className="text-xs text-gray-400 block mt-2">{notif.created_at}</span>
                </div>
                
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
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
  );
}