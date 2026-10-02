<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\MedicalProduct;
 
use Inertia\Inertia;
use Inertia\Response;

class ClientShopController extends Controller
{
    public function index(): Response
    {
        $products = MedicalProduct::query()
            ->where('status', 'active')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Client/Shop/Index', [
            'products' => $products,
        ]);
    }

    public function show(MedicalProduct $product): Response
    {
        abort_unless(
            $product->status === 'active',
            404
        );

        return Inertia::render('Client/Shop/Show', [
            'product' => $product,
        ]);
    }

    public function cart(): Response
    {
        $patient = auth('patient')->user();

        $cart = $patient->cart()
            ->with('items.product')
            ->first();

        return Inertia::render('Client/Shop/Cart', [
            'cart' => $cart,
        ]);
    }

    public function orders(): Response
    {
        $orders = auth('patient')
            ->user()
            ->sales()
            ->latest()
            ->paginate(10);

        return Inertia::render('Client/Shop/Orders', [
            'orders' => $orders,
        ]);
    }

    public function order($sale): Response
    {
        $order = auth('patient')
            ->user()
            ->sales()
            ->with('items.product')
            ->findOrFail($sale);

        return Inertia::render('Client/Shop/Order', [
            'order' => $order,
        ]);
    }
}
