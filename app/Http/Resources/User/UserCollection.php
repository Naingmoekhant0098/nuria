<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'page' => $this->currentPage(),
            'limit' => $this->perPage(),
            'total' => $this->total(),
            'last_page' => $this->lastPage(),
        ];
    }
}
