<?php

namespace App\Http\Controllers;

use App\Http\Resources\SchemaResource;
use App\Models\Schema;
use Illuminate\Http\JsonResponse;

class SchemaController extends Controller
{
    /**
     * Display the specified Schema.
     *
     * @param  \App\Models\Schema  $schema
     * @return \App\Http\Resources\SchemaResource
     */
    public function show(Schema $schema): SchemaResource
    {
        return new SchemaResource($schema);
    }
}