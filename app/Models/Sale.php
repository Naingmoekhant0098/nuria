<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = ['clinic_id', 'reservation_id', 'patient_id', 'prescription_id', 'sale_type', 'subtotal', 'discount', 'tax', 'total', 'payment_method', 'payment_status'];

    protected $casts = ['subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'tax' => 'decimal:2', 'total' => 'decimal:2'];

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
