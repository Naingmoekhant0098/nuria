<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'item_type', 'drug_id', 'drug_unit_id', 'medical_product_id', 'description', 'quantity', 'base_quantity', 'unit_price', 'line_total'];
}
