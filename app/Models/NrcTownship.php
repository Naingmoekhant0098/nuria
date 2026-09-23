<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NrcTownship extends Model
{
    protected $fillable = ['name', 'burmese_name', 'state_id', 'status'];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function state()
    {
        return $this->belongsTo(NrcState::class, 'state_id');
    }

    public function nrcs()
    {
        return $this->hasMany(Nrc::class, 'nrc_township_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $search = $filters['search'] ?? null;
        $order_by = $filters['order_by'] ?? 'name';
        $order_type = $filters['order_type'] ?? 'asc';

        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        if (isset($filters['state_id'])) {
            $query->where('state_id', $filters['state_id']);
        }

        if ($order_by) {
            $query->orderBy('state_id', 'asc')->orderBy($order_by, $order_type);
        }
    }
}
