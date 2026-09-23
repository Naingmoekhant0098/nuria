<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    protected $fillable = ['clinic_id', 'drug_id', 'medical_product_id', 'drug_batch_id', 'sale_id', 'transaction_type', 'quantity', 'reference'];
}
