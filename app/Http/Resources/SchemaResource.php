<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchemaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'description' => $this->description ? (string) $this->description : null,
            'max_funding' => (float) $this->max_funding,
            'is_active' => (bool) $this->is_active,
            'proposals_count' => $this->whenCounted('proposals'),

            // Relasi proposals jika di-load
            'proposals' => $this->whenLoaded('proposals', function () {
                return $this->proposals->map(function ($proposal) {
                    return [
                        'id' => $proposal->id,
                        'title' => $proposal->title,
                        'description' => $proposal->description,
                        'status' => $proposal->status_proposal ?? $proposal->status,
                        'user' => $proposal->relationLoaded('user') && $proposal->user ? [
                            'id' => $proposal->user->id,
                            'name' => $proposal->user->name,
                            'email' => $proposal->user->email,
                            'university' => $proposal->user->relationLoaded('university') && $proposal->user->university ? [
                                'id' => $proposal->user->university->id,
                                'name' => $proposal->user->university->name,
                            ] : null,
                        ] : null,
                        'created_at' => $proposal->created_at,
                        'updated_at' => $proposal->updated_at,
                    ];
                });
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
