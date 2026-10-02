<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicDrug extends Model
{
    protected $fillable = ['clinic_id', 'drug_id', 'is_active', 'sale_price_override'];

    protected $casts = ['is_active' => 'boolean', 'sale_price_override' => 'decimal:2'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
