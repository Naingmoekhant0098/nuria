<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicMedicalProduct extends Model
{
    protected $fillable = ['clinic_id', 'medical_product_id', 'quantity', 'sale_price', 'is_active'];

    protected $casts = ['sale_price' => 'decimal:2', 'is_active' => 'boolean'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(MedicalProduct::class, 'medical_product_id');
    }
}
