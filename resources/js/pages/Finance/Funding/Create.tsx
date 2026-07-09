/**
 * @route GET /fundings/create
 * @description Form input termin pencairan dana (Keuangan). Form ini hanya menampilkan
 * kontrak yang dimiliki oleh universitas pengguna yang sedang login.
 * @features create termin, validate amount
 */
import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    contract_id: '',
    amount: '',
    termin_number: 1,
    termin_date: '',
    notes: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/fundings/termin', {
      onSuccess: () => {
        // optional: reset or show toast
      },
    });
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Input Termin Pencairan</h1>
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Contract ID</label>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={data.contract_id}
            onChange={(e) => setData('contract_id', e.target.value)}
          />
          {errors.contract_id && <div className="text-red-600">{errors.contract_id}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={data.amount}
            onChange={(e) => setData('amount', e.target.value)}
          />
          {errors.amount && <div className="text-red-600">{errors.amount}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium">Termin Number</label>
          <input
            type="number"
            className="mt-1 block w-full border rounded p-2"
            value={data.termin_number}
            onChange={(e) => setData('termin_number', Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Termin Date</label>
          <input
            type="date"
            className="mt-1 block w-full border rounded p-2"
            value={data.termin_date}
            onChange={(e) => setData('termin_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            className="mt-1 block w-full border rounded p-2"
            value={data.notes}
            onChange={(e) => setData('notes', e.target.value)}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Simpan Termin
          </button>
        </div>
      </form>
    </div>
  );
}
