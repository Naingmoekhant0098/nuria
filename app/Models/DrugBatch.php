<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DrugBatch extends Model
{
    protected $fillable = ['clinic_id', 'drug_id', 'batch_number', 'expiry_date', 'purchase_price', 'quantity'];

    protected $casts = ['expiry_date' => 'date', 'purchase_price' => 'decimal:2'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }
}
