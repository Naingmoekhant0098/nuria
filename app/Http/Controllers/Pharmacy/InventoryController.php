<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\DrugBatch;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('pharmacy.drugs.index');
    }

    public function drugs(): Response
    {
        $clinicId = auth()->user()->id;

        return Inertia::render('inventory/index', [
            'drugStock' => ClinicDrug::query()
                ->with('drug')
                ->where('clinic_id', $clinicId)
                ->get()
                ->map(fn (ClinicDrug $clinicDrug) => [
                    'drug' => $clinicDrug->drug,
                    'is_active' => $clinicDrug->is_active,
                    'available_base_quantity' => DrugBatch::query()->where('clinic_id', $clinicId)->where('drug_id', $clinicDrug->drug_id)->where('expiry_date', '>', today())->sum('quantity'),
                ]),
            'batches' => [], 'medicalStock' => [], 'sales' => ['data' => []],
        ]);
    }

    public function stock(): Response
    {
        $clinicId = auth()->user()->id;

        return Inertia::render('pharmacy/stock', ['batches' => DrugBatch::query()->with('drug')->where('clinic_id', $clinicId)->orderBy('expiry_date')->get(), 'medicalStock' => ClinicMedicalProduct::query()->with('product')->where('clinic_id', $clinicId)->get()]);
    }

    public function sales(): Response
    {
        return Inertia::render('pharmacy/sales', ['sales' => Sale::query()->with(['items', 'reservation.patient'])->where('clinic_id', auth()->user()->id)->latest()->paginate(20)]);
    }
}
