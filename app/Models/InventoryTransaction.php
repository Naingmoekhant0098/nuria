<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    protected $fillable = ['clinic_id', 'drug_id', 'medical_product_id', 'drug_batch_id', 'sale_id', 'transaction_type', 'quantity', 'reference'];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function medicalProduct(): BelongsTo
    {
        return $this->belongsTo(MedicalProduct::class);
    }
}
