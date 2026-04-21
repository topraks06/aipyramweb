"use client";

import { useState, useEffect } from "react";
import PerdeAIAssistant from "./PerdeAIAssistant";
import { OrderSlideOver } from "./OrderSlideOver";

export default function PerdeClientWrapper() {
    const [isOrderSlideOpen, setIsOrderSlideOpen] = useState(false);
    const [aiSuggested, setAiSuggested] = useState<string[]>([]);

    useEffect(() => {
        const handleOpenOrder = (e: any) => {
            if (e.detail?.aiSuggestedItems) {
                setAiSuggested(e.detail.aiSuggestedItems);
            }
            setIsOrderSlideOpen(true);
        };
        
        window.addEventListener("open_order_slide", handleOpenOrder);
        return () => window.removeEventListener("open_order_slide", handleOpenOrder);
    }, []);

    return (
        <>
            <PerdeAIAssistant />
            <OrderSlideOver 
                isOpen={isOrderSlideOpen} 
                onClose={() => setIsOrderSlideOpen(false)} 
                aiSuggestedProducts={aiSuggested} 
            />
        </>
    );
}
