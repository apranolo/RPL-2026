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
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'proposals' => $this->whenLoaded('proposals', function () {
                return $this->proposals->map(function ($proposal) {
                    return [
                        'id' => $proposal->id,
                        'title' => $proposal->title,
                        'description' => $proposal->description,
                        'user' => $proposal->relationLoaded('user') && $proposal->user ? [
                            'id' => $proposal->user->id,
                            'name' => $proposal->user->name,
                            'email' => $proposal->user->email,
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
