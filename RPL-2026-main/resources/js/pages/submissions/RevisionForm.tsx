import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Download,
  ArrowLeft,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Revision {
  id: number;
  revision_notes: string;
  due_date: string;
  version: number;
  status: string;
}

interface Submission {
  id: number;
  title: string;
  status: string;
  journal: {
    name: string;
  };
}

interface Props {
  submission: Submission;
  revision: Revision;
}

export default function RevisionForm({ submission, revision }: Props) {
  const { post, processing, errors, setData, data } = useForm({
    revision_file: null as File | null,
    cover_letter: '',
    response_to_reviewers: '',
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('File harus berformat PDF, DOC, atau DOCX');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file maksimal 20MB');
      return;
    }

    setSelectedFile(file);
    setData('revision_file', file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.revision_file) {
      alert('Silakan pilih file revisi terlebih dahulu');
      return;
    }

    post(route('submissions.revision.upload', submission.id), {
      preserveScroll: true,
      onProgress: (progress) => {
        if (progress.percentage) {
          setUploadProgress(progress.percentage);
        }
      },
    });
  };

  const isOverdue = new Date(revision.due_date) < new Date();

  return (
    <AuthenticatedLayout>
      <div className="container max-w-4xl py-8 mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Revisi Naskah</h1>
            <p className="mt-1 text-sm text-gray-600">
              {submission.journal?.name}
            </p>
          </div>
        </div>

        {/* Info Submission */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Naskah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-500">Judul Naskah</Label>
              <p className="mt-1 font-medium">{submission.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge variant="warning" className="mt-1">
                  {submission.status === 'revision_requested' ? 'Revisi Diperlukan' : submission.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Versi Revisi</Label>
                <p className="mt-1 font-medium">Revisi ke-{revision.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revision Notes Card */}
        <Card className={`mb-6 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2" />
              Catatan Revisi dari Editor
            </CardTitle>
            <CardDescription>
              Harap baca dan pahami setiap catatan revisi sebelum mengupload file revisi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                {revision.revision_notes || 'Tidak ada catatan revisi khusus.'}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                <span className="text-gray-600">
                  Batas waktu pengumpulan: {format(new Date(revision.due_date), 'dd MMMM yyyy', { locale: id })}
                </span>
              </div>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Melewati Batas Waktu
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Upload File Revisi</CardTitle>
              <CardDescription>
                Upload naskah yang sudah direvisi sesuai dengan catatan editor
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* File Drop Zone */}
              <div>
                <Label htmlFor="revision_file" className="mb-2 block">
                  File Naskah Revisi <span className="text-red-500">*</span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${errors.revision_file ? 'border-red-500' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!selectedFile ? (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Seret dan lepas file di sini, atau{' '}
                        <label className="text-blue-600 cursor-pointer hover:underline">
                          browse
                          <Input
                            id="revision_file"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={processing}
                          />
                        </label>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Format: PDF, DOC, DOCX (Maks. 20MB)
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setData('revision_file', null);
                        }}
                        disabled={processing}
                      >
                        Ganti
                      </Button>
                    </div>
                  )}
                </div>
                {errors.revision_file && (
                  <p className="mt-1 text-sm text-red-500">{errors.revision_file}</p>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mengupload file...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <Label htmlFor="cover_letter" className="mb-2 block">
                  Surat Pengantar (Opsional)
                </Label>
                <Textarea
                  id="cover_letter"
                  rows={4}
                  placeholder="Tulis surat pengantar untuk editor..."
                  value={data.cover_letter}
                  onChange={(e) => setData('cover_letter', e.target.value)}
                  disabled={processing}
                  className="resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maksimal 5000 karakter
                </p>
              </div>

              {/* Response to Reviewers */}
              <div>
                <Label htmlFor="response_to_reviewers" className="mb-2 block">
                  Tanggapan untuk Reviewer <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="response_to_reviewers"
                  rows={6}
                  placeholder="Tulis tanggapan point-by-point terhadap setiap komentar reviewer..."
                  value={data.response_to_reviewers}
                  onChange={(e) => setData('response_to_reviewers', e.target.value)}
                  disabled={processing}
                  required
                  className="resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mohon berikan tanggapan untuk setiap catatan reviewer secara berurutan
                </p>
                {errors.response_to_reviewers && (
                  <p className="mt-1 text-sm text-red-500">{errors.response_to_reviewers}</p>
                )}
              </div>

              {/* Checklist */}
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Sebelum submit, pastikan:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Semua catatan revisi telah direspon</li>
                    <li>File revisi sudah sesuai dengan format jurnal</li>
                    <li>Naskah sudah melalui cek plagiarisme</li>
                    <li>Semua co-author sudah menyetujui revisi</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="flex justify-end space-x-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={processing}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={processing || !selectedFile}
                className="min-w-[150px]"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Revisi
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}