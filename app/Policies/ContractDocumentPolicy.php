<?php

namespace App\Policies;

use App\Models\ContractDocument;
use App\Models\User;

class ContractDocumentPolicy
{
    public function create(User $user): bool
    {
        return $user->hasRole('Keuangan') || $user->isSuperAdmin();
    }

    public function download(User $user, ContractDocument $document): bool
    {
        return $user->hasRole('Keuangan')
            || $user->isSuperAdmin()
            || $user->id === $document->uploaded_by;
    }
}
