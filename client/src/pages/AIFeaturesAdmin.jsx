import React from "react";
import StockManagement from "./StockManagement";

const AIFeaturesAdmin = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">

                    <h1 className="text-2xl lg:text-3xl font-black">
                        Admin Stock
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Monitor low stock products and update inventory
                    </p>

                </div>


                {/* Stock Management */}
                <StockManagement />

            </div>

        </div>
    );
};

export default AIFeaturesAdmin;