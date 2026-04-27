"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import OrderSlideOver from "./OrderSlideOver";

const IcmimarAIAssistant = dynamic(() => import("./IcmimarAIAssistant"), { ssr: false });

export default function IcmimarClientWrapper() {
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
            <IcmimarAIAssistant />
            <OrderSlideOver 
                isOpen={isOrderSlideOpen} 
                onClose={() => setIsOrderSlideOpen(false)} 
                order={null}
            />
        </>
    );
}
