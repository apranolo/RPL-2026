'use client';

import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { OutputType, OutputFormData, getEmptyOutputFormData, filterOutputFormData, isValidOutputType } from '@/utils/OutputFormSelector';
import OutputFormFields from '@/components/Output/OutputFormFields';

interface ResearchOutput {
  id: number;
  contract_id: number;
  jenis_luaran: OutputType;
  judul_luaran: string;
  tahun_capaian: number;
  penulis_atau_pencipta: string;
  file_sertifikat_atau_cover: string | null;
  status_verifikasi: string;
  keterangan: string | null;
  tautan_publikasi: string | null;
  outputable: OutputFormData | null;
  contract: { id: number; contract_number: string; title: string } | null;
}

interface Contract {
  id: number;
  contract_number: string;
  title: string;
}

interface Props {
  outputs: ResearchOutput;
  contracts: Contract[];
  kategoriOptions: Record<string, string>;
  statusOptions: Record<string, string>;
}

const ChevronLeftIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function Edit({ outputs, contracts, kategoriOptions, statusOptions }: Props) {
  const [outputType, setOutputType] = useState<OutputType>(outputs.jenis_luaran);
  const [outputableData, setOutputableData] = useState<OutputFormData>({});

  const { data, setData, put, processing, errors, reset } = useForm({
    contract_id: outputs.contract_id,
    jenis_luaran: outputs.jenis_luaran,
    judul_luaran: outputs.judul_luaran,
    tahun_capaian: outputs.tahun_capaian,
    penulis_atau_pencipta: outputs.penulis_atau_pencipta,
    status_verifikasi: outputs.status_verifikasi,
    keterangan: outputs.keterangan || '',
    tautan_publikasi: outputs.tautan_publikasi || '',
    file_sertifikat_atau_cover: null,
    outputable: {},
  });

  useEffect(() => {
    if (outputs.outputable && isValidOutputType(outputType)) {
      const filtered = filterOutputFormData(outputs.outputable, outputType);
      setOutputableData(filtered);
      setData('outputable', filtered);
    }
  }, [outputs.outputable, outputType, setData]);

  const handleOutputTypeChange = (value: string) => {
    if (isValidOutputType(value)) {
      setOutputType(value);
      const emptyData = getEmptyOutputFormData(value);
      setOutputableData(emptyData);
      setData('outputable', emptyData);
      setData('jenis_luaran', value);
    }
  };

  const handleOutputableChange = (field: string, value: string) => {
    const newData = { ...outputableData, [field]: value };
    setOutputableData(newData);
    setData('outputable', newData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('file_sertifikat_atau_cover', file as unknown as null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('user.outputs.update', outputs.id), {
      onSuccess: () => {
        reset();
      },
    });
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <AppLayout>
      <Head title="Edit Luaran Penelitian" />

      <div className="py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <Link
              href={route('user.outputs.index')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeftIcon />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Luaran Penelitian</h1>
              <p className="text-gray-500">Perbarui data luaran penelitian Anda</p>
            </div>
          </div>

          {outputs.file_sertifikat_atau_cover && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>File saat ini:</strong>{' '}
                <a
                  href={route('storage.serve', outputs.file_sertifikat_atau_cover)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Lihat file
                </a>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Umum</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="contract_id" className="block text-sm font-medium text-gray-700">
                    Kontrak Penelitian <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contract_id"
                    value={data.contract_id}
                    onChange={(e) => setData('contract_id', parseInt(e.target.value) || 0)}
                    disabled={processing}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.contract_id ? 'border-red-300' : 'border-gray-300'}
                    `}
                  >
                    <option value="">Pilih Kontrak</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contract_number} - {contract.title}
                      </option>
                    ))}
                  </select>
                  {errors.contract_id && <p className="mt-1 text-sm text-red-600">{errors.contract_id}</p>}
                </div>

                <div>
                  <label htmlFor="jenis_luaran" className="block text-sm font-medium text-gray-700">
                    Jenis Luaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jenis_luaran"
                    value={data.jenis_luaran}
                    onChange={(e) => handleOutputTypeChange(e.target.value)}
                    disabled={processing}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.jenis_luaran ? 'border-red-300' : 'border-gray-300'}
                    `}
                  >
                    <option value="">Pilih Jenis Luaran</option>
                    {Object.entries(kategoriOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.jenis_luaran && <p className="mt-1 text-sm text-red-600">{errors.jenis_luaran}</p>}
                </div>

                <div>
                  <label htmlFor="judul_luaran" className="block text-sm font-medium text-gray-700">
                    Judul Luaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="judul_luaran"
                    value={data.judul_luaran}
                    onChange={(e) => setData('judul_luaran', e.target.value)}
                    disabled={processing}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.judul_luaran ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="Masukkan judul luaran penelitian"
                    maxLength={255}
                  />
                  {errors.judul_luaran && <p className="mt-1 text-sm text-red-600">{errors.judul_luaran}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="tahun_capaian" className="block text-sm font-medium text-gray-700">
                      Tahun Capaian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="tahun_capaian"
                      value={data.tahun_capaian}
                      onChange={(e) => setData('tahun_capaian', e.target.value ? parseInt(e.target.value) : 0)}
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      disabled={processing}
                      className={`
                        mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                        focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                        ${errors.tahun_capaian ? 'border-red-300' : 'border-gray-300'}
                      `}
                    />
                    {errors.tahun_capaian && <p className="mt-1 text-sm text-red-600">{errors.tahun_capaian}</p>}
                  </div>

                  <div>
                    <label htmlFor="penulis_atau_pencipta" className="block text-sm font-medium text-gray-700">
                      Penulis / Pencipta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="penulis_atau_pencipta"
                      value={data.penulis_atau_pencipta}
                      onChange={(e) => setData('penulis_atau_pencipta', e.target.value)}
                      disabled={processing}
                      className={`
                        mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                        focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                        ${errors.penulis_atau_pencipta ? 'border-red-300' : 'border-gray-300'}
                      `}
                      placeholder="Nama penulis/pencipta (pisahkan dengan koma jika lebih dari satu)"
                      maxLength={255}
                    />
                    {errors.penulis_atau_pencipta && <p className="mt-1 text-sm text-red-600">{errors.penulis_atau_pencipta}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="tautan_publikasi" className="block text-sm font-medium text-gray-700">
                    Tautan Publikasi
                  </label>
                  <input
                    type="url"
                    id="tautan_publikasi"
                    value={data.tautan_publikasi}
                    onChange={(e) => setData('tautan_publikasi', e.target.value)}
                    disabled={processing}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.tautan_publikasi ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="https://example.com/publikasi"
                    maxLength={255}
                  />
                  {errors.tautan_publikasi && <p className="mt-1 text-sm text-red-600">{errors.tautan_publikasi}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700">
                File Sertifikat / Cover <span className="text-gray-500">(opsional)</span>
              </label>
              <input
                type="file"
                id="file_sertifikat_atau_cover"
                onChange={handleFileChange}
                disabled={processing}
                accept=".pdf,.jpg,.jpeg,.png"
                className={`
                  mt-1 block w-full text-sm
                  ${errors.file_sertifikat_atau_cover ? 'text-red-600' : 'text-gray-700'}
                `}
              />
              {errors.file_sertifikat_atau_cover && (
                <p className="mt-1 text-sm text-red-600">{errors.file_sertifikat_atau_cover}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Format: PDF, JPG, PNG. Maksimal 10MB.</p>
            </div>

            <OutputFormFields
              type={outputType}
              data={outputableData}
              onChange={handleOutputableChange}
              errors={(errors.outputable as unknown as Record<string, string>) || {}}
              disabled={processing}
            />

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Keterangan</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status_verifikasi" className="block text-sm font-medium text-gray-700">
                    Status Verifikasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status_verifikasi"
                    value={data.status_verifikasi}
                    onChange={(e) => setData('status_verifikasi', e.target.value)}
                    disabled={processing}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.status_verifikasi ? 'border-red-300' : 'border-gray-300'}
                    `}
                  >
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.status_verifikasi && <p className="mt-1 text-sm text-red-600">{errors.status_verifikasi}</p>}
                </div>

                <div>
                  <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700">
                    Keterangan
                  </label>
                  <textarea
                    id="keterangan"
                    value={data.keterangan}
                    onChange={(e) => setData('keterangan', e.target.value)}
                    disabled={processing}
                    rows={3}
                    className={`
                      mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                      focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                      ${errors.keterangan ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="Catatan tambahan..."
                  />
                  {errors.keterangan && <p className="mt-1 text-sm text-red-600">{errors.keterangan}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}