<table>
    <thead>
        <tr>
            <th style="background-color: #dfdfdf; font-weight: bold; border: 1px solid #000000;">No</th>
            <th style="background-color: #dfdfdf; font-weight: bold; border: 1px solid #000000;">Judul Penelitian</th>
            <th style="background-color: #dfdfdf; font-weight: bold; border: 1px solid #000000;">Nama Peneliti</th>
            <th style="background-color: #dfdfdf; font-weight: bold; border: 1px solid #000000;">Tahun</th>
            <th style="background-color: #dfdfdf; font-weight: bold; border: 1px solid #000000;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($proposals as $index => $proposal)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $proposal->title }}</td>
            <td>{{ $proposal->user->name ?? 'Tidak Ada Nama' }}</td>
            <td>{{ $proposal->year ?? '-' }}</td>
            <td>{{ $proposal->status }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
