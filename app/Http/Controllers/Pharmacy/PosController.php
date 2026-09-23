<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\StoreSaleRequest;
use App\Models\ClinicDrug;
use App\Models\ClinicMedicalProduct;
use App\Models\Consultation;
use App\Models\DrugBatch;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\Reservation;
use App\Pharmacy\CheckoutSaleAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $clinicId = auth()->user()->id;
        $drugs = ClinicDrug::query()->with(['drug.units' => fn ($query) => $query->where('is_active', true)])->where('clinic_id', $clinicId)->where('is_active', true)->get()->map(function (ClinicDrug $clinicDrug) use ($clinicId) {
            $clinicDrug->setAttribute('available_base_quantity', DrugBatch::query()->where('clinic_id', $clinicId)->where('drug_id', $clinicDrug->drug_id)->where('expiry_date', '>', today())->sum('quantity'));

            return $clinicDrug;
        });

        $checkoutContext = null;
        if ($request->filled('consultation')) {
            $consultation = Consultation::query()
                ->with([
                    'reservation.patient',
                    'prescription.items.drug',
                    'prescription.items.unit',
                    'prescription.items.medicalProduct',
                ])
                ->whereHas('reservation', fn ($query) => $query->where('clinic_id', $clinicId))
                ->findOrFail($request->integer('consultation'));
            $checkoutContext = [
                'consultation_id' => $consultation->id,
                'reservation_id' => $consultation->reservation->id,
                'patient_id' => $consultation->reservation->patient_id,
                'prescription_id' => $consultation->prescription?->id,
                'items' => $consultation->prescription?->items->map(fn ($item): array => [
                    'key' => "prescription-{$item->id}",
                    'item_type' => $item->item_type,
                    'drug_id' => $item->drug_id,
                    'drug_unit_id' => $item->drug_unit_id,
                    'medical_product_id' => $item->medical_product_id,
                    'description' => $item->item_type === 'drug'
                        ? "{$item->drug?->name} ({$item->unit?->unit_name})"
                        : $item->medicalProduct?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                ])->values() ?? [],
            ];
        }

        return Inertia::render('pos/index', ['drugs' => $drugs, 'medicalProducts' => ClinicMedicalProduct::query()->with('product')->where('clinic_id', $clinicId)->where('is_active', true)->get(), 'reservations' => Reservation::query()->with('patient')->where('clinic_id', $clinicId)->where('status', 'Checked In')->get(), 'patients' => Patient::query()->orderBy('first_name')->get(['id', 'first_name', 'last_name']), 'prescriptions' => Prescription::query()->where('clinic_id', $clinicId)->with('items.drug')->get(), 'checkoutContext' => $checkoutContext]);
    }

    public function store(StoreSaleRequest $request, CheckoutSaleAction $checkout): RedirectResponse
    {
        $sale = $checkout->execute(auth()->user()->id, $request->validated());

        return redirect()->route('pos.index')->with('success', "Sale #{$sale->id} completed.");
    }
}
