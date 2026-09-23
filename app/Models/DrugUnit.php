<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DrugUnit extends Model
{
    protected $fillable = ['drug_id', 'unit_name', 'conversion_quantity', 'sale_price', 'is_default', 'is_active'];

    protected $casts = ['sale_price' => 'decimal:2', 'is_default' => 'boolean', 'is_active' => 'boolean'];

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }
}
