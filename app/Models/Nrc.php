<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nrc extends Model
{
    protected $fillable = ['nrc_state_id', 'nrc_township_id', 'nrc_type_id'];

    public function state()
    {
        return $this->belongsTo(NrcState::class, 'nrc_state_id');
    }

    public function township()
    {
        return $this->belongsTo(NrcTownship::class, 'nrc_township_id');
    }

    public function type()
    {
        return $this->belongsTo(NrcType::class, 'nrc_type_id');
    }

    public function customers()
    {
        return $this->hasMany(User::class, 'nrc_id');
    }
}
