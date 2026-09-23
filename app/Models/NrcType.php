<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NrcType extends Model
{
    protected $fillable = [
        'name',
        'burmese_name',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function nrcs()
    {
        return $this->hasMany(Nrc::class, 'nrc_type_id');
    }

    public function scopeFilter($query, array $filters)
    {
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', '%'.$filters['search'].'%');
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['order_by'])) {
            $query->orderBy('id', $filters['order_by']);
        } else {
            $query->orderByDesc('id');
        }
    }
}
