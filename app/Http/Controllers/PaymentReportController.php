<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentReportController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('payment-report/index', [
            'payments' => Payment::query()
                ->with('reservation.patient')
                ->whereHas('reservation', fn ($query) => $query->where('clinic_id', auth()->user()->id))
                ->latest()
                ->paginate($request->integer('limit', 15))
                ->withQueryString(),
        ]);
    }
}
