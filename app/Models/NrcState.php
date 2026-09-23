<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NrcState extends Model
{
    protected $fillable = ['name', 'burmese_name', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function townships()
    {
        return $this->hasMany(NrcTownship::class, 'state_id');
    }

    public function nrcs()
    {
        return $this->hasMany(Nrc::class, 'nrc_state_id');
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
